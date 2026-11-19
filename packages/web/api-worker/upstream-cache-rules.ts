/**
 * Allowlist for the API Worker's shared upstream cache.
 *
 * Only responses that are the same for every user belong here. Hosts are the
 * ones this repo actually calls (env defaults plus the production sidecar). An
 * unknown host never matches.
 *
 * Left out on purpose: `/pools/canonical-orderbooks` (a forced-fresh read has
 * to see a pool that was just created; a shared entry hides it), SQS quote
 * routes (price-like, one URL per amount), Skip/Squid lists (an empty or
 * rate-limited 200 would be pinned), LCD/RPC and wasm smart queries (the same
 * hosts and messages can carry an account), and any path with an address,
 * position, order or tx hash.
 */

export type UpstreamCacheRule = {
  id: string;
  hosts: readonly string[];
  path: RegExp;
  /**
   * Seconds to keep an entry: the fallback when the upstream sends no freshness
   * lifetime, and the cap when it does. Spot prices stay at or under 30s. A
   * historical chart may match its in-memory TTL when that TTL is the bucket
   * width. The function form reads it from the URL, where one path serves a
   * realtime price (`realtime=true`, 3s) and a slower chart.
   */
  ttlSeconds: number | ((url: URL) => number);
  /**
   * When set, a 2xx body is stored only if this returns true. For upstreams that
   * answer "no data" with a 200 the caller won't keep, which the cache would
   * otherwise pin for the whole ttl.
   */
  acceptBody?: (body: ArrayBuffer) => boolean;
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

/** CoinGecko answers a range it has no data for with `{"prices":[]}`, which
 *  `getCoinGeckoCoinMarketChart` refuses to cache. */
function hasMarketChartPrices(body: ArrayBuffer): boolean {
  try {
    const chart: unknown = JSON.parse(new TextDecoder().decode(body));
    return (
      typeof chart === "object" &&
      chart !== null &&
      "prices" in chart &&
      Array.isArray(chart.prices) &&
      chart.prices.length > 0
    );
  } catch {
    return false;
  }
}

function tokenChartTtl(url: URL): number {
  // In-memory historical prices are 3s when realtime and 3 minutes otherwise.
  // 30s is the price cap, so the non-realtime chart cannot keep the 3 minutes.
  return url.searchParams.get("realtime") === "true" ? 3 : 30;
}

const UPSTREAM_CACHE_RULES: readonly UpstreamCacheRule[] = [
  {
    id: "sqs-pools",
    hosts: SIDECAR_HOSTS,
    path: /^\/pools$/,
    ttlSeconds: 5,
  },
  {
    id: "sqs-prices",
    hosts: SIDECAR_HOSTS,
    path: /^\/tokens\/prices$/,
    ttlSeconds: 10,
  },
  {
    id: "numia-pools-apr",
    hosts: NUMIA_HOSTS,
    path: /^\/pools_apr$/,
    ttlSeconds: 30,
  },
  {
    id: "numia-pools-apr-range",
    hosts: NUMIA_HOSTS,
    path: /^\/pools_apr_range$/,
    ttlSeconds: 30,
  },
  {
    id: "numia-staking-apr",
    hosts: NUMIA_HOSTS,
    path: /^\/apr$/,
    ttlSeconds: 30 * 60,
  },
  {
    id: "numia-token-data",
    hosts: NUMIA_HOSTS,
    path: /^\/tokens\/v2\/all$/,
    // The payload carries prices. In-memory freshness is 5 minutes; the price cap is 30s.
    ttlSeconds: 30,
  },
  {
    id: "numia-token-chart",
    hosts: NUMIA_HOSTS,
    path: /^\/tokens\/v2\/historical\/[^/]+\/chart$/,
    ttlSeconds: tokenChartTtl,
  },
  {
    id: "numia-pair-chart",
    hosts: NUMIA_HOSTS,
    path: /^\/pairs\/v1\/historical\/[^/]+\/chart$/,
    ttlSeconds: 30,
  },
  {
    id: "numia-range-apr",
    hosts: NUMIA_HOSTS,
    path: /^\/cl\/v1\/apr\/rewards\/[^/]+$/,
    ttlSeconds: 30,
  },
  {
    id: "coingecko-simple-price",
    hosts: COINGECKO_HOSTS,
    path: /^\/api\/v3\/simple\/price$/,
    // In-memory price TTL is 60s. The price cap is 30s.
    ttlSeconds: 30,
  },
  {
    id: "coingecko-coin-list",
    hosts: COINGECKO_HOSTS,
    path: /^\/api\/v3\/coins\/list$/,
    ttlSeconds: 60 * 60,
  },
  {
    id: "coingecko-coin",
    hosts: COINGECKO_HOSTS,
    path: /^\/api\/v3\/coins\/(?!list$)[^/]+$/,
    // Coin payloads include market prices, so this stays inside the price cap
    // even though the in-memory coin record is kept for 30 minutes.
    ttlSeconds: 30,
  },
  {
    id: "coingecko-market-chart",
    hosts: COINGECKO_HOSTS,
    path: /^\/api\/v3\/coins\/[^/]+\/market_chart\/range$/,
    // Matches `getCoinGeckoCoinMarketChart`: the range is bucketed (shortest
    // bucket is 5 minutes) and the in-memory entry lives for that same 5
    // minutes. A 10s cap left every isolate refetching CoinGecko inside one bucket.
    ttlSeconds: 5 * 60,
    acceptBody: hasMarketChartPrices,
  },
  {
    id: "github-raw-content",
    hosts: ["raw.githubusercontent.com"],
    path: /^\/osmosis-labs\/(?:assetlists|fe-content)\/[^/]+\/.+/,
    // `main` (no commit pin) can change. Commit-pinned URLs are immutable, and
    // 5 minutes still covers a cold isolate during a burst.
    ttlSeconds: 5 * 60,
  },
  {
    id: "keybase-lookup",
    hosts: ["keybase.io"],
    path: /^\/_\/api\/1\.0\/user\/lookup\.json$/,
    ttlSeconds: 5 * 60,
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

/** The rule's TTL for `url`, in seconds: both the fallback and the cap. */
export function ruleTtlSeconds(rule: UpstreamCacheRule, url: URL): number {
  return typeof rule.ttlSeconds === "function"
    ? rule.ttlSeconds(url)
    : rule.ttlSeconds;
}
