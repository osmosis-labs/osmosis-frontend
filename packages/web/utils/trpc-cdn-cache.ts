import type { QueryClient } from "@tanstack/react-query";

/**
 * Public, display-only assets procedures that Vercel's CDN may cache, with
 * the max age in seconds. The server also keeps these in memory (market data
 * 1-5 min, historical prices 3 min, CoinGecko coins 30 min), and the CDN's age
 * adds to that, so market data (prices shown next to trading) is kept short.
 *
 * Leave out anything that feeds a transaction or depends on the user:
 * getAssetPrice sets the default limit order price, getAssetWithPrice feeds fee
 * estimation, and the getUser* procedures return wallet balances.
 */
const ASSETS_CDN_MAX_AGE_SECONDS: Record<string, number> = {
  "assets.getMarketAsset": 10,
  "assets.getMarketAssets": 10,
  "assets.getAssetHistoricalPrice": 60,
  "assets.getAssetPairHistoricalPrice": 60,
  "assets.getCoingeckoAssetHistoricalPrice": 60,
  "assets.getTopGainerAssets": 60,
  "assets.getTopNewAssets": 60,
  "assets.getTopUpcomingAssets": 60,
  "assets.getBridgeAssetWithVariants": 300,
  "assets.getCoingeckoCoin": 300,
};

/** Input keys that identify a user (the shared address schemas). */
const USER_ADDRESS_KEYS = new Set([
  "userOsmoAddress",
  "osmoAddress",
  "userCosmosAddress",
  "userEvmAddress",
]);

/**
 * Whether an input must never be served from a shared cache: it carries a
 * wallet address, or asks for realtime prices (kept for 3s on the server).
 */
function isPrivateOrRealtimeInput(input: unknown): boolean {
  if (Array.isArray(input)) return input.some(isPrivateOrRealtimeInput);
  if (input === null || typeof input !== "object") return false;

  return Object.entries(input).some(
    ([key, value]) =>
      (USER_ADDRESS_KEYS.has(key) && Boolean(value)) ||
      (key === "realtime" && value === true) ||
      isPrivateOrRealtimeInput(value)
  );
}

/**
 * Client side: send cacheable assets queries unbatched, so each gets a stable
 * URL. A batch that includes any uncacheable procedure can't be cached at all.
 */
export function isCdnCacheableAssetsQuery(op: {
  type: string;
  path: string;
  input: unknown;
}): boolean {
  return (
    op.type === "query" &&
    op.path in ASSETS_CDN_MAX_AGE_SECONDS &&
    !isPrivateOrRealtimeInput(op.input)
  );
}

/**
 * Whether a procedure result looks like an upstream-failure fallback. Some
 * allowlisted procedures catch upstream errors and return an empty result
 * (`[]`, or `{ prices: [] }` for pair history) instead of throwing, so
 * `errors` stays empty. Caching those would keep serving empty data after the
 * upstream recovers. A genuinely empty result is also skipped, which only
 * costs an uncached request.
 */
function isEmptyResult(result: unknown): boolean {
  const data =
    result !== null && typeof result === "object" && "result" in result
      ? (result as { result?: { data?: unknown } }).result?.data
      : undefined;
  if (Array.isArray(data)) return data.length === 0;
  if (data !== null && typeof data === "object" && "prices" in data) {
    const { prices } = data as { prices?: unknown };
    return Array.isArray(prices) && prices.length === 0;
  }
  return false;
}

/**
 * Server side: the Cache-Control header for an edge-trpc-assets response, or
 * undefined to leave it uncached. Every procedure in the request must be on
 * the allowlist with a cacheable input, none may have errored or returned an
 * empty (possibly fallback) result, and the headers must be generated after
 * the results are known. The max age is the shortest of the procedures'.
 */
export function getAssetsCdnCacheControl({
  url,
  paths,
  type,
  errorCount,
  results,
  eagerGeneration,
}: {
  url: string;
  paths: readonly string[] | undefined;
  type: string;
  errorCount: number;
  /** The per-procedure responses tRPC passes to `responseMeta` as `data`. */
  results?: readonly unknown[];
  /**
   * tRPC sets this for streamed batches (`trpc-batch-mode: stream`), where
   * headers go out before any procedure finishes, so success is unknown. Our
   * client never streams, but anyone can send the header, and caching that
   * response would put a stream-format or error body on a public URL.
   */
  eagerGeneration?: boolean;
}): string | undefined {
  if (eagerGeneration) return undefined;
  if (type !== "query" || errorCount > 0 || !paths?.length) return undefined;
  if (results?.some(isEmptyResult)) return undefined;

  const maxAges = paths.map((path) => ASSETS_CDN_MAX_AGE_SECONDS[path]);
  if (maxAges.some((maxAge) => maxAge === undefined)) return undefined;

  // tRPC GET queries carry their (superjson-encoded) inputs in `input`.
  const rawInput = new URL(url).searchParams.get("input");
  if (rawInput !== null) {
    try {
      if (isPrivateOrRealtimeInput(JSON.parse(rawInput))) return undefined;
    } catch {
      return undefined;
    }
  }

  return `public, s-maxage=${Math.min(...maxAges)}`;
}

/** Assets procedures that return the user's wallet balances. */
const USER_BALANCE_ASSETS_PROCEDURES = [
  "getUserAsset",
  "getUserAssets",
  "getUserMarketAsset",
  "getUserBridgeAsset",
  "getUserBridgeAssets",
  "getUserAssetsTotal",
];

/** How long the browser treats wallet balances as fresh. */
const USER_BALANCE_STALE_TIME_MS = 10_000;

/**
 * Browser side: React Query's default staleTime of 0 refetches every assets
 * query whenever a component using it mounts (the navbar does on every page)
 * or the tab regains focus. Call-site options still override these defaults.
 *
 * - CDN-cacheable procedures stay fresh as long as the CDN may cache them,
 *   and don't refetch on focus.
 * - Balances stay fresh briefly, only to skip remount refetches.
 *   refetchUserQueries (stores/index.tsx) still refreshes them after every tx.
 *
 * getAssetPrice is untouched: it sets the default limit order price.
 */
export function setAssetsQueryDefaults(queryClient: QueryClient) {
  for (const [path, maxAgeSeconds] of Object.entries(
    ASSETS_CDN_MAX_AGE_SECONDS
  )) {
    queryClient.setQueryDefaults([["edge", ...path.split(".")]], {
      staleTime: maxAgeSeconds * 1000,
      refetchOnWindowFocus: false,
    });
  }
  for (const procedure of USER_BALANCE_ASSETS_PROCEDURES) {
    queryClient.setQueryDefaults([["edge", "assets", procedure]], {
      staleTime: USER_BALANCE_STALE_TIME_MS,
    });
  }
}
