import { maxTick, minTick, tickToPrice } from "@osmosis-labs/math";
import { AssetList, Chain } from "@osmosis-labs/types";
import { Dec, Int } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { cached, type CacheEntry } from "../../../utils/cached";
import { queryLiquidityPerTickRange } from "../../osmosis";
import {
  queryOrderbookTicksSQS,
  SQSOrderbookTick,
} from "../../sidecar/orderbooks";
import { getOrderbookState } from "../orderbooks/orderbook-state";
import { getOrderbookPools } from "../orderbooks/pools";
import { ClPoolDepthInput, clQuantitiesOnLevels } from "./cl-depth";
import { getPoolsFromSidecar } from "./providers/sidecar";

export type DepthDataPoint = {
  price: number;
  depth: number;
  source: "cl" | "gamm" | "orderbook";
};

export type OrderbookLevel = {
  price: number;
  quantity: number;
  cumulative: number;
  /**
   * Liquidity from concentrated-liquidity pools for the same pair between
   * the previous level and this one, in human base amounts. Not part of
   * `quantity` or `cumulative`, which are resting orders only.
   */
  clQuantity?: number;
};

export type GroupingOption = { label: string; value: number };

export type PairDepthResult = {
  depthData: DepthDataPoint[];
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  midPrice: number;
  bidPrice: number;
  askPrice: number;
  yRange: [number, number];
  xRange: [number, number];
  groupingOptions: GroupingOption[];
  /** True when the result is a no-data sentinel (orderbook not found, mid-price unavailable, etc.) rather than a live empty book */
  unavailable?: boolean;
  /** CL pools whose liquidity is included in the levels' `clQuantity`. */
  clPoolIds?: string[];
  /** True when CL liquidity could not be loaded; levels are orderbook only. */
  clUnavailable?: boolean;
};

const pairDepthCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

function formatGroupLabel(value: number): string {
  if (value >= 1000)
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 1) return value.toFixed(value % 1 === 0 ? 0 : 2);
  // For small decimals, show enough significant digits without scientific notation
  const s = value.toPrecision(1);
  return s.includes("e") ? value.toFixed(20).replace(/\.?0+$/, "") : s;
}

export function aggregateLevels(
  levels: OrderbookLevel[],
  bucketSize: number,
  side: "bid" | "ask"
): OrderbookLevel[] {
  if (bucketSize <= 0 || levels.length === 0) return levels;

  // Bids round down and asks round up, so a bucket never shows a better
  // price than its orders and the grouped book cannot cross. The epsilon
  // keeps float error (0.3 / 0.1 = 2.9999…) from moving a price that sits
  // exactly on a bucket boundary.
  const buckets = new Map<number, number>();
  for (const { price, quantity } of levels) {
    const steps = price / bucketSize;
    const bucket =
      (side === "bid" ? Math.floor(steps + 1e-9) : Math.ceil(steps - 1e-9)) *
      bucketSize;
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + quantity);
  }

  // Sort: bids desc, asks asc
  const sorted = [...buckets.entries()].sort(([a], [b]) =>
    side === "bid" ? b - a : a - b
  );

  // Rebuild cumulative
  if (side === "bid") {
    let cum = 0;
    return sorted.map(([price, quantity]) => {
      cum += quantity;
      return { price, quantity, cumulative: cum };
    });
  } else {
    const total = sorted.reduce((s, [, q]) => s + q, 0);
    let cum = total;
    return sorted.map(([price, quantity]) => {
      const cumulative = cum;
      cum -= quantity;
      return { price, quantity, cumulative };
    });
  }
}

function tickToHumanPrice(
  tickId: number,
  normalizationFactor: Dec
): number | undefined {
  try {
    const price = Number(
      tickToPrice(new Int(tickId)).quo(normalizationFactor).toString()
    );
    return price > 0 && Number.isFinite(price) ? price : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Builds raw (unaggregated) depth levels from orderbook ticks.
 *
 * Bid liquidity is held in the quote denom and ask liquidity in the base denom,
 * both as minimal-denom integer strings. Both sides are returned as human base
 * amounts. Only bid ticks at or below `nextBidTick` and ask ticks at or above
 * `nextAskTick` are used, so the levels stay consistent with the best bid/ask
 * read from the contract even if the tick source lags it slightly.
 *
 * Bids are sorted best (highest) first with cumulative depth from the best bid
 * outward. Asks are sorted best (lowest) first with `cumulative` left at 0 for
 * the caller to fill.
 */
export function buildOrderbookLevels({
  ticks,
  nextBidTick,
  nextAskTick,
  baseDecimals,
  quoteDecimals,
}: {
  ticks: SQSOrderbookTick[];
  nextBidTick: number;
  nextAskTick: number;
  baseDecimals: number;
  quoteDecimals: number;
}): { bids: OrderbookLevel[]; asks: OrderbookLevel[] } {
  const normalizationFactor = new Dec(10).pow(
    new Int(quoteDecimals - baseDecimals)
  );
  const baseScale = Math.pow(10, baseDecimals);
  const quoteScale = Math.pow(10, quoteDecimals);

  const bidTicks = ticks
    .filter((t) => t.tick_id <= nextBidTick)
    .sort((a, b) => b.tick_id - a.tick_id);
  const askTicks = ticks
    .filter((t) => t.tick_id >= nextAskTick)
    .sort((a, b) => a.tick_id - b.tick_id);

  const bids: OrderbookLevel[] = [];
  let cumBid = 0;
  for (const tick of bidTicks) {
    const liquidity = Number(
      tick.tick_state.bid_values.total_amount_of_liquidity
    );
    if (!(liquidity > 0)) continue;
    const humanPrice = tickToHumanPrice(tick.tick_id, normalizationFactor);
    if (humanPrice === undefined) continue;
    // bid liquidity is in quote minimal units → convert to base human amount
    const baseAmount = liquidity / quoteScale / humanPrice;
    cumBid += baseAmount;
    bids.push({ price: humanPrice, quantity: baseAmount, cumulative: cumBid });
  }

  const asks: OrderbookLevel[] = [];
  for (const tick of askTicks) {
    const liquidity = Number(
      tick.tick_state.ask_values.total_amount_of_liquidity
    );
    if (!(liquidity > 0)) continue;
    const humanPrice = tickToHumanPrice(tick.tick_id, normalizationFactor);
    if (humanPrice === undefined) continue;
    // ask liquidity is in base minimal units → convert to base human amount
    asks.push({
      price: humanPrice,
      quantity: liquidity / baseScale,
      cumulative: 0,
    });
  }

  return { bids, asks };
}

/**
 * Best bid, best ask and mid from levels sorted best first, as
 * `buildOrderbookLevels` returns them.
 *
 * The contract's `next_bid_tick` and `next_ask_tick` only move outward:
 * cancelling the last order at a tick leaves the pointer there, so it can sit
 * well past the best tick that still has liquidity. Reading the spread from
 * the pointers would show one that doesn't exist. A side with no levels is 0,
 * so no spread is shown, and the mid is the other side's best price.
 */
export function bestPricesFromLevels(
  bids: OrderbookLevel[],
  asks: OrderbookLevel[]
): { bidPrice: number; askPrice: number; midPrice: number } {
  const bidPrice = bids[0]?.price ?? 0;
  const askPrice = asks[0]?.price ?? 0;
  const midPrice =
    bidPrice > 0 && askPrice > 0
      ? (bidPrice + askPrice) / 2
      : bidPrice || askPrice;
  return { bidPrice, askPrice, midPrice };
}

export function getPairDepth({
  poolId,
  bucketSize,
  includeCl = false,
  assetLists,
  chainList,
}: {
  poolId: string;
  bucketSize?: number;
  /** Include concentrated-liquidity pool depth for the pair. */
  includeCl?: boolean;
  assetLists: AssetList[];
  chainList: Chain[];
}): Promise<PairDepthResult> {
  return cached({
    cache: pairDepthCache,
    key: `pairDepth-${poolId}-${bucketSize ?? 0}-${includeCl ? "cl" : "ob"}`,
    ttl: 1000 * 30,
    getFreshValue: () =>
      computePairDepth({
        poolId,
        bucketSize,
        includeCl,
        assetLists,
        chainList,
      }),
  });
}

async function computePairDepth({
  poolId,
  bucketSize,
  includeCl,
  assetLists,
  chainList,
}: {
  poolId: string;
  bucketSize?: number;
  includeCl: boolean;
  assetLists: AssetList[];
  chainList: Chain[];
}): Promise<PairDepthResult> {
  const empty: PairDepthResult = {
    depthData: [],
    bids: [],
    asks: [],
    midPrice: 0,
    bidPrice: 0,
    askPrice: 0,
    yRange: [0, 0],
    xRange: [0, 0],
    groupingOptions: [],
  };

  // 1. Look up the orderbook to get base/quote denoms + contract address
  const allOrderbooks = await getOrderbookPools();
  const orderbook = allOrderbooks.find((ob) => ob.poolId === poolId);
  if (!orderbook) return { ...empty, unavailable: true };

  const { contractAddress, baseDenom, quoteDenom } = orderbook;

  // Tick prices are always quote-per-base in the contract's own orientation.
  // The pool display flips stablecoin-base books to volatile/stable, but the
  // depth math below does not invert prices or swap sides, so such a book
  // would be shown with wrong prices and sides. Report it as unavailable
  // until inversion is implemented rather than show wrong depth.
  const baseAsset = getAssetFromAssetList({
    coinMinimalDenom: baseDenom,
    assetLists,
  });
  const quoteAsset = getAssetFromAssetList({
    coinMinimalDenom: quoteDenom,
    assetLists,
  });
  const isStableBaseBook =
    Boolean(baseAsset?.rawAsset.pegMechanism) &&
    !quoteAsset?.rawAsset.pegMechanism;
  if (isStableBaseBook) return { ...empty, unavailable: true };

  // Without both exponents every price and quantity would be off by a power
  // of ten, so never guess them.
  if (!baseAsset || !quoteAsset) {
    console.error("[pair-depth] missing asset metadata", {
      poolId,
      baseDenom,
      quoteDenom,
    });
    return { ...empty, unavailable: true };
  }
  const baseDecimals = baseAsset.decimals;
  const quoteDecimals = quoteAsset.decimals;

  // 2. Get current best bid/ask tick IDs from the contract, and every tick
  // with liquidity from SQS, in parallel.
  // CL liquidity for the same pair is optional: a failure leaves the book
  // as orderbook depth only, flagged so the UI can say so.
  // Skipped entirely when the caller asked for orders only.
  const clPoolsPromise = includeCl
    ? getClPoolsForPair({
        baseDenom,
        quoteDenom,
        assetLists,
        chainList,
      }).catch((e) => {
        console.error("[pair-depth] CL liquidity fetch failed", e);
        return null;
      })
    : Promise.resolve([]);
  const [orderbookState, ticksResult] = await Promise.all([
    getOrderbookState({
      orderbookAddress: contractAddress,
      chainList,
    }),
    // Network and gateway failures throw so the cache does not keep them
    // and React Query keeps the previous successful data (keepPreviousData).
    queryOrderbookTicksSQS({ poolId }),
  ]);

  if (ticksResult.status === "unavailable") {
    console.warn("[pair-depth] SQS orderbook ticks unavailable", {
      poolId,
      reason: ticksResult.reason,
    });
    // Ticks not ingested yet (503) or malformed (500) may clear on the next
    // poll: throw, so neither the cache nor React Query replaces the last
    // good book with "unavailable". With no book yet, the client shows the
    // error as unavailable. A pool SQS doesn't know as an orderbook (404)
    // won't change, so it is returned and cached as unavailable.
    if (ticksResult.reason !== "not-orderbook") {
      throw new Error(
        `SQS orderbook ticks unavailable for pool ${poolId}: ${ticksResult.reason}`
      );
    }
    return { ...empty, unavailable: true };
  }

  // normalizationFactor converts raw tick price → human price:
  // human_price = raw_price / normalizationFactor
  const normalizationFactor = new Dec(10).pow(
    new Int(quoteDecimals - baseDecimals)
  );

  let midPrice = 0;
  let bidPrice = 0;
  let askPrice = 0;
  try {
    bidPrice = Number(
      tickToPrice(new Int(orderbookState.next_bid_tick))
        .quo(normalizationFactor)
        .toString()
    );
    askPrice = Number(
      tickToPrice(new Int(orderbookState.next_ask_tick))
        .quo(normalizationFactor)
        .toString()
    );
    midPrice = (bidPrice + askPrice) / 2;
  } catch {
    // ticks may be at extremes if book is empty
  }

  if (midPrice <= 0) return { ...empty, unavailable: true };

  const { bids: rawBids, asks: rawAsks } = buildOrderbookLevels({
    ticks: ticksResult.ticks,
    nextBidTick: orderbookState.next_bid_tick,
    nextAskTick: orderbookState.next_ask_tick,
    baseDecimals,
    quoteDecimals,
  });

  // The contract's pointers can sit past real liquidity, so best bid and ask
  // always come from the levels: an empty side has no best price. Only an
  // entirely empty book keeps the pointers' mid, to size grouping options.
  const best = bestPricesFromLevels(rawBids, rawAsks);
  bidPrice = best.bidPrice;
  askPrice = best.askPrice;
  if (rawBids.length > 0 || rawAsks.length > 0) midPrice = best.midPrice;

  // Asks: cumulative builds from outermost inward so fill bar grows toward mid.
  // aggregateLevels handles this internally when bucketing; do it manually otherwise.
  let asks: OrderbookLevel[];
  if (bucketSize) {
    asks = aggregateLevels(rawAsks, bucketSize, "ask");
  } else {
    const total = rawAsks.reduce((s, a) => s + a.quantity, 0);
    let cum = total;
    asks = rawAsks.map((a) => {
      const cumulative = cum;
      cum -= a.quantity;
      return { ...a, cumulative };
    });
  }

  const bids = bucketSize
    ? aggregateLevels(rawBids, bucketSize, "bid")
    : rawBids;

  const clPools = await clPoolsPromise;
  if (clPools && clPools.length > 0) {
    const cl = clQuantitiesOnLevels({
      pools: clPools.map(({ depth }) => depth),
      midPrice,
      bidPrices: bids.map((l) => l.price),
      askPrices: asks.map((l) => l.price),
      baseDecimals,
      quoteDecimals,
    });
    bids.forEach((l, i) => (l.clQuantity = cl.bids[i]));
    asks.forEach((l, i) => (l.clQuantity = cl.asks[i]));
  }
  const clInfo = {
    clPoolIds: clPools?.map(({ poolId }) => poolId) ?? [],
    clUnavailable: clPools === null,
  };

  if (bids.length === 0 && asks.length === 0)
    return { ...empty, midPrice, bidPrice, askPrice, ...clInfo };

  // 6. Build depthData for the chart
  const depthData: DepthDataPoint[] = [
    ...bids.map(({ price, quantity }) => ({
      price,
      depth: quantity,
      source: "orderbook" as const,
    })),
    ...asks.map(({ price, quantity }) => ({
      price,
      depth: quantity,
      source: "orderbook" as const,
    })),
  ].sort((a, b) => a.price - b.price);

  const allPrices = depthData.map((d) => d.price);
  if (allPrices.length === 0) return { ...empty, midPrice, bidPrice, askPrice };
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const maxDepth = Math.max(...depthData.map((d) => d.depth));

  // Derive grouping options from the order of magnitude of midPrice.
  // e.g. mid=$94,000 → magnitude=10,000 → options: 1, 10, 100
  //      mid=$0.50   → magnitude=0.1    → options: 0.0001, 0.001, 0.01
  const magnitude = Math.pow(10, Math.floor(Math.log10(midPrice)));
  const groupingOptions: GroupingOption[] = [
    { label: formatGroupLabel(magnitude * 0.01), value: magnitude * 0.01 },
    { label: formatGroupLabel(magnitude * 0.1), value: magnitude * 0.1 },
    { label: formatGroupLabel(magnitude), value: magnitude },
  ];

  return {
    depthData,
    bids,
    asks,
    midPrice,
    bidPrice,
    askPrice,
    yRange: [minPrice, maxPrice],
    xRange: [0, maxDepth * 1.2],
    groupingOptions,
    ...clInfo,
  };
}

/**
 * Sqrt price of a CL tick, as a float for depth display. Ticks beyond the
 * range tickToPrice supports (full-range positions on the extended range)
 * are clamped; that only moves range ends at prices far outside any visible
 * level.
 */
function tickToSqrtPriceClamped(tick: string): number {
  let t = new Int(tick);
  if (t.lt(minTick)) t = minTick;
  if (t.gt(maxTick)) t = maxTick;
  return Math.sqrt(Number(tickToPrice(t).toString()));
}

/** At most this many CL pools are read per pair, highest liquidity first. */
const MAX_CL_POOLS = 3;

/**
 * CL pools trading exactly the book's base and quote (in either order), with
 * their tick ranges converted for depth maths. Throws if any read fails, so
 * partial CL depth is never shown as complete.
 */
async function getClPoolsForPair({
  baseDenom,
  quoteDenom,
  assetLists,
  chainList,
}: {
  baseDenom: string;
  quoteDenom: string;
  assetLists: AssetList[];
  chainList: Chain[];
}): Promise<{ poolId: string; depth: ClPoolDepthInput }[]> {
  const { data: pools } = await getPoolsFromSidecar({
    assetLists,
    chainList,
    denoms: [baseDenom, quoteDenom],
    types: ["concentrated"],
  });

  const matching = pools
    .filter((pool) => {
      const raw = pool.raw as {
        token0?: string;
        token1?: string;
        current_sqrt_price?: string;
      };
      return (
        ((raw.token0 === baseDenom && raw.token1 === quoteDenom) ||
          (raw.token0 === quoteDenom && raw.token1 === baseDenom)) &&
        // A pool that has never had liquidity has no price and adds nothing.
        Number(raw.current_sqrt_price) > 0
      );
    })
    .sort((a, b) =>
      b.totalFiatValueLocked.toDec().gt(a.totalFiatValueLocked.toDec()) ? 1 : -1
    )
    .slice(0, MAX_CL_POOLS);

  return Promise.all(
    matching.map(async (pool) => {
      const raw = pool.raw as { token0: string; current_sqrt_price: string };
      const currentSqrtPrice = Number(raw.current_sqrt_price);
      const { liquidity } = await queryLiquidityPerTickRange({
        poolId: pool.id,
        chainList,
      });
      return {
        poolId: pool.id,
        depth: {
          currentSqrtPrice,
          token0IsBase: raw.token0 === baseDenom,
          ranges: liquidity.map(
            ({ lower_tick, upper_tick, liquidity_amount }) => ({
              lowerSqrtPrice: tickToSqrtPriceClamped(lower_tick),
              upperSqrtPrice: tickToSqrtPriceClamped(upper_tick),
              liquidity: Number(liquidity_amount),
            })
          ),
        },
      };
    })
  );
}
