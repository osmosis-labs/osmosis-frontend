/** Production ingress for app.osmosis.zone. Every request goes to the Cloudflare frontend. */
export type RouterEnv = {
  /** Service binding to `osmosis-frontend-production`. */
  PRODUCTION: { fetch(request: Request): Promise<Response> };
};

const router = {
  async fetch(request: Request, env: RouterEnv): Promise<Response> {
    const started = Date.now();
    const context = {
      event: "router_upstream",
      backend: "cf",
      method: request.method,
      path: new URL(request.url).pathname.slice(0, 512),
      rayId: request.headers.get("cf-ray"),
    };
    let response: Response;
    try {
      response = await env.PRODUCTION.fetch(request);
    } catch (error) {
      console.error({
        ...context,
        outcome: "exception",
        durationMs: Date.now() - started,
        errorType: error instanceof Error ? error.name : "Unknown",
      });
      throw error;
    }

    const log = {
      ...context,
      status: response.status,
      durationMs: Date.now() - started,
      outcome: response.status >= 500 ? "http_error" : "response",
    };
    if (response.status >= 500) console.error(log);
    else console.log(log);

    // Upgrade responses carry a socket that must be returned untouched.
    if (response.status === 101) return response;

    const routed = new Response(response.body, response);
    routed.headers.set("x-osmosis-backend", "cf");
    return routed;
  },
};

export default router;
