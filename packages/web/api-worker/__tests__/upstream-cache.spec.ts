/**
 * @jest-environment node
 */
import {
  applyUpstreamServerTiming,
  bindUpstreamCache,
  installUpstreamCache,
  restoreUpstreamCache,
  runWithUpstreamCache,
} from "../upstream-cache";

const POOLS = "https://sqs.osmosis.zone/pools";
const APR = "https://data.app.osmosis.zone/apr";
const PRICES = "https://sqs.osmosis.zone/tokens/prices?base=uosmo";

/** An in-memory stand-in for the Workers Cache API, keyed by URL. */
class MemoryCache {
  readonly entries = new Map<string, Response>();
  matchError: Error | undefined;
  putError: Error | undefined;

  async match(request: Request) {
    if (this.matchError) throw this.matchError;
    return this.entries.get(request.url)?.clone();
  }

  async put(request: Request, response: Response) {
    if (this.putError) throw this.putError;
    this.entries.set(request.url, response.clone());
  }
}

function setup() {
  const cache = new MemoryCache();
  const pending: Promise<unknown>[] = [];
  const upstream = jest.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response("pools", { status: 200 })
  );
  const previous = globalThis.fetch;
  globalThis.fetch = upstream as unknown as typeof fetch;
  installUpstreamCache();
  bindUpstreamCache(cache as unknown as Cache);

  const call = (input: RequestInfo | URL, init?: RequestInit) =>
    runWithUpstreamCache(
      (promise) => {
        pending.push(promise);
      },
      () => globalThis.fetch(input, init)
    );

  return {
    cache,
    upstream,
    pending,
    call,
    flush: () => Promise.all(pending),
    restoreFetch: () => {
      restoreUpstreamCache();
      globalThis.fetch = previous;
    },
  };
}

describe("upstream cache", () => {
  let ctx: ReturnType<typeof setup>;

  beforeEach(() => {
    ctx = setup();
  });

  afterEach(() => {
    ctx.restoreFetch();
  });

  it("stores an allowlisted GET and serves the next one from the cache", async () => {
    const miss = await ctx.call(POOLS);
    await ctx.flush();
    expect(miss.headers.get("server-timing")).toBeNull();
    expect(await miss.text()).toBe("pools");

    const hit = await ctx.call(POOLS);
    expect(await hit.text()).toBe("pools");
    expect(ctx.upstream).toHaveBeenCalledTimes(1);

    const timed = await runWithUpstreamCache(
      (promise) => {
        ctx.pending.push(promise);
      },
      async () => applyUpstreamServerTiming(await globalThis.fetch(POOLS))
    );
    expect(timed.headers.get("server-timing")).toBe(
      'upstream;desc="hit=1 miss=0 bypass=0"'
    );
  });

  it("does not cache a user-specific URL or a POST", async () => {
    const userUrl = "https://data.app.osmosis.zone/v2/txs/osmo1qqqq";
    await ctx.call(userUrl);
    await ctx.call(userUrl);
    await ctx.call(POOLS, { method: "POST", body: "{}" });
    await ctx.flush();

    expect(ctx.cache.entries.size).toBe(0);
    expect(ctx.upstream).toHaveBeenCalledTimes(3);
  });

  it("does not cache the canonical orderbook list", async () => {
    const orderbooks = "https://sqs.osmosis.zone/pools/canonical-orderbooks";
    await ctx.call(orderbooks);
    await ctx.call(orderbooks);
    await ctx.flush();

    expect(ctx.cache.entries.size).toBe(0);
    expect(ctx.upstream).toHaveBeenCalledTimes(2);
  });

  it("forwards a Request body on a bypassed POST", async () => {
    const original = new Request(POOLS, { method: "POST", body: "{}" });

    await ctx.call(original);

    expect(original.bodyUsed).toBe(false);
    expect(ctx.upstream).toHaveBeenCalledTimes(1);
    expect(ctx.upstream.mock.calls[0]?.[0]).toBe(original);
  });

  it("keeps auth headers out of the cache key and the stored response", async () => {
    ctx.upstream.mockImplementation(async (_input, init) => {
      const headers = new Headers(init?.headers);
      return new Response("ok", {
        status: 200,
        headers: { Authorization: headers.get("authorization") ?? "" },
      });
    });

    await ctx.call(APR, { headers: { Authorization: "Bearer secret-a" } });
    await ctx.flush();
    await ctx.call(APR, { headers: { Authorization: "Bearer secret-b" } });

    expect(ctx.upstream).toHaveBeenCalledTimes(1);
    const stored = [...ctx.cache.entries.values()][0];
    expect(stored?.headers.get("authorization")).toBeNull();
    expect([...ctx.cache.entries.keys()][0]).toBe(APR);
  });

  it("strips set-cookie from the stored response only", async () => {
    ctx.upstream.mockResolvedValue(
      new Response("ok", {
        status: 200,
        headers: { "set-cookie": "session=secret" },
      })
    );

    const miss = await ctx.call(POOLS);
    await ctx.flush();

    expect(miss.headers.get("set-cookie")).toBe("session=secret");
    const stored = [...ctx.cache.entries.values()][0];
    expect(stored?.headers.get("set-cookie")).toBeNull();
  });

  it("does not store a non-2xx response", async () => {
    ctx.upstream.mockImplementation(
      async () => new Response("nope", { status: 503 })
    );

    await ctx.call(POOLS);
    await ctx.flush();
    await ctx.call(POOLS);

    expect(ctx.cache.entries.size).toBe(0);
    expect(ctx.upstream).toHaveBeenCalledTimes(2);
  });

  it("uses the upstream freshness lifetime, capped by the rule", async () => {
    ctx.upstream.mockResolvedValue(
      new Response("apr", {
        status: 200,
        headers: { "cache-control": "public, max-age=12" },
      })
    );
    await ctx.call(APR);
    await ctx.flush();
    expect(
      [...ctx.cache.entries.values()][0]?.headers.get("cache-control")
    ).toBe("public, s-maxage=12");

    ctx.cache.entries.clear();
    ctx.upstream.mockResolvedValue(new Response("apr", { status: 200 }));
    await ctx.call(APR);
    await ctx.flush();
    expect(
      [...ctx.cache.entries.values()][0]?.headers.get("cache-control")
    ).toBe("public, s-maxage=1800");

    ctx.cache.entries.clear();
    ctx.upstream.mockResolvedValue(
      new Response("prices", {
        status: 200,
        headers: { "cache-control": "public, s-maxage=120" },
      })
    );
    await ctx.call(PRICES);
    await ctx.flush();
    expect(
      [...ctx.cache.entries.values()][0]?.headers.get("cache-control")
    ).toBe("public, s-maxage=10");
  });

  /** Holds every upstream response until `release` is called. */
  function gateUpstream() {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    ctx.upstream.mockImplementation(async () => {
      await gate;
      return new Response("pools", { status: 200 });
    });
    return release;
  }

  it("shares one upstream read across concurrent misses in one request", async () => {
    const release = gateUpstream();

    const calls = runWithUpstreamCache(
      () => undefined,
      () =>
        Promise.all([
          globalThis.fetch(POOLS),
          globalThis.fetch(POOLS),
          globalThis.fetch(POOLS),
          globalThis.fetch(POOLS),
        ])
    );
    release();
    const responses = await calls;

    expect(ctx.upstream).toHaveBeenCalledTimes(1);
    expect(
      await Promise.all(responses.map((response) => response.text()))
    ).toEqual(["pools", "pools", "pools", "pools"]);
  });

  it("rejects an aborted caller and still finishes the shared read", async () => {
    let entered: () => void = () => undefined;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    ctx.upstream.mockImplementation(async () => {
      entered();
      await gate;
      return new Response("pools", { status: 200 });
    });

    const controller = new AbortController();
    const done = runWithUpstreamCache(
      () => undefined,
      async () => {
        const aborted = globalThis.fetch(POOLS, { signal: controller.signal });
        const kept = globalThis.fetch(POOLS);
        await started;
        controller.abort();
        await expect(aborted).rejects.toMatchObject({ name: "AbortError" });
        release();
        return kept.then((response) => response.text());
      }
    );

    await expect(done).resolves.toBe("pools");
    expect(ctx.upstream).toHaveBeenCalledTimes(1);
    expect(ctx.upstream.mock.calls[0]?.[1]).toEqual(
      expect.not.objectContaining({ signal: expect.anything() })
    );
  });

  it("does not start an upstream read when the caller is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      runWithUpstreamCache(
        () => undefined,
        () => globalThis.fetch(POOLS, { signal: controller.signal })
      )
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(ctx.upstream).not.toHaveBeenCalled();
  });

  it("never makes one request wait on another request's upstream read", async () => {
    const release = gateUpstream();

    const calls = Promise.all([ctx.call(POOLS), ctx.call(POOLS)]);
    release();
    const responses = await calls;

    expect(ctx.upstream).toHaveBeenCalledTimes(2);
    expect(
      await Promise.all(responses.map((response) => response.text()))
    ).toEqual(["pools", "pools"]);
  });

  it("falls through to the network when the Cache API throws", async () => {
    ctx.cache.matchError = new Error("match failed");
    ctx.cache.putError = new Error("put failed");

    const response = await ctx.call(POOLS);
    await ctx.flush();

    expect(await response.text()).toBe("pools");
    expect(ctx.upstream).toHaveBeenCalledTimes(1);
    expect(ctx.cache.entries.size).toBe(0);
  });

  it("keeps Server-Timing counts on the request that made the calls", async () => {
    let releaseMiss: () => void = () => undefined;
    const missGate = new Promise<void>((resolve) => {
      releaseMiss = resolve;
    });
    ctx.upstream.mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === POOLS) await missGate;
      return new Response("ok", { status: 200 });
    });

    const miss = runWithUpstreamCache(
      (promise) => {
        ctx.pending.push(promise);
      },
      async () => {
        await globalThis.fetch(POOLS);
        return applyUpstreamServerTiming(new Response("miss"));
      }
    );
    const bypass = runWithUpstreamCache(
      (promise) => {
        ctx.pending.push(promise);
      },
      async () => {
        await globalThis.fetch("https://example.test/private");
        await globalThis.fetch(POOLS, { method: "POST", body: "{}" });
        return applyUpstreamServerTiming(new Response("bypass"));
      }
    );

    releaseMiss();
    const [missResponse, bypassResponse] = await Promise.all([miss, bypass]);

    expect(missResponse.headers.get("server-timing")).toBe(
      'upstream;desc="hit=0 miss=1 bypass=0"'
    );
    expect(bypassResponse.headers.get("server-timing")).toBe(
      'upstream;desc="hit=0 miss=0 bypass=2"'
    );
  });

  it("uses a shorter TTL for realtime token charts", async () => {
    const realtime =
      "https://data.app.osmosis.zone/tokens/v2/historical/uosmo/chart?realtime=true";
    const daily =
      "https://data.app.osmosis.zone/tokens/v2/historical/uosmo/chart?realtime=false";
    ctx.upstream.mockImplementation(
      async () => new Response("[]", { status: 200 })
    );

    await ctx.call(realtime);
    await ctx.call(daily);
    await ctx.flush();

    expect(ctx.cache.entries.get(realtime)?.headers.get("cache-control")).toBe(
      "public, s-maxage=3"
    );
    expect(ctx.cache.entries.get(daily)?.headers.get("cache-control")).toBe(
      "public, s-maxage=30"
    );
  });
});
