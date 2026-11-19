import baseCachified, {
  type Cache,
  type CacheEntry,
  type CachifiedOptions,
} from "cachified";
import { LRUCache } from "lru-cache";

import { getRequestScope, getRequestScoped } from "./request-scope";

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

/** A view of `cache` for the current request: reads and writes go to `cache`, but the
 *  view is its own object, so cachified, which dedupes in-flight values per cache
 *  object, only dedupes within the request. */
function requestCacheView(cache: Cache): Cache {
  return (
    getRequestScoped<Cache>(cache, () => ({
      name: cache.name,
      get: (key) => cache.get(key),
      set: (key, value) => cache.set(key, value),
      delete: (key) => cache.delete(key),
    })) ?? cache
  );
}

/** `cachified`, safe to call from a Cloudflare Worker request.
 *
 *  cachified shares a pending `getFreshValue` with every caller of the same key and
 *  cache, and refreshes stale entries in the background without anyone awaiting them.
 *  On Workers both break: the shared promise belongs to the request that started it
 *  and never settles in another one once that request ends, and a background refresh
 *  is cancelled when its request ends, leaving the key pending for good. So inside a
 *  request (see `request-scope.ts`), in-flight values are shared only within the
 *  request, and each fresh value keeps the request alive (`waitUntil`) until it
 *  settles. Cached values are still shared across requests. Elsewhere this is plain
 *  cachified. Use this instead of importing cachified directly. */
export function cachified<Value>(
  options: CachifiedOptions<Value>
): Promise<Value> {
  const scope = getRequestScope();
  if (!scope) return baseCachified(options);

  const { getFreshValue } = options;
  return baseCachified({
    ...options,
    cache: requestCacheView(options.cache),
    getFreshValue: (context) => {
      const value = Promise.resolve().then(() => getFreshValue(context));
      scope.waitUntil(value.catch(() => undefined));
      return value;
    },
  });
}
