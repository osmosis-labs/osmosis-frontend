export type Backend = "cf" | "vercel";

/** Response header naming the platform that served a request. */
export const BACKEND_HEADER = "x-osmosis-backend";
/** Set when a Cloudflare-bucket `/api/*` request was served by the API Worker. */
export const API_WORKER_HEADER = "x-osmosis-api-worker";
export const API_WORKER_NAME = "osmosis-frontend-api-production";
/** Set when Vercel served a page load the production Worker failed: `cf-<status>` or `cf-error`. */
export const FALLBACK_HEADER = "x-osmosis-fallback";
/** Pins a browser's traffic bucket (0-9999) across IP and user-agent changes. */
export const BUCKET_COOKIE = "osmo_bucket";
/** Session pin to one platform for QA, set through `?osmo_backend=cf|vercel|auto`. */
export const OVERRIDE_COOKIE = "osmo_backend";
export const OVERRIDE_PARAM = "osmo_backend";

const BUCKETS = 10_000;
const BUCKET_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const CRAWLER_USER_AGENT =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|lighthouse/i;

export type RouteDecision = {
  backend: Backend;
  /** `Set-Cookie` values to add to the response. */
  setCookies: string[];
};

/** `CF_PERCENT` as a share of traffic in [0, 100]; anything unparseable routes nothing to Cloudflare. */
export function parsePercent(value: string | undefined): number {
  const percent = Number(value);
  if (!value || !Number.isFinite(percent)) return 0;
  return Math.min(100, Math.max(0, percent));
}

/**
 * Picks the platform for a request. In order:
 *
 * 1. A QA override (`?osmo_backend=cf|vercel`, kept in a session cookie; `auto` clears it).
 * 2. Crawlers stay on Vercel, so search indexing is unaffected by the rollout.
 * 3. The browser's bucket: from its cookie, else a hash of IP and user agent so that cookie-less
 *    requests (and a page's own assets before the cookie lands) stay consistent. A bucket goes to
 *    Cloudflare while it is below `cfPercent` of all buckets, so ramping up or down only moves
 *    the browsers at the margin. Page loads store the bucket in a cookie.
 */
export function decideBackend(
  request: Request,
  cfPercent: number
): RouteDecision {
  const url = new URL(request.url);
  const cookies = parseCookies(request.headers.get("cookie"));
  const setCookies: string[] = [];

  let override = cookies.get(OVERRIDE_COOKIE);
  const param = url.searchParams.get(OVERRIDE_PARAM);
  if (param === "cf" || param === "vercel") {
    override = param;
    setCookies.push(serializeCookie(OVERRIDE_COOKIE, param));
  } else if (param === "auto") {
    override = undefined;
    setCookies.push(serializeCookie(OVERRIDE_COOKIE, "", 0));
  }
  if (override === "cf" || override === "vercel") {
    return { backend: override, setCookies };
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (CRAWLER_USER_AGENT.test(userAgent)) {
    return { backend: "vercel", setCookies };
  }

  let bucket = parseBucket(cookies.get(BUCKET_COOKIE));
  if (bucket === undefined) {
    bucket = hashBucket(
      `${request.headers.get("cf-connecting-ip") ?? ""}|${userAgent}`
    );
    if (isPageLoad(request)) {
      setCookies.push(
        serializeCookie(BUCKET_COOKIE, String(bucket), BUCKET_MAX_AGE_SECONDS)
      );
    }
  }

  const backend = bucket < (cfPercent / 100) * BUCKETS ? "cf" : "vercel";
  return { backend, setCookies };
}

/**
 * Immutable build output. A page from one platform can request it from the other after a ramp
 * change or kill switch, and the other platform's build does not have it, so a 404 here is retried
 * on the other platform. Only safe because these are idempotent GETs.
 */
export function isBuildAsset(request: Request): boolean {
  return (
    (request.method === "GET" || request.method === "HEAD") &&
    new URL(request.url).pathname.startsWith("/_next/static/")
  );
}

export function otherBackend(backend: Backend): Backend {
  return backend === "cf" ? "vercel" : "cf";
}

/** A top-level document GET: safe to send twice, and the request that sets the bucket cookie. */
export function isPageLoad(request: Request): boolean {
  if (request.method !== "GET") return false;
  const dest = request.headers.get("sec-fetch-dest");
  if (dest) return dest === "document";
  return (request.headers.get("accept") ?? "").includes("text/html");
}

function parseBucket(value: string | undefined): number | undefined {
  if (!value || !/^\d{1,4}$/.test(value)) return undefined;
  return Number(value);
}

/** FNV-1a, folded into [0, BUCKETS). */
export function hashBucket(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % BUCKETS;
}

function parseCookies(header: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of (header ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index > 0) {
      cookies.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
    }
  }
  return cookies;
}

/** A first-party cookie; without `maxAge` it lasts for the browser session. */
function serializeCookie(name: string, value: string, maxAge?: number) {
  const attributes = [`${name}=${value}`, "Path=/", "Secure", "SameSite=Lax"];
  if (maxAge !== undefined) attributes.push(`Max-Age=${maxAge}`);
  return attributes.join("; ");
}
