/**
 * Read-through cache for server queries, built for Cloudflare Workers and also used on
 * Node and in the browser (the local tRPC router).
 *
 * `cached` returns the value under `key`, fetching it with `getFreshValue` when it is
 * missing or past its ttl. Within `staleWhileRevalidate` after the ttl it returns the
 * stale value and refreshes it in the background.
 *
 * What it guarantees, and why (see `request-scope.ts` for the Workers rule behind 1-2):
 * 1. A pending fetch is shared only within a request on Workers, and by every caller
 *    elsewhere. A Workers promise can only settle in the request that created it.
 * 2. A background refresh starts at once, and the whole refresh (fetch, check and write)
 *    is handed to the request's `waitUntil`. A Worker cancels timers and work nobody
 *    awaits once the response is sent.
 * 3. A write never replaces an entry created later, so a slow fetch can't put older data
 *    back over a newer value. Overlapping requests finish in any order.
 * 4. Settled values live in `cache` (an LRU), shared across requests.
 *
 * It replaces cachified, whose global in-flight map and timer-based refresh assume one
 * long-lived process.
 */
import { getRequestScope, type RequestScope } from "./request-scope";

export interface CacheMetadata {
  /** When the fetch that produced the value started. */
  createdTime: number;
  /** How long the value is fresh, in ms. `null`: forever. Negative: never cached. */
  ttl: number | null;
  /** How long past `ttl` the value is served while it refreshes, in ms. */
  swr: number;
}

export interface CacheEntry<Value = unknown> {
  value: Value;
  metadata: CacheMetadata;
}

/** Storage for entries. `lru-cache`'s `LRUCache<string, CacheEntry>` fits. */
export interface Cache {
  get(key: string): CacheEntry | undefined | Promise<CacheEntry | undefined>;
  set(key: string, entry: CacheEntry): unknown;
  delete(key: string): unknown;
}

export interface FreshValueContext {
  /** True for a refresh of a stale value that nobody waits for. */
  background: boolean;
  /** The metadata the value is cached with. `getFreshValue` may change `ttl`, e.g. to
   *  retry a degraded answer sooner. */
  metadata: CacheMetadata;
}

export interface CachedOptions<Value> {
  key: string;
  cache: Cache;
  getFreshValue: (context: FreshValueContext) => Value | Promise<Value>;
  /** Fresh for this long, in ms. Default: forever. Negative: never cached. */
  ttl?: number;
  /** Served stale for this long past `ttl` while refreshing, in ms. Default: 0. */
  staleWhileRevalidate?: number;
  /** Fetch even when a fresh value is cached. If that fetch fails, the cached value (at
   *  any age) is returned instead. */
  forceFresh?: boolean;
  /** Validates a value, cached or fresh: `true` (or nothing) when valid, otherwise a
   *  reason. An invalid cached value is dropped and fetched again; an invalid fresh value
   *  is not cached and fails the call. */
  checkValue?: (value: unknown) => CheckResult | Promise<CheckResult>;
}

type CheckResult = true | string | void | undefined | null;

type Freshness = "fresh" | "stale" | "expired";

/** Same boundaries as cachified's `shouldRefresh`: fresh through `ttl`, stale through
 *  `ttl + swr`, both inclusive. */
export function getFreshness(
  metadata: CacheMetadata,
  now = Date.now()
): Freshness {
  if (metadata.ttl === null) return "fresh";
  const freshUntil = metadata.createdTime + metadata.ttl;
  if (now <= freshUntil) return "fresh";
  return now <= freshUntil + metadata.swr ? "stale" : "expired";
}

/** In-flight fetches by cache and key. On Workers there is one map per request. */
type PendingFetches = WeakMap<Cache, Map<string, Promise<unknown>>>;

const sharedPending: PendingFetches = new WeakMap();
const pendingByScope = new WeakMap<RequestScope, PendingFetches>();

function getPendingFetches(
  scope: RequestScope | undefined,
  cache: Cache
): Map<string, Promise<unknown>> {
  let byCache = sharedPending;
  if (scope) {
    byCache = pendingByScope.get(scope) ?? new WeakMap();
    pendingByScope.set(scope, byCache);
  }
  let pending = byCache.get(cache);
  if (!pending) {
    pending = new Map();
    byCache.set(cache, pending);
  }
  return pending;
}

function isValid(result: CheckResult): boolean {
  return result === true || result === undefined || result === null;
}

/** The cached entry, or `undefined` when there is none, it can't be read, or it fails
 *  `checkValue` (then it is dropped). */
async function readEntry<Value>(
  options: CachedOptions<Value>
): Promise<CacheEntry<Value> | undefined> {
  const { cache, key, checkValue } = options;
  let entry: CacheEntry | undefined;
  try {
    entry = await cache.get(key);
  } catch {
    return undefined;
  }
  if (!entry || typeof entry !== "object" || !entry.metadata) return undefined;
  if (checkValue) {
    const result = await Promise.resolve()
      .then(() => checkValue(entry.value))
      .catch((e: unknown) => String(e));
    if (!isValid(result)) {
      await Promise.resolve(cache.delete(key)).catch(() => undefined);
      return undefined;
    }
  }
  return entry as CacheEntry<Value>;
}

/** Writes `entry` unless the cache holds one created later. Write failures are ignored:
 *  the caller still gets the value. */
async function writeIfNewer(
  cache: Cache,
  key: string,
  entry: CacheEntry
): Promise<void> {
  try {
    const current = await cache.get(key);
    if (
      current?.metadata &&
      current.metadata.createdTime > entry.metadata.createdTime
    ) {
      return;
    }
    await cache.set(key, entry);
  } catch {
    // Not cached this time.
  }
}

/** Fetches, checks and caches a fresh value, sharing a fetch already in flight. */
function fetchFresh<Value>(
  options: CachedOptions<Value>,
  scope: RequestScope | undefined,
  background: boolean
): Promise<Value> {
  const { key, cache, checkValue } = options;
  const pending = getPendingFetches(scope, cache);
  const inFlight = pending.get(key);
  if (inFlight) return inFlight as Promise<Value>;

  const metadata: CacheMetadata = {
    createdTime: Date.now(),
    ttl:
      options.ttl === undefined || options.ttl === Infinity
        ? null
        : options.ttl,
    swr: options.staleWhileRevalidate ?? 0,
  };
  const fetch = (async () => {
    const value = await options.getFreshValue({ background, metadata });
    if (checkValue) {
      const result = await checkValue(value);
      if (!isValid(result)) {
        throw Object.assign(
          new Error(`check failed for fresh value of ${key}`),
          { cause: result }
        );
      }
    }
    if (getFreshness(metadata) !== "expired") {
      await writeIfNewer(cache, key, { value, metadata });
    }
    return value;
  })().finally(() => {
    if (pending.get(key) === fetch) pending.delete(key);
  });
  pending.set(key, fetch);
  return fetch;
}

/** Hands `work` to the request's `waitUntil`, so it finishes after the response is sent.
 *  Never throws or rejects: a failed refresh keeps the stale value. */
function runInBackground(
  scope: RequestScope | undefined,
  work: Promise<unknown>
): void {
  const settled = work.catch(() => undefined);
  if (!scope) return;
  try {
    scope.waitUntil(settled);
  } catch {
    // The request is already over; the work runs as long as the runtime lets it.
  }
}

/** The value under `options.key`, from the cache when fresh (or stale within
 *  `staleWhileRevalidate`, refreshing it), otherwise fetched. See the module comment. */
export async function cached<Value>(
  options: CachedOptions<Value>
): Promise<Value> {
  const scope = getRequestScope();
  const entry = await readEntry(options);

  if (entry && !options.forceFresh) {
    const freshness = getFreshness(entry.metadata);
    if (freshness === "fresh") return entry.value;
    if (freshness === "stale") {
      runInBackground(scope, fetchFresh(options, scope, true));
      return entry.value;
    }
  }

  try {
    return await fetchFresh(options, scope, false);
  } catch (e) {
    if (options.forceFresh && entry) return entry.value;
    throw e;
  }
}
