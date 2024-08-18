import { Dec, Int } from "@keplr-wallet/unit";
import { tickToPrice } from "@osmosis-labs/math";
import { AssetList, Chain } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import {
  HistoricalLimitOrder,
  queryHistoricalOrders,
} from "../../data-services";
import { getOrderbookDenoms } from "./denoms";
import type { MappedLimitOrder, OrderStatus } from "./types";

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
    ttl: 1000 * 2, // 2 seconds
    getFreshValue: () =>
      queryHistoricalOrders(userOsmoAddress).then(async (data) => {
        const orders = data;
        orders.forEach((o) => {
          if (o.status === "cancelled" && o.claimed_quantity !== "0") {
            const newOrder: HistoricalLimitOrder = {
              ...o,
              quantity: o.claimed_quantity,
              status: "fullyClaimed",
            };
            orders.push(newOrder);
          }
        });

        return await mapHistoricalToMapped(
          orders,
          userOsmoAddress,
          assetLists,
          chainList
        );
      }),
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
    const quantityMin = parseInt(o.quantity);
    const placedQuantityMin = parseInt(o.quantity);
    const price = tickToPrice(new Int(o.tick_id));
    const percentClaimed = new Dec(1);
    const output =
      o.order_direction === "bid"
        ? new Dec(placedQuantityMin).quo(price)
        : new Dec(placedQuantityMin).mul(price);

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
      placed_at:
        dayjs(
          o.place_timestamp && o.place_timestamp.length > 0
            ? o.place_timestamp
            : 0
        ).unix() * 1000,
      placed_quantity: parseInt(o.quantity),
      placedQuantityMin,
      quantityMin,
      quantity: parseInt(o.quantity),
      price: price.quo(normalizationFactor),
      status: o.status as OrderStatus,
      tick_id: parseInt(o.tick_id),
      output,
      percentClaimed,
      percentFilled: new Dec(1),
      totalFilled: parseInt(o.quantity),
      orderbookAddress: o.contract,
      placed_tx: o.place_tx_hash,
    };
  });
}
