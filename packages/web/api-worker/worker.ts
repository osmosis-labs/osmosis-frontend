/**
 * Cloudflare API Worker (`api-worker/wrangler.jsonc`). Serves `/api/*` outside the OpenNext pages
 * Worker. Pages stay on OpenNext; the traffic router sends `/api/*` here for the Cloudflare bucket.
 */
import { handleApiRequest } from "./dispatch";
import { apiHandlers } from "./handlers";

type WorkerContext = { waitUntil(promise: Promise<unknown>): void };

const worker = {
  fetch(
    request: Request,
    _env: unknown,
    ctx: WorkerContext
  ): Promise<Response> {
    // `caches.default` is the Workers runtime's shared cache for this location.
    const cache = (caches as unknown as { default: Cache }).default;
    return handleApiRequest(
      request,
      (promise) => ctx.waitUntil(promise),
      cache,
      apiHandlers
    );
  },
};

export default worker;
