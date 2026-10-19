import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

export const DEFAULT_LRU_OPTIONS: LRUCache.Options<
  string,
  CacheEntry<unknown>,
  unknown
> = {
  max: 500,
};

/** How long past its ttl a data-services (Numia) cache entry keeps being served.
 *  cachified serves the stale entry while it refreshes in the background, and a failed
 *  refresh keeps it, so a short data-services outage shows the last good value
 *  instead of an error or a zero. */
export const DATA_SERVICES_STALE_WHILE_REVALIDATE = 1000 * 60 * 30; // 30 minutes

export const LARGE_LRU_OPTIONS: LRUCache.Options<
  string,
  CacheEntry<unknown>,
  unknown
> = {
  max: 1_500,
};
