import { defaultShouldDehydrateQuery, Query } from "@tanstack/react-query";

/**
 * tRPC procedures whose results must never be persisted across sessions.
 */
export const PERSIST_EXCLUDED_KEYS = [
  "local.bridgeTransfer.getSupportedAssetsBalances",
  "bridgeTransfer.getDepositAddress",
];

/**
 * Version of the persisted cache. Bump it whenever the shape of persisted data
 * changes, so older caches are dropped on restore instead of served.
 * v3: drop caches that may hold poisoned success-with-empty supported-assets
 * results persisted before the Skip counterparty mutation fix.
 * v4: TanStack Query v5 cache format; v4 caches hold a "loading" status that v5
 * cannot restore.
 * v5: discard plain unit-class field dumps cached before the OpenNext
 * SuperJSON registry/constructor-identity fix.
 */
export const PERSIST_BUSTER = "v5";

/**
 * Which queries the persisted cache keeps. Only successful queries: v5
 * dehydrates a pending query together with its promise, which superjson
 * serializes as `{}`, so restoring it throws, wipes the stored cache and leaves
 * persistence off for the session. Errored queries are not kept either, even
 * when they still hold data from an earlier success.
 */
export function shouldPersistQuery(query: Query): boolean {
  if (!defaultShouldDehydrateQuery(query)) return false;

  const [key] = query.queryKey as [string[]];
  if (Array.isArray(key) && PERSIST_EXCLUDED_KEYS.includes(key.join("."))) {
    return false;
  }
  return true;
}
