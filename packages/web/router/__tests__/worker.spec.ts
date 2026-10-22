/**
 * @jest-environment node
 */
import { BACKEND_HEADER, BUCKET_COOKIE } from "../routing";
import router, { type RouterEnv } from "../worker";

const CF_COOKIE = `${BUCKET_COOKIE}=0`;
const VERCEL_COOKIE = `${BUCKET_COOKIE}=9999`;

function setup({
  cf = () => new Response("from cf"),
  vercel = () => new Response("from vercel"),
  percent = "5",
  vercelOrigin,
}: {
  cf?: (request: Request) => Response;
  vercel?: (request: Request) => Response;
  percent?: string;
  vercelOrigin?: string;
} = {}) {
  const production = jest.fn(async (request: Request) => cf(request));
  const origin = jest
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input) => vercel(input as Request));
  const env: RouterEnv = {
    PRODUCTION: { fetch: production },
    CF_PERCENT: percent,
    VERCEL_ORIGIN: vercelOrigin,
  };
  return {
    production,
    origin,
    route: (url: string, cookie?: string, init: RequestInit = {}) =>
      router.fetch(
        new Request(url, {
          ...init,
          headers: {
            ...(cookie ? { cookie } : {}),
            "sec-fetch-dest": "document",
          },
        }),
        env
      ),
  };
}

afterEach(() => jest.restoreAllMocks());

describe("router", () => {
  it("serves a Cloudflare-bucket browser from the production Worker", async () => {
    const { route, production, origin } = setup();

    const response = await route("https://app.test/pools", CF_COOKIE);

    expect(await response.text()).toBe("from cf");
    expect(response.headers.get(BACKEND_HEADER)).toBe("cf");
    expect(production).toHaveBeenCalledTimes(1);
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
    const { route, production } = setup({
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
  });

  it("sends everyone to Vercel at 0%", async () => {
    const { route, production } = setup({ percent: "0" });

    const response = await route("https://app.test/pools", CF_COOKIE);

    expect(response.headers.get(BACKEND_HEADER)).toBe("vercel");
    expect(production).not.toHaveBeenCalled();
  });
});
