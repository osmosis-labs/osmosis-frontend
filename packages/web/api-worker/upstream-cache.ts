/**
 * Shared Cache API in front of upstream GETs the API Worker makes.
 *
 * Installed by wrapping `globalThis.fetch` from `worker.ts`. Shared packages
 * keep calling `fetch` unchanged. Only the API Worker loads this module. The allowlist is `upstream-cache-rules.ts`.
 *
 * Per-request state (counters, shared misses) lives on the request scope the
 * Worker entry opens (`utils/request-scope.ts`). Outside a scope, a call still
 * reads warm entries but shares nothing, writes nothing and counts nothing.
 * Cache failures fall through to the network.
 */
import { getRequestScope, getRequestScoped } from "@osmosis-labs/server";

import { parseCacheControl } from "~/utils/edge-cache";

import {
  matchUpstreamRule,
  ruleTtlSeconds,
  type UpstreamCacheRule,
} from "./upstream-cache-rules";

type RequestState = {
  hit: number;
  miss: number;
  bypass: number;
  /**
   * One upstream read per cache key, shared by concurrent misses within this request (a tRPC
   * batch often needs the same upstream several times). Never shared across requests: the
   * Workers runtime ties a fetch to the request that started it, so another request waiting on
   * it would fail or hang if the first one is canceled.
   */
  inflight: Map<string, Promise<CachedBody>>;
};

type CachedBody = {
  status: number;
  statusText: string;
  headers: Headers;
  body: ArrayBuffer;
};

/** The request-scope slot for this module's `RequestState`. */
const STATE_KEY = {};

/** This request's state, or `undefined` outside a request scope. */
function requestState(): RequestState | undefined {
  return getRequestScoped<RequestState>(STATE_KEY, () => ({
    hit: 0,
    miss: 0,
    bypass: 0,
    inflight: new Map(),
  }));
}

/**
 * Caps concurrent distinct misses per request. Past this, callers fetch on
 * their own instead of joining the map, so a burst cannot grow it without bound.
 */
const MAX_INFLIGHT = 100;

const PRIVATE_DIRECTIVES = ["private", "no-store", "no-cache"] as const;

let nativeFetch: typeof fetch | undefined;
let cacheStore: Cache | undefined;

/**
 * Replaces `globalThis.fetch` once. Call from the API Worker entry only.
 * Tests restore it with `restoreUpstreamCache`.
 */
export function installUpstreamCache(): void {
  if (nativeFetch) return;
  nativeFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (input, init) => cachedFetch(input, init);
}

/** Puts the original `fetch` back. For tests. */
export function restoreUpstreamCache(): void {
  if (!nativeFetch) return;
  globalThis.fetch = nativeFetch;
  nativeFetch = undefined;
}

/** The location's `caches.default`. Writes are skipped when this was not set. */
export function bindUpstreamCache(cache: Cache): void {
  cacheStore = cache;
}

/**
 * Appends `upstream;desc="hit=… miss=… bypass=…"` from the current request, zeros included.
 * Concurrent requests have separate scopes, so counts cannot leak across them. Outside a
 * request scope the response is returned unchanged.
 */
export function applyUpstreamServerTiming(response: Response): Response {
  const counts = requestState();
  if (!counts) return response;
  const headers = new Headers(response.headers);
  const desc = `hit=${counts.hit} miss=${counts.miss} bypass=${counts.bypass}`;
  headers.append("Server-Timing", `upstream;desc="${desc}"`);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function cachedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const native = nativeFetch ?? globalThis.fetch.bind(globalThis);
  // A non-GET/HEAD Request's body is moved by `new Request(input)`. Bypass
  // before that copy so the original can still be sent.
  const method = (
    init?.method ?? (input instanceof Request ? input.method : "GET")
  ).toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    count("bypass");
    return native(input, init);
  }

  const request = readRequest(input, init);
  if (!request || !cacheableMethod(request)) {
    count("bypass");
    return native(input, init);
  }

  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    count("bypass");
    return native(input, init);
  }

  const rule = matchUpstreamRule(url);
  if (!rule) {
    count("bypass");
    return native(input, init);
  }

  const key = normalizedKey(url);
  if (request.method === "HEAD") return serveHead(key, input, init, native);

  const hit = await readCache(key);
  if (hit) {
    count("hit");
    return toResponse(hit);
  }

  count("miss");
  // Reject this caller when its signal aborts. The shared read keeps running for
  // any other caller in this request that is still waiting on it.
  if (request.signal.aborted) throw abortReason(request.signal);
  const body = await whenNotAborted(
    loadShared(key, () => readUpstream(native, request, rule, url, key)),
    request.signal
  );
  return toResponse(body);
}

/**
 * The caller's view of `pending`. Aborts reject this promise and leave `pending` running.
 */
function whenNotAborted<T>(
  pending: Promise<T>,
  signal: AbortSignal
): Promise<T> {
  if (signal.aborted) return Promise.reject(abortReason(signal));
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(abortReason(signal));
    signal.addEventListener("abort", onAbort, { once: true });
    if (signal.aborted) {
      signal.removeEventListener("abort", onAbort);
      reject(abortReason(signal));
      return;
    }
    pending.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

function abortReason(signal: AbortSignal): unknown {
  return (
    signal.reason ??
    new DOMException("This operation was aborted", "AbortError")
  );
}

function cacheableMethod(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  if (request.body) return false;
  const cacheMode = request.cache;
  return cacheMode !== "no-store" && cacheMode !== "reload";
}

/** HEAD is served only from an existing GET entry. A miss is not stored. */
async function serveHead(
  key: string,
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  native: typeof fetch
): Promise<Response> {
  const hit = await readCache(key);
  if (!hit) {
    count("bypass");
    return native(input, init);
  }
  count("hit");
  return new Response(null, {
    status: hit.status,
    statusText: hit.statusText,
    headers: hit.headers,
  });
}

async function readUpstream(
  native: typeof fetch,
  request: Request,
  rule: UpstreamCacheRule,
  url: URL,
  key: string
): Promise<CachedBody> {
  // The caller's signal is not forwarded: one aborted consumer must not
  // cancel the shared read the others are waiting on. `cachedFetch` rejects
  // that caller's own wait so its timeout still frees whatever it is holding.
  const response = await native(request.url, {
    method: "GET",
    headers: request.headers,
    redirect: request.redirect,
  });
  const body = await response.arrayBuffer();
  const snapshot: CachedBody = {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    body,
  };
  const ttl = cacheableTtl(response, rule, url);
  if (ttl !== undefined && (!rule.acceptBody || rule.acceptBody(body))) {
    storeSnapshot(key, snapshot, ttl);
  }
  return snapshot;
}

/**
 * Joins an in-flight miss for `key` in the current request. The loader is
 * removed when it settles, whether it succeeds or throws.
 */
function loadShared(
  key: string,
  loader: () => Promise<CachedBody>
): Promise<CachedBody> {
  const inflight = requestState()?.inflight;
  if (!inflight) return loader();
  const existing = inflight.get(key);
  if (existing) return existing;
  if (inflight.size >= MAX_INFLIGHT) return loader();

  const pending = loader();
  inflight.set(key, pending);
  pending.then(
    () => {
      if (inflight.get(key) === pending) inflight.delete(key);
    },
    () => {
      if (inflight.get(key) === pending) inflight.delete(key);
    }
  );
  return pending;
}

function storeSnapshot(key: string, snapshot: CachedBody, ttl: number): void {
  const cache = cacheStore;
  const scope = getRequestScope();
  if (!cache || !scope) return;

  const headers = storedHeaders(snapshot.headers, ttl);
  const stored = new Response(snapshot.body.slice(0), {
    status: snapshot.status,
    statusText: snapshot.statusText,
    headers,
  });
  const write = cache.put(new Request(key), stored).catch((error: unknown) => {
    console.error("Upstream cache write failed", key, error);
  });
  try {
    scope.waitUntil(write);
  } catch (error) {
    console.error("Upstream cache waitUntil failed", key, error);
  }
}

async function readCache(key: string): Promise<CachedBody | undefined> {
  const cache = cacheStore;
  if (!cache) return undefined;
  try {
    const hit = await cache.match(new Request(key));
    if (!hit) return undefined;
    return {
      status: hit.status,
      statusText: hit.statusText,
      headers: hit.headers,
      body: await hit.arrayBuffer(),
    };
  } catch (error) {
    console.error("Upstream cache read failed", key, error);
    return undefined;
  }
}

function cacheableTtl(
  response: Response,
  rule: UpstreamCacheRule,
  url: URL
): number | undefined {
  if (response.status < 200 || response.status >= 300) return undefined;
  const directives = parseCacheControl(response.headers.get("cache-control"));
  if (PRIVATE_DIRECTIVES.some((name) => directives.has(name))) {
    return undefined;
  }
  const ruleTtl = ruleTtlSeconds(rule, url);
  const advertised =
    directiveSeconds(directives, "s-maxage") ??
    directiveSeconds(directives, "max-age");
  const ttl = Math.min(advertised ?? ruleTtl, ruleTtl);
  if (!Number.isInteger(ttl) || ttl <= 0) return undefined;
  return ttl;
}

/** Headers kept in the cache. Auth and cookies never ride along. */
function storedHeaders(source: Headers, ttl: number): Headers {
  const headers = new Headers(source);
  for (const name of [
    "set-cookie",
    "authorization",
    "x-api-key",
    "cookie",
    "proxy-authorization",
  ]) {
    headers.delete(name);
  }
  headers.set("cache-control", `public, s-maxage=${ttl}`);
  return headers;
}

function toResponse(snapshot: CachedBody): Response {
  return new Response(snapshot.body.slice(0), {
    status: snapshot.status,
    statusText: snapshot.statusText,
    headers: new Headers(snapshot.headers),
  });
}

function normalizedKey(url: URL): string {
  const key = new URL(url.origin + url.pathname);
  const params = [...url.searchParams.entries()].sort((a, b) =>
    a[0] === b[0]
      ? a[1] < b[1]
        ? -1
        : a[1] > b[1]
          ? 1
          : 0
      : a[0] < b[0]
        ? -1
        : 1
  );
  for (const [name, value] of params) key.searchParams.append(name, value);
  return key.toString();
}

function readRequest(
  input: RequestInfo | URL,
  init?: RequestInit
): Request | undefined {
  try {
    return new Request(input, init);
  } catch {
    return undefined;
  }
}

function count(kind: "hit" | "miss" | "bypass"): void {
  const counts = requestState();
  if (counts) counts[kind] += 1;
}

function directiveSeconds(
  directives: Map<string, string>,
  name: string
): number | undefined {
  if (!directives.has(name)) return undefined;
  const seconds = Number(directives.get(name));
  return Number.isInteger(seconds) && seconds >= 0 ? seconds : undefined;
}
