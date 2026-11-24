/**
 * @jest-environment node
 */
import router from "../worker";

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

it.each([
  ["https://app.test/pools", {}],
  [
    "https://app.test/?osmo_backend=vercel",
    { cookie: "osmo_backend=vercel; osmo_bucket=9999" },
  ],
  ["https://app.test/pools", { "user-agent": "Googlebot" }],
])(
  "forwards %s to Cloudflare regardless of old rollout settings",
  async (url, headers) => {
    const request = new Request(url, { headers });
    const fetch = jest.fn(async () => new Response("from cf"));
    const response = await router.fetch(request, { PRODUCTION: { fetch } });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(request);
    expect(await response.text()).toBe("from cf");
    expect(response.headers.get("x-osmosis-backend")).toBe("cf");
    expect(response.headers.get("set-cookie")).toBeNull();
  }
);

it("preserves the request body and response status, headers and cookies", async () => {
  const request = new Request("https://app.test/api/broadcast-transaction", {
    method: "POST",
    body: '{"tx":"signed"}',
  });
  const fetch = jest.fn(async (forwarded: Request) => {
    expect(forwarded).toBe(request);
    expect(await forwarded.text()).toBe('{"tx":"signed"}');
    return new Response("nope", {
      status: 418,
      headers: { "set-cookie": "app=1", "cache-control": "no-store" },
    });
  });
  const response = await router.fetch(request, { PRODUCTION: { fetch } });

  expect(response.status).toBe(418);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.getSetCookie()).toEqual(["app=1"]);
});

it.each([
  ["/_next/static/old.js", "GET", 404],
  ["/pools", "GET", 503],
  ["/api/broadcast-transaction", "POST", 500],
])("returns %s failures without retrying", async (path, method, status) => {
  const origin = jest.spyOn(globalThis, "fetch");
  const fetch = jest.fn(async () => new Response("failed", { status }));
  const response = await router.fetch(
    new Request(`https://app.test${path}`, { method }),
    {
      PRODUCTION: { fetch },
    }
  );

  expect(response.status).toBe(status);
  expect(await response.text()).toBe("failed");
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(origin).not.toHaveBeenCalled();
  expect(response.headers.get("x-osmosis-fallback")).toBeNull();
});

it("returns upgrade responses untouched", async () => {
  // Node's Response constructor cannot create a Workers WebSocket upgrade.
  const upgrade = { status: 101, webSocket: {} } as unknown as Response;
  const fetch = jest.fn(async () => upgrade);
  expect(
    await router.fetch(new Request("https://app.test/socket"), {
      PRODUCTION: { fetch },
    })
  ).toBe(upgrade);
});

it("logs upstream status without query strings, cookies or bodies", async () => {
  const fetch = jest.fn(async () => new Response(null, { status: 503 }));
  await router.fetch(
    new Request(`https://app.test/${"x".repeat(600)}?secret=private`, {
      method: "POST",
      headers: { "cf-ray": "ray-1", cookie: "secret=private" },
      body: "private",
    }),
    { PRODUCTION: { fetch } }
  );

  expect(console.error).toHaveBeenCalledWith(
    expect.objectContaining({
      event: "router_upstream",
      backend: "cf",
      method: "POST",
      path: `/${"x".repeat(511)}`,
      rayId: "ray-1",
      status: 503,
      outcome: "http_error",
    })
  );
  expect(JSON.stringify((console.error as jest.Mock).mock.calls)).not.toContain(
    "private"
  );
});

it("logs and propagates exceptions without retrying or exposing their messages", async () => {
  const origin = jest.spyOn(globalThis, "fetch");
  const error = new TypeError("private upstream details");
  const fetch = jest.fn(async () => {
    throw error;
  });
  await expect(
    router.fetch(new Request("https://app.test/pools"), {
      PRODUCTION: { fetch },
    })
  ).rejects.toBe(error);

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(origin).not.toHaveBeenCalled();
  expect(console.error).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalledWith(
    expect.objectContaining({
      event: "router_upstream",
      outcome: "exception",
      errorType: "TypeError",
    })
  );
  expect(JSON.stringify((console.error as jest.Mock).mock.calls)).not.toContain(
    "private"
  );
});

it("routes /api/* directly to the API binding when present", async () => {
  const apiFetch = jest.fn(async () => new Response("from api"));
  const prodFetch = jest.fn(async () => new Response("from pages"));
  const request = new Request("https://app.test/api/pools");

  const response = await router.fetch(request, {
    PRODUCTION: { fetch: prodFetch },
    API: { fetch: apiFetch },
  });

  expect(await response.text()).toBe("from api");
  expect(apiFetch).toHaveBeenCalledTimes(1);
  expect(prodFetch).not.toHaveBeenCalled();
});
