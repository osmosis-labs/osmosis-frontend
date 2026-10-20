import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

export const DEFAULT_LRU_OPTIONS: LRUCache.Options<
  string,
  CacheEntry<unknown>,
  unknown
> = {
  max: 500,
};

/* How long past its ttl a data-services (Numia) cache entry keeps being served.
 * cachified serves the stale entry while it refreshes in the background, and a failed
 * refresh keeps it, so a data-services outage shows the last good value instead of an
 * error or a zero. Prices are never served stale (see `getAssetMarketActivity`). */

/** Maximum age of APRs (pool, CL range and staking): they move slowly, so up to a day.
 *  A cache's stale window is this minus its own ttl, so the total age stays within it. */
export const DATA_SERVICES_APR_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

/** Maximum age of volume and charts, ttl included. */
export const DATA_SERVICES_MARKET_MAX_AGE = 1000 * 60 * 60; // 1 hour

export const LARGE_LRU_OPTIONS: LRUCache.Options<
  string,
  CacheEntry<unknown>,
  unknown
> = {
  max: 1_500,
};
