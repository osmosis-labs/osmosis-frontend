/**
 * Cloudflare API Worker (`api-worker/wrangler.jsonc`). Serves `/api/*` outside the OpenNext pages
 * Worker. The pages Worker (`worker.ts`) forwards `/api/*` here over its `API` service binding.
 *
 * `installUpstreamCache` wraps this isolate's `fetch` so shared packages pick up the upstream
 * cache without a code change. The pages Worker and Vercel never load this module.
 */
import { handleApiRequest } from "./dispatch";
import { apiHandlers } from "./handlers";
import {
  applyUpstreamServerTiming,
  bindUpstreamCache,
  installUpstreamCache,
  runWithUpstreamCache,
} from "./upstream-cache";

type WorkerContext = { waitUntil(promise: Promise<unknown>): void };

installUpstreamCache();

const worker = {
  fetch(
    request: Request,
    _env: unknown,
    ctx: WorkerContext
  ): Promise<Response> {
    // `caches.default` is the Workers runtime's shared cache for this location.
    // The API edge cache (`withApiEdgeCache`) and the upstream cache both use it;
    // they key on different URLs, so the entries do not collide.
    const cache = (caches as unknown as { default: Cache }).default;
    bindUpstreamCache(cache);
    const waitUntil = (promise: Promise<unknown>) => ctx.waitUntil(promise);
    return runWithUpstreamCache(waitUntil, async () => {
      const response = await handleApiRequest(
        request,
        waitUntil,
        cache,
        apiHandlers
      );
      return applyUpstreamServerTiming(response);
    });
  },
};

export default worker;
