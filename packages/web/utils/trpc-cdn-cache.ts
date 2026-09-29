/**
 * Public, display-only assets procedures that Vercel's CDN may cache, with
 * the max age in seconds. The server already keeps each of these in memory
 * for at least as long (market data 1-5 min, historical prices 3 min, CoinGecko
 * coins 30 min), so the CDN only shares that data across instances; it does
 * not make it older than it can already be.
 *
 * Leave out anything that feeds a transaction or depends on the user:
 * getAssetPrice sets the default limit order price, getAssetWithPrice feeds fee
 * estimation, and the getUser* procedures return wallet balances.
 */
const ASSETS_CDN_MAX_AGE_SECONDS: Record<string, number> = {
  "assets.getMarketAsset": 30,
  "assets.getMarketAssets": 30,
  "assets.getAssetHistoricalPrice": 60,
  "assets.getAssetPairHistoricalPrice": 60,
  "assets.getCoingeckoAssetHistoricalPrice": 60,
  "assets.getTopGainerAssets": 60,
  "assets.getTopNewAssets": 60,
  "assets.getTopUpcomingAssets": 60,
  "assets.getBridgeAssetWithVariants": 300,
  "assets.getCoingeckoCoin": 300,
};

/**
 * Whether an input must never be served from a shared cache: it carries a
 * wallet address, or asks for realtime prices (kept for 3s on the server).
 */
function isPrivateOrRealtimeInput(input: unknown): boolean {
  if (Array.isArray(input)) return input.some(isPrivateOrRealtimeInput);
  if (input === null || typeof input !== "object") return false;

  return Object.entries(input).some(
    ([key, value]) =>
      (key === "userOsmoAddress" && Boolean(value)) ||
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
 * Server side: the Cache-Control header for an edge-trpc-assets response, or
 * undefined to leave it uncached. Every procedure in the request must be on
 * the allowlist with a cacheable input, and none may have errored. The max
 * age is the shortest of the procedures'.
 */
export function getAssetsCdnCacheControl({
  url,
  paths,
  type,
  errorCount,
}: {
  url: string;
  paths: readonly string[] | undefined;
  type: string;
  errorCount: number;
}): string | undefined {
  if (type !== "query" || errorCount > 0 || !paths?.length) return undefined;

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
