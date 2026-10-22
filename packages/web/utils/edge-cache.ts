import { isBlockedApiUserAgent } from "~/utils/api-bot-block";

type FetchHandler = (request: Request) => Promise<Response>;
type WaitUntil = (promise: Promise<unknown>) => void;

/** Debug header naming whether the edge cache served the response. */
export const EDGE_CACHE_STATUS_HEADER = "x-edge-cache";

/**
 * How long optimized images stay at the edge, and in browsers. Vercel keeps them for a year
 * (`max-age=31536000`); token logos can change in place upstream, so stay well under that.
 */
export const IMAGE_EDGE_TTL_SECONDS = 7 * 24 * 60 * 60;
export const IMAGE_BROWSER_TTL_SECONDS = 24 * 60 * 60;

/** The image formats Next can negotiate from `Accept` (`images.formats`). */
const NEGOTIATED_IMAGE_FORMATS = ["image/avif", "image/webp"];

type CachePolicy = {
  /** The cache key, which must identify the response exactly. */
  key: string;
  /** Seconds to keep `response` at the edge, or undefined to leave it uncached. */
  edgeTtl(response: Response): number | undefined;
  /** Adjusts a copy of the response headers for browsers. */
  toClientHeaders(headers: Headers): void;
};

/**
 * Wraps a Worker's fetch handler with the shared CDN cache Vercel gives the app, using the
 * location's `cache`:
 *
 * - API routes: GET `/api/*` responses that send `Cache-Control: s-maxage` are kept for that long.
 *   Routes decide what is shareable through that header (see `utils/trpc-cdn-cache.ts`), so
 *   anything they leave uncached stays uncached. Like Vercel, the key is the URL alone, and
 *   browsers get the header without `s-maxage`.
 * - Optimized images (`/_next/image`): OpenNext refetches and re-transforms the source on every
 *   request, so successful results are kept for `IMAGE_EDGE_TTL_SECONDS`, keyed by URL and the
 *   formats the browser accepts.
 *
 * Hits skip Next's middleware, so API requests the middleware would block always reach `handler`.
 */
export function withEdgeCache(
  handler: FetchHandler,
  cache: Cache,
  waitUntil: WaitUntil
): FetchHandler {
  return async (request) => {
    const policy = cachePolicy(request);
    if (!policy) return handler(request);

    const key = new Request(policy.key, { method: "GET" });
    const hit = await cache.match(key);
    if (hit) return toClientResponse(hit, request, policy, "HIT");

    const response = await handler(request);
    const ttl = policy.edgeTtl(response);
    if (ttl === undefined) return response;

    waitUntil(
      cache
        .put(key, toStoredResponse(response.clone(), ttl))
        .catch((error: unknown) => {
          console.error("Edge cache write failed", policy.key, error);
        })
    );
    return toClientResponse(response, request, policy, "MISS");
  };
}

function cachePolicy(request: Request): CachePolicy | undefined {
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;
  if (request.headers.has("authorization")) return undefined;

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    if (isBlockedApiUserAgent(request.headers.get("user-agent"))) {
      return undefined;
    }
    return {
      key: request.url,
      edgeTtl: sharedMaxAge,
      toClientHeaders: (headers) => {
        const cacheControl = withoutSharedDirectives(
          headers.get("cache-control")
        );
        if (cacheControl) headers.set("cache-control", cacheControl);
        else headers.delete("cache-control");
      },
    };
  }
  if (url.pathname === "/_next/image") {
    return {
      key: imageCacheKey(url, request.headers.get("accept")),
      edgeTtl: (response) =>
        isImage(response) ? IMAGE_EDGE_TTL_SECONDS : undefined,
      toClientHeaders: (headers) => {
        headers.set(
          "cache-control",
          `public, max-age=${IMAGE_BROWSER_TTL_SECONDS}`
        );
        headers.set("vary", "Accept");
      },
    };
  }
  return undefined;
}

/** The response's `s-maxage` in seconds, or undefined if it must not be shared. */
export function sharedMaxAge(response: Response): number | undefined {
  if (response.status !== 200) return undefined;
  if (response.headers.has("set-cookie")) return undefined;
  if (response.headers.get("vary")?.includes("*")) return undefined;

  const directives = parseCacheControl(response.headers.get("cache-control"));
  if (["private", "no-store", "no-cache"].some((d) => directives.has(d))) {
    return undefined;
  }
  const sMaxAge = Number(directives.get("s-maxage"));
  return Number.isInteger(sMaxAge) && sMaxAge > 0 ? sMaxAge : undefined;
}

function isImage(response: Response): boolean {
  return (
    response.status === 200 &&
    !response.headers.has("set-cookie") &&
    (response.headers.get("content-type") ?? "").startsWith("image/")
  );
}

/**
 * Next picks AVIF/WebP from `Accept`, which the Workers cache does not key on, so the accepted
 * formats become part of the key.
 */
export function imageCacheKey(url: URL, accept: string | null): string {
  const formats = NEGOTIATED_IMAGE_FORMATS.filter((format) =>
    (accept ?? "").includes(format)
  );
  const key = new URL(url);
  key.searchParams.set("__accept", formats.join(",") || "none");
  return key.toString();
}

function parseCacheControl(header: string | null): Map<string, string> {
  const directives = new Map<string, string>();
  for (const part of (header ?? "").split(",")) {
    const [name, value = ""] = part.trim().split("=");
    if (name) directives.set(name.toLowerCase(), value.trim());
  }
  return directives;
}

/** Cache-Control without the CDN-only directives, as Vercel sends it to browsers. */
function withoutSharedDirectives(header: string | null): string {
  return (header ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => {
      const name = part.split("=")[0].toLowerCase();
      return part && name !== "s-maxage" && name !== "stale-while-revalidate";
    })
    .join(", ");
}

/** The copy kept at the edge: lives for `ttl` and, being keyed already, does not vary. */
function toStoredResponse(response: Response, ttl: number): Response {
  const headers = new Headers(response.headers);
  headers.set("cache-control", `public, s-maxage=${ttl}`);
  headers.delete("vary");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function toClientResponse(
  response: Response,
  request: Request,
  policy: CachePolicy,
  status: "HIT" | "MISS"
): Response {
  const headers = new Headers(response.headers);
  policy.toClientHeaders(headers);
  headers.set(EDGE_CACHE_STATUS_HEADER, status);

  return new Response(request.method === "HEAD" ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
