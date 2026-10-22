import { isBlockedApiUserAgent } from "~/utils/api-bot-block";

type FetchHandler = (request: Request) => Promise<Response>;
type WaitUntil = (promise: Promise<unknown>) => void;

/** Debug header naming whether the edge cache served the response. */
export const API_CACHE_STATUS_HEADER = "x-api-cache";

/**
 * Wraps a Worker's fetch handler with the shared CDN cache Vercel gives API routes: GET responses
 * from `/api/*` that send `Cache-Control: s-maxage` are kept in `cache` for that long. Routes decide
 * what is shareable through that header (see `utils/trpc-cdn-cache.ts`), so anything they leave
 * uncached stays uncached. Like Vercel, the cache key is the URL alone, and browsers get the
 * header without `s-maxage`.
 *
 * Hits skip Next's middleware, so requests the middleware would block always reach `handler`.
 */
export function withApiEdgeCache(
  handler: FetchHandler,
  cache: Cache,
  waitUntil: WaitUntil
): FetchHandler {
  return async (request) => {
    if (!isCacheableRequest(request)) return handler(request);

    const key = new Request(request.url, { method: "GET" });
    const hit = await cache.match(key);
    if (hit) return toClientResponse(hit, request, "HIT");

    const response = await handler(request);
    const sMaxAge = sharedMaxAge(response);
    if (sMaxAge === undefined) return response;

    waitUntil(
      cache.put(key, response.clone()).catch((error: unknown) => {
        console.error("API edge cache write failed", request.url, error);
      })
    );
    return toClientResponse(response, request, "MISS");
  };
}

function isCacheableRequest(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  if (!new URL(request.url).pathname.startsWith("/api/")) return false;
  if (request.headers.has("authorization")) return false;
  return !isBlockedApiUserAgent(request.headers.get("user-agent"));
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

function parseCacheControl(header: string | null): Map<string, string> {
  const directives = new Map<string, string>();
  for (const part of (header ?? "").split(",")) {
    const [name, value = ""] = part.trim().split("=");
    if (name) directives.set(name.toLowerCase(), value.trim());
  }
  return directives;
}

/** Strips the CDN-only directives (as Vercel does) and marks the cache status. */
function toClientResponse(
  response: Response,
  request: Request,
  status: "HIT" | "MISS"
): Response {
  const headers = new Headers(response.headers);
  const cacheControl = (headers.get("cache-control") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => {
      const name = part.split("=")[0].toLowerCase();
      return part && name !== "s-maxage" && name !== "stale-while-revalidate";
    })
    .join(", ");
  if (cacheControl) headers.set("cache-control", cacheControl);
  else headers.delete("cache-control");
  headers.set(API_CACHE_STATUS_HEADER, status);

  return new Response(request.method === "HEAD" ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
