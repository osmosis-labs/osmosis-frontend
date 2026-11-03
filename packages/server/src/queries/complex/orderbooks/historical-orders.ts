import { tickToPrice } from "@osmosis-labs/math";
import { AssetList, Chain } from "@osmosis-labs/types";
import { Dec, Int } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import {
  HistoricalLimitOrder,
  queryHistoricalOrders,
} from "../../data-services";
import { getOrderbookDenoms } from "./denoms";
import type { MappedLimitOrder, OrderStatus } from "./types";

dayjs.extend(utc);

const orderbookHistoricalOrdersCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export function getOrderbookHistoricalOrders({
  userOsmoAddress,
  assetLists,
  chainList,
}: {
  userOsmoAddress: string;
  assetLists: AssetList[];
  chainList: Chain[];
}) {
  return cachified({
    cache: orderbookHistoricalOrdersCache,
    key: `orderbookHistoricalOrders-${userOsmoAddress}`,
    ttl: 1000 * 5, // 5 seconds
    getFreshValue: () =>
      queryHistoricalOrders(userOsmoAddress).then((orders) =>
        mapHistoricalToMapped(orders, userOsmoAddress, assetLists, chainList)
      ),
  });
}

/**
 * Gets an object containing a mapping between an orderbook address and it's quote and base asset.
 * Each orderbook address is fetched once and only those present in the provided orders are queried.
 */
async function getRelevantOrderbookDenoms(
  historicalOrders: HistoricalLimitOrder[],
  assetLists: AssetList[],
  chainList: Chain[]
): Promise<
  Record<
    string,
    {
      quoteAsset: ReturnType<typeof getAssetFromAssetList>;
      baseAsset: ReturnType<typeof getAssetFromAssetList>;
    }
  >
> {
  const orderbookAddresses = [
    ...new Set(historicalOrders.map(({ contract }) => contract)),
  ];

  const promises = orderbookAddresses.map(async (orderbookAddress) => {
    const denoms = await getOrderbookDenoms({
      orderbookAddress,
      assetLists,
      chainList,
    });
    return [orderbookAddress, denoms];
  });

  const orderbookDenoms: Record<
    string,
    {
      quoteAsset: ReturnType<typeof getAssetFromAssetList>;
      baseAsset: ReturnType<typeof getAssetFromAssetList>;
    }
  > = {};
  const orderbookDenomsArray = await Promise.all(promises);

  for (let i = 0; i < orderbookDenomsArray.length; i++) {
    const [contract, denoms]: any = orderbookDenomsArray[i];
    orderbookDenoms[contract] = denoms;
  }

  return orderbookDenoms;
}

/**
 * Data returned from the Numia query does not exactly match the interface used by the webapp.
 * This function maps the Numia data to the webapp interface.
 */
async function mapHistoricalToMapped(
  historicalOrders: HistoricalLimitOrder[],
  userAddress: string,
  assetLists: AssetList[],
  chainList: Chain[]
): Promise<MappedLimitOrder[]> {
  const orderbookDenoms = await getRelevantOrderbookDenoms(
    historicalOrders,
    assetLists,
    chainList
  );
  return historicalOrders.map((o) => {
    const { quoteAsset, baseAsset } = orderbookDenoms[o.contract];
    const price = tickToPrice(new Int(o.tick_id));
    // Numia's `quantity` is a cancelled order's unfilled input, which was returned, and
    // `claimed_quantity` its filled input. A fully claimed order's `quantity` is the whole order.
    // As with active orders, `quantity` below is what was left unfilled.
    const isCancelled = o.status === "cancelled";
    const totalFilled = parseInt(isCancelled ? o.claimed_quantity : o.quantity);
    const quantity = isCancelled ? parseInt(o.quantity) : 0;
    const placedQuantity = totalFilled + quantity;
    // A real order never sums to zero, but a throw here would hide the user's whole history.
    const percentFilled =
      placedQuantity === 0
        ? new Dec(0)
        : new Dec(totalFilled).quo(new Dec(placedQuantity));
    const output =
      o.order_direction === "bid"
        ? new Dec(placedQuantity).quo(price)
        : new Dec(placedQuantity).mul(price);

    const normalizationFactor = new Dec(10).pow(
      new Int((quoteAsset?.decimals ?? 0) - (baseAsset?.decimals ?? 0))
    );

    return {
      quoteAsset,
      baseAsset,
      etas: "0",
      order_direction: o.order_direction,
      order_id: parseInt(o.order_id),
      owner: userAddress,
      // Numia sends UTC timestamps without a zone marker ("2026-11-02 23:34:44"),
      // and this can run in the browser, so parse as UTC rather than local time.
      placed_at: dayjs
        .utc(
          o.place_timestamp && o.place_timestamp.length > 0
            ? o.place_timestamp
            : 0
        )
        .unix(),
      placed_quantity: placedQuantity,
      quantity,
      price: price.quo(normalizationFactor),
      status: o.status as OrderStatus,
      tick_id: parseInt(o.tick_id),
      output,
      // Everything a past order filled has been paid out, so claimed equals filled.
      percentClaimed: percentFilled,
      percentFilled,
      totalFilled,
      orderbookAddress: o.contract,
      placed_tx: o.place_tx_hash,
    };
  });
}
