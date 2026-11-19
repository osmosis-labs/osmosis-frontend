import { type CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { cachified, DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { getRequestScoped } from "../../../utils/request-scope";
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

/**
 * Minimum spacing between forced-fresh sidecar reads on this instance. The
 * fresh path is reachable from a public procedure, so without a floor any
 * client could bypass the cache and hammer SQS. Shorter than the client's
 * 2s post-creation retry spacing, so one user's refresh loop still gets a
 * real fresh read per attempt.
 */
const FRESH_MIN_INTERVAL_MS = 1500;
let lastFreshReadAt = 0;

/** The fresh read in flight. On Workers one per request: a read started by one
 *  request can't settle in another (see `request-scope.ts`). */
type FreshRead = { inFlight?: Promise<Orderbook[]> };
const sharedFreshRead: FreshRead = {};
const freshReadSlot = {};

export function getOrderbookPoolsFresh(): Promise<Orderbook[]> {
  const freshRead =
    getRequestScoped<FreshRead>(freshReadSlot, () => ({})) ?? sharedFreshRead;
  // Concurrent fresh reads share one sidecar request.
  if (freshRead.inFlight) return freshRead.inFlight;
  // A fresh read just completed and wrote its result back: serve that.
  if (Date.now() - lastFreshReadAt < FRESH_MIN_INTERVAL_MS) {
    return fetchOrderbookPools(false);
  }
  const read = fetchOrderbookPools(true).finally(() => {
    lastFreshReadAt = Date.now();
    freshRead.inFlight = undefined;
  });
  freshRead.inFlight = read;
  return read;
}
