/**
 * Pathname → handler id for the API Worker. This module imports no handlers, so tests can check
 * the table without bundling the server.
 *
 * Prefix routes are the tRPC catch-alls (`[trpc].ts`). `/api/pools/:id` is one path segment;
 * `/api/pools` stays an exact match so the list route is not captured as an id.
 */
export const API_HANDLER_IDS = [
  "trpc",
  "edgeTrpcMain",
  "edgeTrpcPools",
  "edgeTrpcAssets",
  "pools",
  "pool",
  "activeGauges",
  "broadcastTransaction",
  "estimateGasFee",
  "evmRpc",
  "simulatePositionMigration",
  "solanaRpc",
  "swappedSignature",
  "skipTrackTx",
  "skipTxStatus",
  "cspReport",
] as const;

export type ApiHandlerId = (typeof API_HANDLER_IDS)[number];

export type ApiHandler = (request: Request) => Promise<Response>;

type ExactRoute = {
  handlerId: ApiHandlerId;
  match: "exact";
  pathname: string;
};

type PrefixRoute = {
  handlerId: ApiHandlerId;
  match: "prefix";
  pathname: string;
};

type SegmentRoute = {
  handlerId: ApiHandlerId;
  match: "segment";
  /** Display form, e.g. `/api/pools/:id`. */
  pathname: string;
  param: string;
  pattern: RegExp;
};

export type ApiRoute = ExactRoute | PrefixRoute | SegmentRoute;

export const API_ROUTES: readonly ApiRoute[] = [
  {
    handlerId: "trpc",
    match: "prefix",
    pathname: "/api/trpc",
  },
  {
    handlerId: "edgeTrpcMain",
    match: "prefix",
    pathname: "/api/edge-trpc-main",
  },
  {
    handlerId: "edgeTrpcPools",
    match: "prefix",
    pathname: "/api/edge-trpc-pools",
  },
  {
    handlerId: "edgeTrpcAssets",
    match: "prefix",
    pathname: "/api/edge-trpc-assets",
  },
  {
    handlerId: "pools",
    match: "exact",
    pathname: "/api/pools",
  },
  {
    handlerId: "pool",
    match: "segment",
    pathname: "/api/pools/:id",
    param: "id",
    pattern: /^\/api\/pools\/([^/]+)$/,
  },
  {
    handlerId: "activeGauges",
    match: "exact",
    pathname: "/api/active-gauges",
  },
  {
    handlerId: "broadcastTransaction",
    match: "exact",
    pathname: "/api/broadcast-transaction",
  },
  {
    handlerId: "estimateGasFee",
    match: "exact",
    pathname: "/api/estimate-gas-fee",
  },
  {
    handlerId: "evmRpc",
    match: "exact",
    pathname: "/api/evm-rpc",
  },
  {
    handlerId: "simulatePositionMigration",
    match: "exact",
    pathname: "/api/simulate-position-migration",
  },
  {
    handlerId: "solanaRpc",
    match: "exact",
    pathname: "/api/solana-rpc",
  },
  {
    handlerId: "swappedSignature",
    match: "exact",
    pathname: "/api/swapped-signature",
  },
  {
    handlerId: "skipTrackTx",
    match: "exact",
    pathname: "/api/skip-track-tx",
  },
  {
    handlerId: "skipTxStatus",
    match: "exact",
    pathname: "/api/skip-tx-status",
  },
  {
    handlerId: "cspReport",
    match: "exact",
    pathname: "/api/csp-report",
  },
];

export type ApiRouteMatch = {
  handlerId: ApiHandlerId;
  params: Readonly<Record<string, string>>;
};

/** Resolves `pathname` to a handler id. Unknown paths return undefined (the Worker answers 404). */
export function matchApiRoute(pathname: string): ApiRouteMatch | undefined {
  for (const route of API_ROUTES) {
    if (route.match === "exact") {
      if (pathname === route.pathname) {
        return { handlerId: route.handlerId, params: {} };
      }
      continue;
    }
    if (route.match === "prefix") {
      if (
        pathname === route.pathname ||
        pathname.startsWith(`${route.pathname}/`)
      ) {
        return { handlerId: route.handlerId, params: {} };
      }
      continue;
    }
    const found = route.pattern.exec(pathname);
    const value = found?.[1];
    if (value)
      return { handlerId: route.handlerId, params: { [route.param]: value } };
  }
  return undefined;
}
