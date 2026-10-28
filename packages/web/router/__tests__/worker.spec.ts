/**
 * @jest-environment node
 */
import {
  API_WORKER_HEADER,
  API_WORKER_NAME,
  BACKEND_HEADER,
  BUCKET_COOKIE,
  FALLBACK_HEADER,
} from "../routing";
import router, { type RouterEnv } from "../worker";

const CF_COOKIE = `${BUCKET_COOKIE}=0`;
const VERCEL_COOKIE = `${BUCKET_COOKIE}=9999`;

function setup({
  cf = () => new Response("from cf"),
  api = () => new Response("from api"),
  vercel = () => new Response("from vercel"),
  percent = "5",
  vercelOrigin,
}: {
  cf?: (request: Request) => Response | Promise<Response>;
  api?: (request: Request) => Response | Promise<Response>;
  vercel?: (request: Request) => Response;
  percent?: string;
  vercelOrigin?: string;
} = {}) {
  const production = jest.fn(async (request: Request) => cf(request));
  const apiWorker = jest.fn(async (request: Request) => api(request));
  const origin = jest
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input) => vercel(input as Request));
  const env: RouterEnv = {
    PRODUCTION: { fetch: production },
    API: { fetch: apiWorker },
    CF_PERCENT: percent,
    VERCEL_ORIGIN: vercelOrigin,
  };
  return {
    production,
    apiWorker,
    origin,
    route: (url: string, cookie?: string, init: RequestInit = {}) =>
      router.fetch(
        new Request(url, {
          ...init,
          headers: {
            ...(cookie ? { cookie } : {}),
            "sec-fetch-dest": "document",
            ...(init.headers as Record<string, string> | undefined),
          },
        }),
        env
      ),
  };
}

afterEach(() => jest.restoreAllMocks());

describe("router", () => {
  it("serves a Cloudflare-bucket browser from the production Worker", async () => {
    const { route, production, apiWorker, origin } = setup();

    const response = await route("https://app.test/pools", CF_COOKIE);

    expect(await response.text()).toBe("from cf");
    expect(response.headers.get(BACKEND_HEADER)).toBe("cf");
    expect(response.headers.get(API_WORKER_HEADER)).toBeNull();
    expect(production).toHaveBeenCalledTimes(1);
    expect(apiWorker).not.toHaveBeenCalled();
    expect(origin).not.toHaveBeenCalled();
  });

  it("sends Cloudflare /api to the API Worker", async () => {
    const { route, production, apiWorker, origin } = setup();

    const response = await route("https://app.test/api/pools/1", CF_COOKIE, {
      headers: { "sec-fetch-dest": "empty" },
    });

    expect(await response.text()).toBe("from api");
    expect(response.headers.get(BACKEND_HEADER)).toBe("cf");
    expect(response.headers.get(API_WORKER_HEADER)).toBe(API_WORKER_NAME);
    expect(apiWorker).toHaveBeenCalledTimes(1);
    expect(production).not.toHaveBeenCalled();
    expect(origin).not.toHaveBeenCalled();
  });

  it("passes the rest through to Vercel at the same URL", async () => {
    const { route, production, origin } = setup();

    const response = await route("https://app.test/pools", VERCEL_COOKIE);

    expect(await response.text()).toBe("from vercel");
    expect(response.headers.get(BACKEND_HEADER)).toBe("vercel");
    expect((origin.mock.calls[0][0] as Request).url).toBe(
      "https://app.test/pools"
    );
    expect(production).not.toHaveBeenCalled();
  });

  it("rewrites Vercel requests to VERCEL_ORIGIN when the router runs on a test hostname", async () => {
    const { route, origin } = setup({
      vercelOrigin: "https://app.osmosis.zone",
    });

    await route("https://canary.test/assets/OSMO?tab=info", VERCEL_COOKIE);

    expect((origin.mock.calls[0][0] as Request).url).toBe(
      "https://app.osmosis.zone/assets/OSMO?tab=info"
    );
  });

  it("keeps the backend's status, headers and cookies, adding its own", async () => {
    const { route } = setup({
      percent: "100",
      cf: () =>
        new Response("nope", {
          status: 418,
          headers: { "set-cookie": "app=1", "cache-control": "no-store" },
        }),
    });

    const response = await route("https://app.test/");

    expect(response.status).toBe(418);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const cookies = response.headers.getSetCookie();
    expect(cookies).toContain("app=1");
    expect(cookies.some((c) => c.startsWith(`${BUCKET_COOKIE}=`))).toBe(true);
  });

  it("retries a missing build asset on the other platform", async () => {
    const { route, production, origin } = setup({
      vercel: () => new Response("not found", { status: 404 }),
    });

    const response = await route(
      "https://app.test/_next/static/chunks/main-abc.js",
      VERCEL_COOKIE
    );

    expect(await response.text()).toBe("from cf");
    expect(response.headers.get(BACKEND_HEADER)).toBe("cf");
    expect(origin).toHaveBeenCalledTimes(1);
    expect(production).toHaveBeenCalledTimes(1);
  });

  it("never retries other 404s or failures on the other platform", async () => {
    const { route, production, apiWorker } = setup({
      vercel: () => new Response("not found", { status: 404 }),
    });

    const page = await route("https://app.test/missing", VERCEL_COOKIE);
    const api = await route(
      "https://app.test/api/broadcast-transaction",
      VERCEL_COOKIE,
      { method: "POST", body: "{}" }
    );

    expect(page.status).toBe(404);
    expect(api.status).toBe(404);
    expect(production).not.toHaveBeenCalled();
    expect(apiWorker).not.toHaveBeenCalled();
  });

  it("serves a page load from Vercel when the production Worker fails it", async () => {
    const errorBody = new Response("error", { status: 503 });
    const cancel = jest.spyOn(errorBody.body!, "cancel");
    const { route, origin } = setup({ cf: () => errorBody });

    const response = await route("https://app.test/pools", CF_COOKIE);

    expect(await response.text()).toBe("from vercel");
    expect(response.headers.get(BACKEND_HEADER)).toBe("vercel");
    expect(response.headers.get(FALLBACK_HEADER)).toBe("cf-503");
    expect(origin).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalled();
  });

  it("serves a page load from Vercel when the production Worker throws", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const { route } = setup({
      cf: () => Promise.reject(new Error("exceeded CPU limit")),
    });

    const response = await route("https://app.test/pools", CF_COOKIE);

    expect(await response.text()).toBe("from vercel");
    expect(response.headers.get(FALLBACK_HEADER)).toBe("cf-error");
  });

  it("keeps API failures on the API Worker, with no platform fallback", async () => {
    const { route, origin, production, apiWorker } = setup({
      api: () => new Response("error", { status: 500 }),
    });

    const api = await route("https://app.test/api/pools", CF_COOKIE, {
      headers: { "sec-fetch-dest": "empty" },
    });
    const broadcast = await route(
      "https://app.test/api/broadcast-transaction",
      CF_COOKIE,
      { method: "POST", body: "{}" }
    );

    expect(api.status).toBe(500);
    expect(broadcast.status).toBe(500);
    expect(api.headers.get(BACKEND_HEADER)).toBe("cf");
    expect(api.headers.get(API_WORKER_HEADER)).toBe(API_WORKER_NAME);
    expect(api.headers.get(FALLBACK_HEADER)).toBeNull();
    expect(apiWorker).toHaveBeenCalledTimes(2);
    expect(production).not.toHaveBeenCalled();
    expect(origin).not.toHaveBeenCalled();
  });

  it("keeps a non-API production failure on Cloudflare", async () => {
    const { route, origin, apiWorker } = setup({
      cf: () => new Response("error", { status: 500 }),
    });

    const response = await route("https://app.test/pools", CF_COOKIE, {
      headers: { "sec-fetch-dest": "empty" },
    });

    expect(response.status).toBe(500);
    expect(response.headers.get(FALLBACK_HEADER)).toBeNull();
    expect(response.headers.get(API_WORKER_HEADER)).toBeNull();
    expect(apiWorker).not.toHaveBeenCalled();
    expect(origin).not.toHaveBeenCalled();
  });

  it("sends everyone to Vercel at 0%", async () => {
    const { route, production } = setup({ percent: "0" });

    const response = await route("https://app.test/pools", CF_COOKIE);

    expect(response.headers.get(BACKEND_HEADER)).toBe("vercel");
    expect(production).not.toHaveBeenCalled();
  });
});
