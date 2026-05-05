import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryCanonicalOrderbooks } from "../../sidecar/orderbooks";

const orderbookPoolsCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export interface Orderbook {
  baseDenom: string;
  quoteDenom: string;
  contractAddress: string;
  poolId: string;
}

function fetchOrderbookPools(forceFresh = false) {
  return cachified({
    cache: orderbookPoolsCache,
    key: `orderbookPools`,
    ttl: 1000 * 60 * 60, // 1 hour
    forceFresh,
    getFreshValue: () =>
      queryCanonicalOrderbooks().then(async (data) => {
        return data.map((orderbook) => {
          return {
            baseDenom: orderbook.base,
            quoteDenom: orderbook.quote,
            contractAddress: orderbook.contract_address,
            poolId: orderbook.pool_id.toString(),
          };
        }) as Orderbook[];
      }),
  });
}

export function getOrderbookPools() {
  return fetchOrderbookPools(false);
}

export function getOrderbookPoolsFresh() {
  return fetchOrderbookPools(true);
}
