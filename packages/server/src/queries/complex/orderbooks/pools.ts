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
    // A forced-fresh read exists to catch a just-created orderbook that the
    // cached list predates, and cachified writes its result back to the
    // shared cache. Write it with a short TTL: if the sidecar hasn't ingested
    // the new pool yet, the pre-creation list re-caches for seconds instead
    // of re-poisoning every client on this instance for a full hour; if it
    // has, the next regular read re-caches the caught-up list at the normal
    // TTL once this entry expires.
    ttl: forceFresh ? 1000 * 15 : 1000 * 60 * 60, // 15 seconds / 1 hour
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
