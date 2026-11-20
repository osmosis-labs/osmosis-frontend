/**
 * Pathname → handler id for the API Worker. This module imports no handlers, so tests can check
 * the table without bundling the server.
 *
 * Prefix routes are the tRPC catch-alls (`[trpc].ts`). `/api/pools/:id` is one path segment;
 * `/api/pools` stays an exact match so the list route is not captured as an id.
 */

type ApiRoute =
  | { exact: string }
  | { prefix: string }
  /** One path segment after a fixed base; the handler parses it from the URL. */
  | { pattern: RegExp };

/** The route table, keyed by handler id. `handlers.ts` must map every key. */
export const API_ROUTES = {
  trpc: { prefix: "/api/trpc" },
  edgeTrpcMain: { prefix: "/api/edge-trpc-main" },
  edgeTrpcPools: { prefix: "/api/edge-trpc-pools" },
  edgeTrpcAssets: { prefix: "/api/edge-trpc-assets" },
  pools: { exact: "/api/pools" },
  pool: { pattern: /^\/api\/pools\/[^/]+$/ },
  activeGauges: { exact: "/api/active-gauges" },
  broadcastTransaction: { exact: "/api/broadcast-transaction" },
  estimateGasFee: { exact: "/api/estimate-gas-fee" },
  evmRpc: { exact: "/api/evm-rpc" },
  simulatePositionMigration: { exact: "/api/simulate-position-migration" },
  solanaRpc: { exact: "/api/solana-rpc" },
  swappedSignature: { exact: "/api/swapped-signature" },
  skipTrackTx: { exact: "/api/skip-track-tx" },
  skipTxStatus: { exact: "/api/skip-tx-status" },
  cspReport: { exact: "/api/csp-report" },
} as const satisfies Record<string, ApiRoute>;

export type ApiHandlerId = keyof typeof API_ROUTES;

export type ApiHandler = (request: Request) => Promise<Response>;

const exactRoutes = new Map<string, ApiHandlerId>();
const prefixRoutes: [base: string, id: ApiHandlerId][] = [];
const patternRoutes: [pattern: RegExp, id: ApiHandlerId][] = [];
for (const [id, route] of Object.entries(API_ROUTES) as [
  ApiHandlerId,
  ApiRoute,
][]) {
  if ("exact" in route) exactRoutes.set(route.exact, id);
  else if ("prefix" in route) prefixRoutes.push([route.prefix, id]);
  else patternRoutes.push([route.pattern, id]);
}

/** Resolves `pathname` to a handler id. Unknown paths return undefined (the Worker answers 404). */
export function matchApiRoute(pathname: string): ApiHandlerId | undefined {
  const exact = exactRoutes.get(pathname);
  if (exact) return exact;
  for (const [base, id] of prefixRoutes) {
    if (pathname === base || pathname.startsWith(`${base}/`)) return id;
  }
  for (const [pattern, id] of patternRoutes) {
    if (pattern.test(pathname)) return id;
  }
  return undefined;
}
