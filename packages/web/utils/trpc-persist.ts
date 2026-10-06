import { defaultShouldDehydrateQuery, Query } from "@tanstack/react-query";

/**
 * tRPC procedures whose results must never be persisted across sessions.
 */
export const PERSIST_EXCLUDED_KEYS = [
  "local.bridgeTransfer.getSupportedAssetsBalances",
  "bridgeTransfer.getDepositAddress",
];

/**
 * Which queries the persisted cache keeps. Only successful queries: v5
 * dehydrates a pending query together with its promise, which superjson
 * serializes as `{}`, so restoring it throws, wipes the stored cache and leaves
 * persistence off for the session.
 */
export function shouldPersistQuery(query: Query): boolean {
  if (!defaultShouldDehydrateQuery(query)) return false;

  const [key] = query.queryKey as [string[]];
  if (Array.isArray(key) && PERSIST_EXCLUDED_KEYS.includes(key.join("."))) {
    return false;
  }
  return true;
}
