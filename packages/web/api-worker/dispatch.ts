import { isBlockedApiUserAgent } from "~/utils/api-bot-block";
import { withApiEdgeCache } from "~/utils/edge-cache";

import { type ApiHandler, type ApiHandlerId, matchApiRoute } from "./routes";

type WaitUntil = (promise: Promise<unknown>) => void;

/**
 * API Worker fetch, with handlers injected so tests never load the server bundle.
 *
 * Blocked user agents get the same 403 as `middleware.ts` (matcher `/api/:path*`) and never see a
 * cached response. Unknown paths are JSON 404. Handler throws become a JSON 500 with no stack.
 * Method checks stay inside the handlers.
 */
export async function handleApiRequest(
  request: Request,
  waitUntil: WaitUntil,
  cache: Cache,
  handlers: Record<ApiHandlerId, ApiHandler>
): Promise<Response> {
  const url = new URL(request.url);
  if (
    url.pathname.startsWith("/api/") &&
    isBlockedApiUserAgent(request.headers.get("user-agent"))
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  const match = matchApiRoute(url.pathname);
  if (!match) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const handlerId = match.handlerId;
  const cached = withApiEdgeCache(
    (req) => invokeHandler(handlers[handlerId], handlerId, req),
    cache,
    waitUntil
  );
  return cached(request);
}

async function invokeHandler(
  handler: ApiHandler,
  handlerId: ApiHandlerId,
  request: Request
): Promise<Response> {
  try {
    return await handler(request);
  } catch (error) {
    console.error("API handler threw", handlerId, error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
