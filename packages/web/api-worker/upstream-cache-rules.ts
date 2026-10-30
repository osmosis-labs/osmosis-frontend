/**
 * Allowlist for the API Worker's shared upstream cache.
 *
 * Each `id` has a row in the Allowlist table of `UPSTREAM_CACHE.md`. A Jest
 * test fails when the two drift. Hosts are the ones this repo actually calls
 * (env defaults plus the production sidecar). An unknown host never matches.
 */

export type UpstreamCacheRule = {
  id: string;
  hosts: readonly string[];
  path: RegExp;
  /** Seconds used when the upstream sends no freshness lifetime. */
  defaultTtlSeconds: number;
  /** Hard cap. Price-like rules stay at or under 30s, and under the in-memory TTL. */
  maxTtlSeconds: number;
  /**
   * When set, both the fallback and the cap come from the URL. Used where one
   * path serves a realtime price (`realtime=true`, 3s) and a slower chart.
   */
  ttlSeconds?: (url: URL) => number;
};

const SIDECAR_HOSTS = ["sqs.osmosis.zone", "sqsprod.osmosis.zone"] as const;

/** Code default is the stage host. Production `.env` points at `data.app`. */
const NUMIA_HOSTS = [
  "data.app.osmosis.zone",
  "data.stage.osmosis.zone",
] as const;

/**
 * With `COINGECKO_API_KEY`, prices and details use the Osmosis proxies.
 * Without it, queries fall through to the public CoinGecko host.
 */
const COINGECKO_HOSTS = [
  "prices.osmosis.zone",
  "coingecko.osmosis.zone",
  "api.coingecko.com",
] as const;

function tokenChartTtl(url: URL): number {
  // In-memory historical prices are 3s when realtime and 3 minutes otherwise.
  // 30s is the price cap, so the non-realtime chart cannot keep the 3 minutes.
  return url.searchParams.get("realtime") === "true" ? 3 : 30;
}

export const UPSTREAM_CACHE_RULES: readonly UpstreamCacheRule[] = [
  {
    id: "sqs-pools",
    hosts: SIDECAR_HOSTS,
    path: /^\/pools$/,
    defaultTtlSeconds: 5,
    maxTtlSeconds: 5,
  },
  {
    id: "sqs-prices",
    hosts: SIDECAR_HOSTS,
    path: /^\/tokens\/prices$/,
    defaultTtlSeconds: 10,
    maxTtlSeconds: 10,
  },
  {
    id: "sqs-canonical-orderbooks",
    hosts: SIDECAR_HOSTS,
    path: /^\/pools\/canonical-orderbooks$/,
    // The forced-fresh in-memory read is 15s. A longer shared entry would
    // hide a pool that read is trying to observe.
    defaultTtlSeconds: 15,
    maxTtlSeconds: 15,
  },
  {
    id: "numia-pools-apr",
    hosts: NUMIA_HOSTS,
    path: /^\/pools_apr$/,
    defaultTtlSeconds: 30,
    maxTtlSeconds: 30,
  },
  {
    id: "numia-pools-apr-range",
    hosts: NUMIA_HOSTS,
    path: /^\/pools_apr_range$/,
    defaultTtlSeconds: 30,
    maxTtlSeconds: 30,
  },
  {
    id: "numia-staking-apr",
    hosts: NUMIA_HOSTS,
    path: /^\/apr$/,
    defaultTtlSeconds: 30 * 60,
    maxTtlSeconds: 30 * 60,
  },
  {
    id: "numia-token-data",
    hosts: NUMIA_HOSTS,
    path: /^\/tokens\/v2\/all$/,
    // The payload carries prices. In-memory freshness is 5 minutes; the price cap is 30s.
    defaultTtlSeconds: 30,
    maxTtlSeconds: 30,
  },
  {
    id: "numia-token-chart",
    hosts: NUMIA_HOSTS,
    path: /^\/tokens\/v2\/historical\/[^/]+\/chart$/,
    defaultTtlSeconds: 30,
    maxTtlSeconds: 30,
    ttlSeconds: tokenChartTtl,
  },
  {
    id: "numia-pair-chart",
    hosts: NUMIA_HOSTS,
    path: /^\/pairs\/v1\/historical\/[^/]+\/chart$/,
    defaultTtlSeconds: 30,
    maxTtlSeconds: 30,
  },
  {
    id: "numia-range-apr",
    hosts: NUMIA_HOSTS,
    path: /^\/cl\/v1\/apr\/rewards\/[^/]+$/,
    defaultTtlSeconds: 30,
    maxTtlSeconds: 30,
  },
  {
    id: "coingecko-simple-price",
    hosts: COINGECKO_HOSTS,
    path: /^\/api\/v3\/simple\/price$/,
    // In-memory price TTL is 60s. The price cap is 30s.
    defaultTtlSeconds: 30,
    maxTtlSeconds: 30,
  },
  {
    id: "coingecko-coin-list",
    hosts: COINGECKO_HOSTS,
    path: /^\/api\/v3\/coins\/list$/,
    defaultTtlSeconds: 60 * 60,
    maxTtlSeconds: 60 * 60,
  },
  {
    id: "coingecko-coin",
    hosts: COINGECKO_HOSTS,
    path: /^\/api\/v3\/coins\/(?!list$)[^/]+$/,
    // Coin payloads include market prices, so this stays inside the price cap
    // even though the in-memory coin record is kept for 30 minutes.
    defaultTtlSeconds: 30,
    maxTtlSeconds: 30,
  },
  {
    id: "coingecko-market-chart",
    hosts: COINGECKO_HOSTS,
    path: /^\/api\/v3\/coins\/[^/]+\/market_chart\/range$/,
    defaultTtlSeconds: 10,
    maxTtlSeconds: 10,
  },
  {
    id: "github-raw-content",
    hosts: ["raw.githubusercontent.com"],
    path: /^\/osmosis-labs\/(?:assetlists|fe-content)\/[^/]+\/.+/,
    // `main` (no commit pin) can change. Commit-pinned URLs are immutable, and
    // 5 minutes still covers a cold isolate during a burst.
    defaultTtlSeconds: 5 * 60,
    maxTtlSeconds: 5 * 60,
  },
  {
    id: "keybase-lookup",
    hosts: ["keybase.io"],
    path: /^\/_\/api\/1\.0\/user\/lookup\.json$/,
    defaultTtlSeconds: 5 * 60,
    maxTtlSeconds: 5 * 60,
  },
];

export function matchUpstreamRule(url: URL): UpstreamCacheRule | undefined {
  const host = url.hostname.toLowerCase();
  for (const rule of UPSTREAM_CACHE_RULES) {
    if (!rule.hosts.includes(host)) continue;
    if (rule.path.test(url.pathname)) return rule;
  }
  return undefined;
}

/** Fallback and cap for `url`, in seconds. */
export function ruleTtlBounds(
  rule: UpstreamCacheRule,
  url: URL
): { fallback: number; cap: number } {
  if (rule.ttlSeconds) {
    const seconds = rule.ttlSeconds(url);
    return { fallback: seconds, cap: seconds };
  }
  return { fallback: rule.defaultTtlSeconds, cap: rule.maxTtlSeconds };
}
