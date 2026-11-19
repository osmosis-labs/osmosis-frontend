import { AsyncLocalStorage } from "node:async_hooks";

import { LRUCache } from "lru-cache";

import { cached, type CacheEntry, getFreshness } from "../cached";
import { type RequestScope, setRequestScopeProvider } from "../request-scope";

const scopes = new AsyncLocalStorage<RequestScope>();

function inRequest<T>(fn: () => T, waitUntil = jest.fn()): T {
  return scopes.run({ waitUntil }, fn);
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const newCache = () => new LRUCache<string, CacheEntry>({ max: 10 });
const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("getFreshness", () => {
  const metadata = { createdTime: 1000, ttl: 100, swr: 50 };

  it("matches cachified's inclusive boundaries", () => {
    expect(getFreshness(metadata, 1100)).toBe("fresh");
    expect(getFreshness(metadata, 1101)).toBe("stale");
    expect(getFreshness(metadata, 1150)).toBe("stale");
    expect(getFreshness(metadata, 1151)).toBe("expired");
  });

  it("treats a null ttl as forever", () => {
    expect(getFreshness({ ...metadata, ttl: null }, Infinity)).toBe("fresh");
  });
});

describe("cached outside a request (Node, browser)", () => {
  it("returns a fresh cached value without fetching", async () => {
    const cache = newCache();
    const getFreshValue = jest.fn(async () => "v");

    await cached({ key: "k", cache, ttl: 1000, getFreshValue });
    await cached({ key: "k", cache, ttl: 1000, getFreshValue });

    expect(getFreshValue).toHaveBeenCalledTimes(1);
  });

  it("shares a pending fetch between callers", async () => {
    const cache = newCache();
    const pending = deferred<string>();
    const getFreshValue = jest.fn(() => pending.promise);

    const a = cached({ key: "k", cache, ttl: 1000, getFreshValue });
    const b = cached({ key: "k", cache, ttl: 1000, getFreshValue });
    pending.resolve("v");

    expect(await Promise.all([a, b])).toEqual(["v", "v"]);
    expect(getFreshValue).toHaveBeenCalledTimes(1);
  });

  it("never caches with a negative ttl", async () => {
    const cache = newCache();

    await cached({ key: "k", cache, ttl: -1, getFreshValue: async () => "v" });

    expect(cache.has("k")).toBe(false);
  });

  it("caches forever without a ttl", async () => {
    const cache = newCache();

    await cached({ key: "k", cache, getFreshValue: async () => "v" });

    expect(cache.get("k")?.metadata.ttl).toBeNull();
  });

  it("lets getFreshValue shorten the ttl it is cached with", async () => {
    const cache = newCache();

    await cached({
      key: "k",
      cache,
      ttl: 60_000,
      getFreshValue: async ({ metadata }) => {
        metadata.ttl = 5;
        return "degraded";
      },
    });

    expect(cache.get("k")?.metadata.ttl).toBe(5);
  });

  it("serves stale and refreshes in the background", async () => {
    const cache = newCache();
    const options = { key: "k", cache, ttl: 10, staleWhileRevalidate: 60_000 };
    await cached({ ...options, getFreshValue: async () => "old" });
    await tick(20);

    const backgrounds: boolean[] = [];
    const value = await cached({
      ...options,
      getFreshValue: async ({ background }) => {
        backgrounds.push(background);
        return "new";
      },
    });
    await tick(0);

    expect(value).toBe("old");
    expect(backgrounds).toEqual([true]);
    expect(cache.get("k")?.value).toBe("new");
  });

  it("keeps the stale value when its refresh fails", async () => {
    const cache = newCache();
    const options = { key: "k", cache, ttl: 10, staleWhileRevalidate: 60_000 };
    await cached({ ...options, getFreshValue: async () => "old" });
    await tick(20);

    await cached({
      ...options,
      getFreshValue: async () => {
        throw new Error("down");
      },
    });
    await tick(0);

    expect(cache.get("k")?.value).toBe("old");
  });

  it("fetches when past the stale window", async () => {
    const cache = newCache();
    const options = { key: "k", cache, ttl: 5, staleWhileRevalidate: 5 };
    await cached({ ...options, getFreshValue: async () => "old" });
    await tick(20);

    expect(await cached({ ...options, getFreshValue: async () => "new" })).toBe(
      "new"
    );
  });

  it("drops a cached value that fails checkValue and fetches again", async () => {
    const cache = newCache();
    cache.set("k", {
      value: [],
      metadata: { createdTime: Date.now(), ttl: null, swr: 0 },
    });

    const value = await cached({
      key: "k",
      cache,
      getFreshValue: async () => ["a"],
      checkValue: (v) => (v as string[]).length > 0 || "empty",
    });

    expect(value).toEqual(["a"]);
  });

  it("fails on a fresh value that fails checkValue, without caching it", async () => {
    const cache = newCache();

    await expect(
      cached({
        key: "k",
        cache,
        ttl: 1000,
        getFreshValue: async () => [],
        checkValue: (v) => (v as string[]).length > 0 || "empty",
      })
    ).rejects.toThrow("check failed for fresh value of k");
    expect(cache.has("k")).toBe(false);
  });

  it("forceFresh fetches, and falls back to the cached value when that fails", async () => {
    const cache = newCache();
    await cached({
      key: "k",
      cache,
      ttl: 60_000,
      getFreshValue: async () => "a",
    });

    expect(
      await cached({
        key: "k",
        cache,
        ttl: 60_000,
        forceFresh: true,
        getFreshValue: async () => "b",
      })
    ).toBe("b");
    expect(
      await cached({
        key: "k",
        cache,
        ttl: 60_000,
        forceFresh: true,
        getFreshValue: async () => {
          throw new Error("down");
        },
      })
    ).toBe("b");
  });

  it("re-caches a forceFresh fallback with the forced call's ttl", async () => {
    // The orderbook pools path: an hour-long list must not survive a failed forced
    // read for another hour; it is retried after the forced read's 15s.
    const cache = newCache();
    await cached({
      key: "k",
      cache,
      ttl: 3_600_000,
      getFreshValue: async () => "old",
    });

    await cached({
      key: "k",
      cache,
      ttl: 15_000,
      forceFresh: true,
      getFreshValue: async () => {
        throw new Error("down");
      },
    });

    expect(cache.get("k")?.metadata.ttl).toBe(15_000);
  });

  it("forceFresh falls back to a value cached while it was fetching", async () => {
    const cache = newCache();
    const failing = deferred<string>();

    const forced = cached({
      key: "k",
      cache,
      ttl: 15_000,
      forceFresh: true,
      getFreshValue: () => failing.promise,
    });
    cache.set("k", {
      value: "meanwhile",
      metadata: { createdTime: Date.now(), ttl: 60_000, swr: 0 },
    });
    failing.reject(new Error("down"));

    expect(await forced).toBe("meanwhile");
  });

  it("forceFresh still fails on a fresh value that fails checkValue", async () => {
    const cache = newCache();
    await cached({
      key: "k",
      cache,
      ttl: 60_000,
      getFreshValue: async () => ["a"],
    });

    await expect(
      cached({
        key: "k",
        cache,
        ttl: 60_000,
        forceFresh: true,
        getFreshValue: async () => [],
        checkValue: (v) => (v as string[]).length > 0 || "empty",
      })
    ).rejects.toThrow("check failed for fresh value of k");
  });

  it("a forced call does not join a pending regular fetch", async () => {
    const cache = newCache();
    const regular = deferred<string>();
    const forcedFetch = jest.fn(async () => "forced");

    const r = cached({
      key: "k",
      cache,
      ttl: 3_600_000,
      getFreshValue: () => regular.promise,
    });
    const f = await cached({
      key: "k",
      cache,
      ttl: 15_000,
      forceFresh: true,
      getFreshValue: forcedFetch,
    });
    regular.resolve("regular");
    await r;

    expect(f).toBe("forced");
    expect(forcedFetch).toHaveBeenCalledTimes(1);
  });

  it("starts a new fetch once a pending one is past its ttl, and settles both callers", async () => {
    const cache = newCache();
    const stuck = deferred<string>();
    const first = cached({
      key: "k",
      cache,
      ttl: 10,
      getFreshValue: () => stuck.promise,
    });
    await tick(20);

    const second = await cached({
      key: "k",
      cache,
      ttl: 10,
      getFreshValue: async () => "replacement",
    });

    expect(second).toBe("replacement");
    expect(await first).toBe("replacement");
  });

  it("recovers from an entry it can't read", async () => {
    const cache = newCache();
    cache.set("k", { value: "broken" } as unknown as CacheEntry);

    expect(
      await cached({
        key: "k",
        cache,
        ttl: 1000,
        getFreshValue: async () => "v",
      })
    ).toBe("v");
  });
});

describe("cached in a Worker request", () => {
  beforeAll(() => setRequestScopeProvider(() => scopes.getStore()));
  afterAll(() => setRequestScopeProvider(() => undefined));

  it("does not hand one request's pending fetch to another", async () => {
    const cache = newCache();
    const first = deferred<string>();
    const getSecond = jest.fn(async () => "second");

    // Request A starts a fetch and never finishes it (its request ended).
    void inRequest(() =>
      cached({ key: "k", cache, ttl: 1000, getFreshValue: () => first.promise })
    );
    const b = await inRequest(() =>
      cached({ key: "k", cache, ttl: 1000, getFreshValue: getSecond })
    );

    expect(b).toBe("second");
    expect(getSecond).toHaveBeenCalledTimes(1);
  });

  it("still shares a pending fetch within one request", async () => {
    const cache = newCache();
    const getFreshValue = jest.fn(async () => "v");

    const values = await inRequest(() =>
      Promise.all([
        cached({ key: "k", cache, ttl: 1000, getFreshValue }),
        cached({ key: "k", cache, ttl: 1000, getFreshValue }),
      ])
    );

    expect(values).toEqual(["v", "v"]);
    expect(getFreshValue).toHaveBeenCalledTimes(1);
  });

  it("shares cached values across requests", async () => {
    const cache = newCache();
    const getFreshValue = jest.fn(async () => "v");

    await inRequest(() =>
      cached({ key: "k", cache, ttl: 1000, getFreshValue })
    );
    await inRequest(() =>
      cached({ key: "k", cache, ttl: 1000, getFreshValue })
    );

    expect(getFreshValue).toHaveBeenCalledTimes(1);
  });

  it("does not hold the request open for a value it awaits itself", async () => {
    const waitUntil = jest.fn();

    await inRequest(
      () =>
        cached({
          key: "k",
          cache: newCache(),
          ttl: 1000,
          getFreshValue: async () => "v",
        }),
      waitUntil
    );

    expect(waitUntil).not.toHaveBeenCalled();
  });

  it("hands the whole stale refresh, cache write included, to waitUntil", async () => {
    const cache = newCache();
    const options = { key: "k", cache, ttl: 10, staleWhileRevalidate: 60_000 };
    await inRequest(() =>
      cached({ ...options, getFreshValue: async () => "old" })
    );
    await tick(20);

    const kept: Promise<unknown>[] = [];
    const stale = await inRequest(
      () => cached({ ...options, getFreshValue: async () => "new" }),
      jest.fn((p: Promise<unknown>) => kept.push(p))
    );

    expect(stale).toBe("old");
    expect(kept).toHaveLength(1);
    await kept[0];
    expect(cache.get("k")?.value).toBe("new");
  });

  it("does not let an older fetch overwrite a newer entry", async () => {
    const cache = newCache();
    const slow = deferred<string>();

    const a = inRequest(() =>
      cached({
        key: "k",
        cache,
        ttl: 60_000,
        getFreshValue: () => slow.promise,
      })
    );
    await tick(5);
    await inRequest(() =>
      cached({ key: "k", cache, ttl: 60_000, getFreshValue: async () => "new" })
    );
    slow.resolve("old");
    await a;

    expect(cache.get("k")?.value).toBe("new");
  });

  it("orders fetches started in the same millisecond", async () => {
    const now = jest.spyOn(Date, "now").mockReturnValue(1_000_000);
    try {
      const cache = newCache();
      const older = deferred<string>();
      const a = inRequest(() =>
        cached({
          key: "k",
          cache,
          ttl: 60_000,
          getFreshValue: () => older.promise,
        })
      );
      await inRequest(() =>
        cached({
          key: "k",
          cache,
          ttl: 60_000,
          getFreshValue: async () => "new",
        })
      );
      older.resolve("old");
      await a;

      expect(cache.get("k")?.value).toBe("new");
    } finally {
      now.mockRestore();
    }
  });
});
