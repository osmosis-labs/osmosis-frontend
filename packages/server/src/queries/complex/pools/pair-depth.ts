import { tickToPrice } from "@osmosis-labs/math";
import { AssetList, Chain } from "@osmosis-labs/types";
import { Dec, Int } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryOrderbookAllTicks } from "../../osmosis";
import { getOrderbookState } from "../orderbooks/orderbook-state";
import { getOrderbookPools } from "../orderbooks/pools";

export type DepthDataPoint = {
  price: number;
  depth: number;
  source: "cl" | "gamm" | "orderbook";
};

export type OrderbookLevel = {
  price: number;
  quantity: number;
  cumulative: number;
};

export type PairDepthResult = {
  depthData: DepthDataPoint[];
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  midPrice: number;
  bidPrice: number;
  askPrice: number;
  yRange: [number, number];
  xRange: [number, number];
};

const pairDepthCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);


export function getPairDepth({
  poolId,
  assetLists,
  chainList,
}: {
  poolId: string;
  assetLists: AssetList[];
  chainList: Chain[];
}): Promise<PairDepthResult> {
  return cachified({
    cache: pairDepthCache,
    key: `pairDepth-${poolId}`,
    ttl: 1000 * 10,
    getFreshValue: () =>
      computePairDepth({ poolId, assetLists, chainList }),
  });
}

async function computePairDepth({
  poolId,
  assetLists,
  chainList,
}: {
  poolId: string;
  assetLists: AssetList[];
  chainList: Chain[];
}): Promise<PairDepthResult> {
  const empty: PairDepthResult = { depthData: [], bids: [], asks: [], midPrice: 0, bidPrice: 0, askPrice: 0, yRange: [0, 0], xRange: [0, 0] };

  // 1. Look up the orderbook to get base/quote denoms + contract address
  const allOrderbooks = await getOrderbookPools();
  const orderbook = allOrderbooks.find((ob) => ob.poolId === poolId);
  if (!orderbook) return empty;

  const { contractAddress } = orderbook;

  // Normalize base/quote: if base is a stablecoin and quote is not, swap them
  // so price is always expressed as quote-per-base (volatile/stable).
  const rawBaseAsset = getAssetFromAssetList({ coinMinimalDenom: orderbook.baseDenom, assetLists });
  const rawQuoteAsset = getAssetFromAssetList({ coinMinimalDenom: orderbook.quoteDenom, assetLists });
  const shouldSwap = Boolean(rawBaseAsset?.rawAsset.pegMechanism) && !rawQuoteAsset?.rawAsset.pegMechanism;
  const baseDenom = shouldSwap ? orderbook.quoteDenom : orderbook.baseDenom;
  const quoteDenom = shouldSwap ? orderbook.baseDenom : orderbook.quoteDenom;

  // 2. Get current best bid/ask tick IDs
  const orderbookState = await getOrderbookState({
    orderbookAddress: contractAddress,
    chainList,
  });

  const baseAsset = getAssetFromAssetList({ coinMinimalDenom: baseDenom, assetLists });
  const quoteAsset = getAssetFromAssetList({ coinMinimalDenom: quoteDenom, assetLists });
  const baseDecimals = baseAsset?.decimals ?? 0;
  const quoteDecimals = quoteAsset?.decimals ?? 0;

  // normalizationFactor converts raw tick price → human price:
  // human_price = raw_price / normalizationFactor
  const normalizationFactor = new Dec(10).pow(new Int(quoteDecimals - baseDecimals));

  let midPrice = 0;
  let bidPrice = 0;
  let askPrice = 0;
  try {
    bidPrice = Number(tickToPrice(new Int(orderbookState.next_bid_tick)).quo(normalizationFactor).toString());
    askPrice = Number(tickToPrice(new Int(orderbookState.next_ask_tick)).quo(normalizationFactor).toString());
    midPrice = (bidPrice + askPrice) / 2;
  } catch {
    // ticks may be at extremes if book is empty
  }

  if (midPrice <= 0) return empty;

  const nextBidTick = orderbookState.next_bid_tick;
  const nextAskTick = orderbookState.next_ask_tick;

  // 3. Use AllTicks to fetch only ticks that actually have orders.
  // Bids: from (nextBidTick - TICK_RANGE) up to nextBidTick (descending price side).
  // Asks: from nextAskTick up to (nextAskTick + TICK_RANGE).
  // AllTicks returns only ticks with actual orders — no range bounding needed.
  // Bids: all ticks up to and including nextBidTick.
  // Asks: all ticks from nextAskTick upward.
  const [bidTicksResp, askTicksResp] = await Promise.all([
    queryOrderbookAllTicks({
      orderbookAddress: contractAddress,
      chainList,
      endAt: nextBidTick,
    }).then((r) => r.data.ticks).catch(() => []),
    queryOrderbookAllTicks({
      orderbookAddress: contractAddress,
      chainList,
      startFrom: nextAskTick,
    }).then((r) => r.data.ticks).catch(() => []),
  ]);

  const baseScale = Math.pow(10, baseDecimals);
  const quoteScale = Math.pow(10, quoteDecimals);

  // 4. Build bid levels — sorted desc by tick_id (highest price first = best bid first)
  const sortedBidTicks = [...bidTicksResp].sort((a, b) => b.tick_id - a.tick_id);
  const rawBids: OrderbookLevel[] = [];
  let cumBid = 0;
  for (const tick of sortedBidTicks) {
    const liquidity = Number(tick.tick_state.bid_values.total_amount_of_liquidity);
    if (liquidity <= 0) continue;
    let humanPrice: number;
    try {
      humanPrice = Number(tickToPrice(new Int(tick.tick_id)).quo(normalizationFactor).toString());
    } catch {
      continue;
    }
    if (humanPrice <= 0) continue;
    // bid liquidity is in quote minimal units → convert to base human amount
    const baseAmount = liquidity / quoteScale / humanPrice;
    cumBid += baseAmount;
    rawBids.push({ price: humanPrice, quantity: baseAmount, cumulative: cumBid });
  }

  // 5. Build ask levels — sorted asc by tick_id (lowest price first = best ask first)
  const sortedAskTicks = [...askTicksResp].sort((a, b) => a.tick_id - b.tick_id);
  const rawAsks: OrderbookLevel[] = [];
  for (const tick of sortedAskTicks) {
    const liquidity = Number(tick.tick_state.ask_values.total_amount_of_liquidity);
    if (liquidity <= 0) continue;
    let humanPrice: number;
    try {
      humanPrice = Number(tickToPrice(new Int(tick.tick_id)).quo(normalizationFactor).toString());
    } catch {
      continue;
    }
    if (humanPrice <= 0) continue;
    // ask liquidity is in base minimal units → convert to base human amount
    const baseAmount = liquidity / baseScale;
    rawAsks.push({ price: humanPrice, quantity: baseAmount, cumulative: 0 });
  }

  // Asks: cumulative builds from outermost inward so fill bar grows toward mid
  const totalAskDepth = rawAsks.reduce((s, a) => s + a.quantity, 0);
  let cumAsk = totalAskDepth;
  const asks: OrderbookLevel[] = rawAsks.map((a) => {
    const cumulative = cumAsk;
    cumAsk -= a.quantity;
    return { ...a, cumulative };
  });

  const bids = rawBids;

  if (bids.length === 0 && asks.length === 0) return { ...empty, midPrice, bidPrice, askPrice };

  // 6. Build depthData for the chart
  const depthData: DepthDataPoint[] = [
    ...bids.map(({ price, quantity }) => ({ price, depth: quantity, source: "orderbook" as const })),
    ...asks.map(({ price, quantity }) => ({ price, depth: quantity, source: "orderbook" as const })),
  ].sort((a, b) => a.price - b.price);

  const allPrices = depthData.map((d) => d.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const maxDepth = Math.max(...depthData.map((d) => d.depth));

  return {
    depthData,
    bids,
    asks,
    midPrice,
    bidPrice,
    askPrice,
    yRange: [minPrice, maxPrice],
    xRange: [0, maxDepth * 1.2],
  };
}
