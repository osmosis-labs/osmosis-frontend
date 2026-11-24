/** Production ingress for app.osmosis.zone. Routes `/api/*` directly to the API Worker when bound, and all other requests to the pages Worker. */
export type RouterEnv = {
  /** Service binding to `osmosis-frontend-production`. */
  PRODUCTION: { fetch(request: Request): Promise<Response> };
  /** Direct service binding to `osmosis-frontend-api-production`, avoiding a pages Worker hop for `/api/*`. */
  API?: { fetch(request: Request): Promise<Response> };
};

const router = {
  async fetch(request: Request, env: RouterEnv): Promise<Response> {
    const started = Date.now();
    const pathname = new URL(request.url).pathname;
    const isApi = pathname.startsWith("/api/");
    const target = isApi && env.API ? env.API : env.PRODUCTION;
    const context = {
      event: "router_upstream",
      backend: isApi && env.API ? "cf-api" : "cf",
      method: request.method,
      path: pathname.slice(0, 512),
      rayId: request.headers.get("cf-ray"),
    };
    let response: Response;
    try {
      response = await target.fetch(request);
    } catch (error) {
      console.error({
        ...context,
        outcome: "exception",
        durationMs: Date.now() - started,
        errorType: error instanceof Error ? error.name : "Unknown",
      });
      throw error;
    }

    if (response.status >= 500) {
      console.error({
        ...context,
        status: response.status,
        durationMs: Date.now() - started,
        outcome: "http_error",
      });
    }

    // Upgrade responses carry a socket that must be returned untouched.
    if (response.status === 101) return response;

    const routed = new Response(response.body, response);
    routed.headers.set("x-osmosis-backend", "cf");
    return routed;
  },
};

export default router;
