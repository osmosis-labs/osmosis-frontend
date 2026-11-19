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
  /** Orders fetches started in the same millisecond (see `isLater`). */
  sequence?: number;
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
  /** Fetch even when a fresh value is cached. If that fetch fails, the value cached by
   *  then (at any age) is returned and re-cached with this call's ttl. A fresh value
   *  that fails `checkValue` still fails the call. */
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

/** A fetch in flight. Joined only while it is within its ttl, like cachified: past that
 *  a caller starts a new fetch, and its value also settles the callers of this one. */
interface PendingFetch {
  promise: Promise<unknown>;
  metadata: CacheMetadata;
  adopt: (value: unknown) => void;
  /** Started with `forceFresh`. A forced call joins only another forced one: a regular
   *  fetch may be cached with a longer ttl than the forced call asks for. */
  forced: boolean;
}

/** In-flight fetches by cache and key. On Workers there is one map per request. */
type PendingFetches = WeakMap<Cache, Map<string, PendingFetch>>;

const sharedPending: PendingFetches = new WeakMap();
const pendingByScope = new WeakMap<RequestScope, PendingFetches>();

function getPendingFetches(
  scope: RequestScope | undefined,
  cache: Cache
): Map<string, PendingFetch> {
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

/** Orders fetches started in the same millisecond. Per isolate, like the caches. */
let lastSequence = 0;

function newMetadata<Value>(options: CachedOptions<Value>): CacheMetadata {
  return {
    createdTime: Date.now(),
    sequence: ++lastSequence,
    ttl:
      options.ttl === undefined || options.ttl === Infinity
        ? null
        : options.ttl,
    swr: options.staleWhileRevalidate ?? 0,
  };
}

/** True when `a` comes from a fetch started after `b`'s. */
function isLater(a: CacheMetadata, b: CacheMetadata): boolean {
  if (a.createdTime !== b.createdTime) return a.createdTime > b.createdTime;
  return (a.sequence ?? 0) > (b.sequence ?? 0);
}

function isValid(result: CheckResult): boolean {
  return result === true || result === undefined || result === null;
}

/** True for a well-formed entry. A malformed one (e.g. no `createdTime`) would otherwise
 *  read as fresh forever, so it is treated as missing and refetched. */
function isEntry(entry: unknown): entry is CacheEntry {
  if (typeof entry !== "object" || entry === null || !("value" in entry)) {
    return false;
  }
  const metadata = (entry as { metadata?: unknown }).metadata;
  if (typeof metadata !== "object" || metadata === null) return false;
  const { createdTime, ttl, swr } = metadata as Partial<CacheMetadata>;
  return (
    Number.isFinite(createdTime) &&
    (ttl === null || typeof ttl === "number") &&
    typeof swr === "number"
  );
}

/** The cached entry, or `undefined` when there is none, it can't be read, or it fails
 *  `checkValue` (then it is dropped, unless it was replaced meanwhile). */
async function readEntry<Value>(
  options: CachedOptions<Value>
): Promise<CacheEntry<Value> | undefined> {
  const { cache, key, checkValue } = options;
  let entry: unknown;
  try {
    entry = await cache.get(key);
  } catch {
    return undefined;
  }
  if (!isEntry(entry)) return undefined;
  if (checkValue) {
    const result = await Promise.resolve()
      .then(() => checkValue(entry.value))
      .catch((e: unknown) => String(e));
    if (!isValid(result)) {
      await Promise.resolve()
        .then(async () => {
          if ((await cache.get(key)) === entry) await cache.delete(key);
        })
        .catch(() => undefined);
      return undefined;
    }
  }
  return entry as CacheEntry<Value>;
}

/** Writes `entry` unless the cache holds one from a later fetch. With a synchronous
 *  cache (the LRUs) the check and the write happen in one step, so concurrent writers
 *  can't interleave. Write failures are ignored: the caller still gets the value. */
async function writeIfNewer(
  cache: Cache,
  key: string,
  entry: CacheEntry
): Promise<void> {
  try {
    const read = cache.get(key);
    const current = read instanceof Promise ? await read : read;
    if (isEntry(current) && isLater(current.metadata, entry.metadata)) return;
    await cache.set(key, entry);
  } catch {
    // Not cached this time.
  }
}

/** The fresh value, or with `forceFresh` and a failed fetch, the value cached by then.
 *  Like cachified, that fallback is then written with this fetch's metadata. */
async function getFreshOrFallback<Value>(
  options: CachedOptions<Value>,
  context: FreshValueContext
): Promise<Value> {
  try {
    return await options.getFreshValue(context);
  } catch (e) {
    if (!options.forceFresh) throw e;
    const fallback = await readEntry(options);
    if (!fallback) throw e;
    return fallback.value;
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
  const forced = Boolean(options.forceFresh);
  if (
    inFlight &&
    (inFlight.forced || !forced) &&
    getFreshness(inFlight.metadata) === "fresh"
  ) {
    return inFlight.promise as Promise<Value>;
  }

  const metadata = newMetadata(options);
  const work = (async () => {
    const value = await getFreshOrFallback(options, { background, metadata });
    if (checkValue) {
      let result: CheckResult;
      try {
        result = await checkValue(value);
      } catch (e) {
        result = String(e);
      }
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
  })();

  let adopt!: (value: unknown) => void;
  const adopted = new Promise<unknown>((resolve) => (adopt = resolve));
  const fetch = Promise.race([work, adopted]).finally(() => {
    if (pending.get(key)?.promise === fetch) pending.delete(key);
  }) as Promise<Value>;
  // A fetch past its ttl is replaced, not abandoned: its callers get this value too.
  if (inFlight) work.then(inFlight.adopt, () => undefined);
  pending.set(key, { promise: fetch, metadata, adopt, forced });
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
  const entry = options.forceFresh ? undefined : await readEntry(options);

  if (entry) {
    const freshness = getFreshness(entry.metadata);
    if (freshness === "fresh") return entry.value;
    if (freshness === "stale") {
      runInBackground(scope, fetchFresh(options, scope, true));
      return entry.value;
    }
  }

  return fetchFresh(options, scope, false);
}
