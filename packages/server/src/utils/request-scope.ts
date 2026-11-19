/**
 * Request scope for work that is in flight.
 *
 * On Cloudflare Workers a promise can only settle in the request that created it
 * (`handle_cross_request_promise_resolution`): once that request ends, every other
 * request awaiting the promise fails or hangs until its own timeout. A promise that is
 * still pending must therefore never be shared through module state, which every
 * request in an isolate sees. Settled values (an LRU of prices, a resolved client) can
 * be shared.
 *
 * A Worker entry binds the scope with `setRequestScopeProvider`, backed by
 * `AsyncLocalStorage`. Elsewhere (Node, the browser's local tRPC router, tests, build)
 * no provider is bound, `getRequestScope()` is `undefined`, and callers keep sharing
 * in-flight work across callers as before.
 *
 * The provider lives on `globalThis` under a registry symbol, so it reaches every copy
 * of this module: the pages Worker entry and the OpenNext bundle it wraps each bundle
 * their own copy.
 */

export type RequestScope = {
  /** Keeps the request alive until the promise settles, so work started for it (a
   *  background cache refresh) can finish after the response is sent. */
  waitUntil(promise: Promise<unknown>): void;
};

type ScopeProvider = () => RequestScope | undefined;

const PROVIDER_KEY = Symbol.for("osmosis-labs.server.request-scope-provider");

type ProviderHolder = { [PROVIDER_KEY]?: ScopeProvider };

/** Binds the current request's scope. Call once per isolate, from a Worker entry. */
export function setRequestScopeProvider(provider: ScopeProvider): void {
  (globalThis as ProviderHolder)[PROVIDER_KEY] = provider;
}

/** The current request's scope, or `undefined` outside a Worker request. */
export function getRequestScope(): RequestScope | undefined {
  return (globalThis as ProviderHolder)[PROVIDER_KEY]?.();
}

const scopedValues = new WeakMap<RequestScope, Map<object, unknown>>();

/** A value created once per request under `key`, or `undefined` outside a Worker
 *  request (the caller then falls back to its shared value). `key` is any object that
 *  identifies the slot, typically a module-level constant or cache. */
export function getRequestScoped<T>(
  key: object,
  create: () => T
): T | undefined {
  const scope = getRequestScope();
  if (!scope) return undefined;

  let values = scopedValues.get(scope);
  if (!values) {
    values = new Map();
    scopedValues.set(scope, values);
  }
  if (!values.has(key)) values.set(key, create());
  return values.get(key) as T;
}
