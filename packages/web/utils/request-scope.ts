/**
 * Binds the request scope that `@osmosis-labs/server` uses to keep in-flight work from
 * crossing requests on Cloudflare Workers (see `packages/server/src/utils/request-scope.ts`).
 *
 * The provider is registered on `globalThis` under the same registry symbol the server
 * package reads, rather than through its `setRequestScopeProvider` export, so the pages
 * Worker entry doesn't bundle the server package a second time next to OpenNext's copy.
 * A test checks that both sides use the same symbol.
 */
import { AsyncLocalStorage } from "node:async_hooks";

export const REQUEST_SCOPE_PROVIDER_KEY = Symbol.for(
  "osmosis-labs.server.request-scope-provider"
);

type RequestScope = { waitUntil(promise: Promise<unknown>): void };

const scopes = new AsyncLocalStorage<RequestScope>();

(
  globalThis as {
    [REQUEST_SCOPE_PROVIDER_KEY]?: () => RequestScope | undefined;
  }
)[REQUEST_SCOPE_PROVIDER_KEY] = () => scopes.getStore();

/** Runs `fn` in a new request scope. Each Worker `fetch` must run inside one. */
export function runInRequestScope<T>(
  waitUntil: (promise: Promise<unknown>) => void,
  fn: () => T
): T {
  return scopes.run({ waitUntil }, fn);
}
