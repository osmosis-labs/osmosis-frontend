import baseCachified, {
  type Cache,
  type CacheEntry,
  type CachifiedOptions,
  shouldRefresh,
} from "cachified";
import { LRUCache } from "lru-cache";

import {
  getRequestScope,
  getRequestScoped,
  type RequestScope,
} from "./request-scope";

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
 *  object, only dedupes within the request.
 *
 *  Requests no longer share fetches, so overlapping ones write the same key in any
 *  order. A write never replaces an entry created later: a slow refresh can't put older
 *  data back over a newer value. */
function requestCacheView(cache: Cache): Cache {
  return (
    getRequestScoped<Cache>(cache, () => ({
      name: cache.name,
      get: (key) => cache.get(key),
      set: async (key, value) => {
        const current = await cache.get(key);
        if (
          current?.metadata &&
          current.metadata.createdTime > value.metadata.createdTime
        ) {
          return;
        }
        return cache.set(key, value);
      },
      delete: (key) => cache.delete(key),
    })) ?? cache
  );
}

/** Hands `promise` to the request's `waitUntil`, so the work finishes after the response
 *  is sent. Never throws: past the request's lifetime `waitUntil` itself can. */
function keepRequestAlive(scope: RequestScope, promise: Promise<unknown>) {
  try {
    scope.waitUntil(promise.catch(() => undefined));
  } catch {
    // The request is already over; the work runs as long as the runtime lets it.
  }
}

/** The cached entry when it is past its ttl but still within stale-while-revalidate,
 *  matching how cachified decides to serve stale and refresh in the background.
 *  `undefined` when there is none or it can't be read: cachified's own read then handles
 *  it (and deletes an entry it can't use). */
async function readStaleEntry<Value>(
  cache: Cache,
  options: CachifiedOptions<Value>
): Promise<CacheEntry<unknown> | undefined> {
  try {
    const entry = await cache.get(options.key);
    if (!entry?.metadata) return undefined;
    const refresh = shouldRefresh(entry.metadata);
    // Same precedence as cachified.
    const swr = options.swr ?? options.staleWhileRevalidate;
    return refresh === "stale" || (refresh === "now" && swr === Infinity)
      ? entry
      : undefined;
  } catch {
    return undefined;
  }
}

/** `cachified`, safe to call from a Cloudflare Worker request.
 *
 *  Plain cachified breaks on Workers in two ways. It shares a pending `getFreshValue`
 *  with every caller of the same key and cache, but that promise belongs to the request
 *  that started it and never settles in another one once that request ends. And it
 *  refreshes a stale entry on a timer after serving it, which a Worker cancels when the
 *  response is sent, so the entry is never refreshed.
 *
 *  Inside a request (see `request-scope.ts`):
 *  - in-flight values are shared only within the request; cached values are still
 *    shared across requests;
 *  - a stale entry is served and refreshed at once, with the whole refresh (fetch,
 *    check and cache write) kept alive by `waitUntil`. With `checkValue` set, cachified
 *    refreshes as usual and only the fetch is kept alive (no caller combines the two).
 *  Elsewhere this is plain cachified. Use this instead of importing cachified directly. */
export async function cachified<Value>(
  options: CachifiedOptions<Value>
): Promise<Value> {
  const scope = getRequestScope();
  if (!scope) return baseCachified(options);

  const { getFreshValue } = options;
  const scoped: CachifiedOptions<Value> = {
    ...options,
    cache: requestCacheView(options.cache),
    getFreshValue: (context) => {
      const value = Promise.resolve().then(() => getFreshValue(context));
      // A background refresh cachified started itself: nobody awaits it.
      if (context.background) keepRequestAlive(scope, value);
      return value;
    },
  };

  if (!options.forceFresh && !options.checkValue) {
    const stale = await readStaleEntry(scoped.cache, options);
    if (stale) {
      keepRequestAlive(
        scope,
        baseCachified({
          ...scoped,
          forceFresh: true,
          fallbackToCache: false,
          // Already kept alive as a whole, so call the caller's function directly.
          getFreshValue: (context) =>
            getFreshValue({ ...context, background: true }),
        })
      );
      return stale.value as Value;
    }
  }

  return baseCachified(scoped);
}
