/**
 * Traffic router for app.osmosis.zone (router/wrangler.jsonc). Sends a sticky share of browsers to
 * the Cloudflare production Worker and everyone else to Vercel, without changing the URL; see
 * `routing.ts` for how a request is assigned.
 */
import {
  type Backend,
  BACKEND_HEADER,
  decideBackend,
  FALLBACK_HEADER,
  isBuildAsset,
  isPageLoad,
  otherBackend,
  parsePercent,
} from "./routing";

export type RouterEnv = {
  /** Service binding to `osmosis-frontend-production`. */
  PRODUCTION: { fetch(request: Request): Promise<Response> };
  /** Share of browsers sent to Cloudflare, 0-100. */
  CF_PERCENT?: string;
  /**
   * Where Vercel traffic goes when the router does not run on app.osmosis.zone itself (a test
   * hostname). Unset on the production route, where `fetch(request)` reaches the zone's origin.
   */
  VERCEL_ORIGIN?: string;
};

const router = {
  async fetch(request: Request, env: RouterEnv): Promise<Response> {
    const { backend, setCookies } = decideBackend(
      request,
      parsePercent(env.CF_PERCENT)
    );

    const { response, servedBy, fallback } = await dispatch(
      backend,
      request,
      env
    );

    // Upgrade responses carry a socket that must be returned untouched.
    if (response.status === 101) return response;

    const routed = new Response(response.body, response);
    routed.headers.set(BACKEND_HEADER, servedBy);
    if (fallback) routed.headers.set(FALLBACK_HEADER, fallback);
    for (const cookie of setCookies)
      routed.headers.append("set-cookie", cookie);
    return routed;
  },
};

type Dispatched = { response: Response; servedBy: Backend; fallback?: string };

/**
 * Sends a request to its backend, crossing to the other platform only where that cannot repeat a
 * side effect: a build asset missing from the backend's build, and a page load the production
 * Worker failed (threw or answered 5xx), which Vercel then serves. Everything else, including API
 * calls, stays where it was routed, so a swap or broadcast never runs twice.
 */
async function dispatch(
  backend: Backend,
  request: Request,
  env: RouterEnv
): Promise<Dispatched> {
  if (backend === "cf" && isPageLoad(request)) {
    let failure: string;
    try {
      const response = await send("cf", request, env);
      if (response.status < 500) return { response, servedBy: "cf" };
      failure = String(response.status);
      await response.body?.cancel();
    } catch (error) {
      failure = "error";
      console.error("Production Worker threw on a page load", error);
    }
    return {
      response: await send("vercel", request, env),
      servedBy: "vercel",
      fallback: `cf-${failure}`,
    };
  }

  const response = await send(backend, request, env);
  if (response.status === 404 && isBuildAsset(request)) {
    await response.body?.cancel();
    const other = otherBackend(backend);
    return { response: await send(other, request, env), servedBy: other };
  }
  return { response, servedBy: backend };
}

function send(
  backend: Backend,
  request: Request,
  env: RouterEnv
): Promise<Response> {
  if (backend === "cf") return env.PRODUCTION.fetch(request);
  if (!env.VERCEL_ORIGIN) return fetch(request);

  const url = new URL(request.url);
  return fetch(
    new Request(new URL(url.pathname + url.search, env.VERCEL_ORIGIN), request)
  );
}

export default router;
