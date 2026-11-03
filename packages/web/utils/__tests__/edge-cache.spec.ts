/**
 * @jest-environment node
 */
import {
  EDGE_CACHE_STATUS_HEADER,
  IMAGE_BROWSER_TTL_SECONDS,
  IMAGE_EDGE_TTL_SECONDS,
  imageCacheKey,
  sharedMaxAge,
  withApiEdgeCache,
  withImageEdgeCache,
} from "~/utils/edge-cache";

const POOLS_URL = "https://app.test/api/pools";

/** An in-memory stand-in for the Workers Cache API, keyed by URL. */
class MemoryCache {
  readonly entries = new Map<string, Response>();

  async match(request: Request) {
    return this.entries.get(request.url)?.clone();
  }

  async put(request: Request, response: Response) {
    this.entries.set(request.url, response);
  }
}

function setup(
  respond: (request: Request) => Response = () =>
    new Response("pools", {
      headers: { "cache-control": "public, s-maxage=60" },
    }),
  wrap: typeof withApiEdgeCache = withApiEdgeCache
) {
  const cache = new MemoryCache();
  const pending: Promise<unknown>[] = [];
  const handler = jest.fn(async (request: Request) => respond(request));
  const fetch = wrap(handler, cache as unknown as Cache, (promise) => {
    pending.push(promise);
  });
  return {
    cache,
    handler,
    fetch: async (url: string, init?: RequestInit) => {
      const response = await fetch(new Request(url, init));
      await Promise.all(pending);
      return response;
    },
  };
}

describe("withApiEdgeCache", () => {
  it("serves repeat GETs of a shared API response from the cache", async () => {
    const { fetch, handler } = setup();

    const miss = await fetch(POOLS_URL);
    expect(miss.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe("MISS");
    expect(await miss.text()).toBe("pools");

    const hit = await fetch(POOLS_URL);
    expect(hit.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe("HIT");
    expect(await hit.text()).toBe("pools");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("keeps s-maxage for the cache but strips it for browsers", async () => {
    const { fetch, cache } = setup(
      () =>
        new Response("gauges", {
          headers: {
            "cache-control": "public, s-maxage=900, stale-while-revalidate",
          },
        })
    );

    const response = await fetch("https://app.test/api/active-gauges");

    expect(response.headers.get("cache-control")).toBe("public");
    expect(
      cache.entries
        .get("https://app.test/api/active-gauges")
        ?.headers.get("cache-control")
    ).toBe("public, s-maxage=900");
  });

  it("keys on the full URL, query included", async () => {
    const { fetch, handler } = setup();

    await fetch(`${POOLS_URL}?input=a`);
    await fetch(`${POOLS_URL}?input=b`);

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("answers HEAD from a cached GET without a body", async () => {
    const { fetch, handler } = setup();

    await fetch(POOLS_URL);
    const head = await fetch(POOLS_URL, { method: "HEAD" });

    expect(head.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe("HIT");
    expect(head.body).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["a POST", POOLS_URL, { method: "POST", body: "{}" }],
    ["a page", "https://app.test/pools", {}],
    ["an authorized request", POOLS_URL, { headers: { authorization: "x" } }],
    [
      "a client the middleware blocks",
      POOLS_URL,
      { headers: { "user-agent": "python-requests/2.31" } },
    ],
  ])("passes %s straight through", async (_, url, init) => {
    const { fetch, handler, cache } = setup();

    await fetch(url, init);
    const second = await fetch(url, init);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(second.headers.has(EDGE_CACHE_STATUS_HEADER)).toBe(false);
    expect(cache.entries.size).toBe(0);
  });

  it("serves a blocked client from the handler even when the URL is cached", async () => {
    const { fetch, handler } = setup((request) =>
      request.headers.get("user-agent")?.includes("python-requests")
        ? new Response("Forbidden", { status: 403 })
        : new Response("pools", {
            headers: { "cache-control": "public, s-maxage=60" },
          })
    );

    await fetch(POOLS_URL);
    const blocked = await fetch(POOLS_URL, {
      headers: { "user-agent": "python-requests/2.31" },
    });

    expect(blocked.status).toBe(403);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("leaves responses it does not cache untouched", async () => {
    const { fetch, cache } = setup(
      () =>
        new Response("user data", {
          headers: { "cache-control": "private, max-age=10" },
        })
    );

    const response = await fetch(POOLS_URL);

    expect(response.headers.get("cache-control")).toBe("private, max-age=10");
    expect(response.headers.has(EDGE_CACHE_STATUS_HEADER)).toBe(false);
    expect(cache.entries.size).toBe(0);
  });
});

const IMAGE_URL =
  "https://app.test/_next/image?url=https%3A%2F%2Fcdn.test%2Fosmo.png&w=64&q=75";
const WEBP = { headers: { accept: "image/avif,image/webp,*/*" } };

function image(contentType = "image/webp", status = 200) {
  return new Response("pixels", {
    status,
    headers: { "content-type": contentType, vary: "Accept" },
  });
}

describe("withImageEdgeCache", () => {
  const setupImage = (respond: (request: Request) => Response) =>
    setup(respond, withImageEdgeCache);

  it("keeps a transformed image for repeat requests", async () => {
    const { fetch, handler, cache } = setupImage(() => image());

    const miss = await fetch(IMAGE_URL, WEBP);
    const hit = await fetch(IMAGE_URL, WEBP);

    expect(miss.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe("MISS");
    expect(hit.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe("HIT");
    expect(await hit.text()).toBe("pixels");
    expect(handler).toHaveBeenCalledTimes(1);
    const [stored] = cache.entries.values();
    expect(stored.headers.get("cache-control")).toBe(
      `public, s-maxage=${IMAGE_EDGE_TTL_SECONDS}`
    );
    expect(stored.headers.has("vary")).toBe(false);
  });

  it("tells browsers to cache it and that it varies by Accept", async () => {
    const { fetch } = setupImage(() => image());

    for (const response of [
      await fetch(IMAGE_URL, WEBP),
      await fetch(IMAGE_URL, WEBP),
    ]) {
      expect(response.headers.get("cache-control")).toBe(
        `public, max-age=${IMAGE_BROWSER_TTL_SECONDS}`
      );
      expect(response.headers.get("vary")).toBe("Accept");
    }
  });

  it("keeps formats negotiated from Accept apart", async () => {
    const { fetch, handler } = setupImage((request) =>
      image(
        request.headers.get("accept")?.includes("image/webp")
          ? "image/webp"
          : "image/png"
      )
    );

    await fetch(IMAGE_URL, WEBP);
    const png = await fetch(IMAGE_URL, { headers: { accept: "*/*" } });

    expect(png.headers.get("content-type")).toBe("image/png");
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["an error", () => image("image/png", 400)],
    ["a non-image body", () => new Response("nope", { status: 200 })],
  ])("does not keep %s", async (_, respond) => {
    const { fetch, handler, cache } = setupImage(respond);

    await fetch(IMAGE_URL, WEBP);
    await fetch(IMAGE_URL, WEBP);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(cache.entries.size).toBe(0);
  });
});

describe("imageCacheKey", () => {
  const url = new URL(IMAGE_URL);

  it.each([
    ["image/avif,image/webp,*/*", "image/avif,image/webp"],
    ["image/webp,*/*", "image/webp"],
    ["*/*", "none"],
    [null, "none"],
  ])("keys Accept %s by %s", (accept, formats) => {
    expect(
      new URL(imageCacheKey(url, accept)).searchParams.get("__accept")
    ).toBe(formats);
  });
});

describe("sharedMaxAge", () => {
  const response = (init: ResponseInit) => new Response("body", init);

  it.each([
    ["public, s-maxage=60", 60],
    ["S-MAXAGE=900, stale-while-revalidate", 900],
  ])("reads %s", (cacheControl, expected) => {
    expect(
      sharedMaxAge(response({ headers: { "cache-control": cacheControl } }))
    ).toBe(expected);
  });

  it.each<[string, ResponseInit]>([
    ["no Cache-Control", {}],
    ["only max-age", { headers: { "cache-control": "public, max-age=60" } }],
    ["s-maxage=0", { headers: { "cache-control": "s-maxage=0" } }],
    ["private", { headers: { "cache-control": "private, s-maxage=60" } }],
    ["no-store", { headers: { "cache-control": "no-store, s-maxage=60" } }],
    [
      "an error status",
      { status: 500, headers: { "cache-control": "s-maxage=60" } },
    ],
    [
      "a cookie",
      { headers: { "cache-control": "s-maxage=60", "set-cookie": "a=b" } },
    ],
    ["Vary: *", { headers: { "cache-control": "s-maxage=60", vary: "*" } }],
  ])("refuses %s", (_, init) => {
    expect(sharedMaxAge(response(init))).toBeUndefined();
  });
});
