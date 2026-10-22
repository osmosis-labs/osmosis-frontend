/**
 * Traffic router for app.osmosis.zone (router/wrangler.jsonc). Sends a sticky share of browsers to
 * the Cloudflare production Worker and everyone else to Vercel, without changing the URL; see
 * `routing.ts` for how a request is assigned.
 */
import {
  type Backend,
  BACKEND_HEADER,
  decideBackend,
  isBuildAsset,
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

    let servedBy = backend;
    let response = await send(backend, request, env);
    if (response.status === 404 && isBuildAsset(request)) {
      servedBy = otherBackend(backend);
      response = await send(servedBy, request, env);
    }

    // Upgrade responses carry a socket that must be returned untouched.
    if (response.status === 101) return response;

    const routed = new Response(response.body, response);
    routed.headers.set(BACKEND_HEADER, servedBy);
    for (const cookie of setCookies)
      routed.headers.append("set-cookie", cookie);
    return routed;
  },
};

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
