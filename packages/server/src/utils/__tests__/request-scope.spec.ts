import { AsyncLocalStorage } from "node:async_hooks";

import type { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { cachified } from "../cache";
import {
  getRequestScope,
  getRequestScoped,
  type RequestScope,
  setRequestScopeProvider,
} from "../request-scope";

const scopes = new AsyncLocalStorage<RequestScope>();

function inRequest<T>(fn: () => T, waitUntil = jest.fn()): T {
  return scopes.run({ waitUntil }, fn);
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe("request scope", () => {
  beforeAll(() => setRequestScopeProvider(() => scopes.getStore()));
  afterAll(() => setRequestScopeProvider(() => undefined));

  it("has no scope outside a request", () => {
    expect(getRequestScope()).toBeUndefined();
    expect(getRequestScoped({}, () => 1)).toBeUndefined();
  });

  it("creates a scoped value once per request", () => {
    const slot = {};
    let created = 0;
    const create = () => ({ n: ++created });

    const [a1, a2] = inRequest(() => [
      getRequestScoped(slot, create),
      getRequestScoped(slot, create),
    ]);
    const b = inRequest(() => getRequestScoped(slot, create));

    expect(a1).toBe(a2);
    expect(b).not.toBe(a1);
    expect(created).toBe(2);
  });
});

describe("cachified in a request scope", () => {
  beforeAll(() => setRequestScopeProvider(() => scopes.getStore()));
  afterAll(() => setRequestScopeProvider(() => undefined));

  it("does not hand one request's pending value to another", async () => {
    const cache = new LRUCache<string, CacheEntry>({ max: 10 });
    const first = deferred<string>();
    const getFirst = jest.fn(() => first.promise);
    const getSecond = jest.fn(async () => "second");

    // Request A starts a fetch and never finishes it (its request ended).
    void inRequest(() =>
      cachified({ key: "k", cache, ttl: 1000, getFreshValue: getFirst })
    );
    // Request B must fetch on its own rather than wait on A's promise.
    const b = await inRequest(() =>
      cachified({ key: "k", cache, ttl: 1000, getFreshValue: getSecond })
    );

    expect(b).toBe("second");
    expect(getSecond).toHaveBeenCalledTimes(1);
  });

  it("still dedupes pending values within one request", async () => {
    const cache = new LRUCache<string, CacheEntry>({ max: 10 });
    const getFreshValue = jest.fn(async () => "v");

    const values = await inRequest(() =>
      Promise.all([
        cachified({ key: "k", cache, ttl: 1000, getFreshValue }),
        cachified({ key: "k", cache, ttl: 1000, getFreshValue }),
      ])
    );

    expect(values).toEqual(["v", "v"]);
    expect(getFreshValue).toHaveBeenCalledTimes(1);
  });

  it("shares cached values across requests", async () => {
    const cache = new LRUCache<string, CacheEntry>({ max: 10 });
    const getFreshValue = jest.fn(async () => "v");

    await inRequest(() =>
      cachified({ key: "k", cache, ttl: 1000, getFreshValue })
    );
    const again = await inRequest(() =>
      cachified({ key: "k", cache, ttl: 1000, getFreshValue })
    );

    expect(again).toBe("v");
    expect(getFreshValue).toHaveBeenCalledTimes(1);
  });

  it("does not hold the request open for a value it awaits itself", async () => {
    const cache = new LRUCache<string, CacheEntry>({ max: 10 });
    const waitUntil = jest.fn();

    await inRequest(
      () =>
        cachified({
          key: "k",
          cache,
          ttl: 1000,
          getFreshValue: async () => "v",
        }),
      waitUntil
    );

    expect(waitUntil).not.toHaveBeenCalled();
  });

  it("serves a stale value and refreshes it, kept alive through the cache write", async () => {
    const cache = new LRUCache<string, CacheEntry>({ max: 10 });
    const options = {
      key: "k",
      cache,
      ttl: 10,
      staleWhileRevalidate: 60_000,
    };
    await inRequest(() =>
      cachified({ ...options, getFreshValue: async () => "old" })
    );
    await new Promise((r) => setTimeout(r, 20));

    const kept: Promise<unknown>[] = [];
    const stale = await inRequest(
      () => cachified({ ...options, getFreshValue: async () => "new" }),
      jest.fn((p: Promise<unknown>) => kept.push(p))
    );

    // Served stale, and the refresh was handed over before the response, not on a timer.
    expect(stale).toBe("old");
    expect(kept).toHaveLength(1);
    await kept[0];
    expect(cache.get("k")?.value).toBe("new");
  });

  it("does not let an older write replace a newer entry", async () => {
    const cache = new LRUCache<string, CacheEntry>({ max: 10 });
    const slow = deferred<string>();

    // A starts first; B starts later, finishes first and caches its newer value.
    const a = inRequest(() =>
      cachified({
        key: "k",
        cache,
        ttl: 60_000,
        getFreshValue: () => slow.promise,
      })
    );
    await new Promise((r) => setTimeout(r, 5));
    await inRequest(() =>
      cachified({
        key: "k",
        cache,
        ttl: 60_000,
        getFreshValue: async () => "new",
      })
    );
    slow.resolve("old");
    await a;

    expect(cache.get("k")?.value).toBe("new");
  });

  it("recovers from an entry it can't read, like plain cachified", async () => {
    const cache = new LRUCache<string, CacheEntry>({ max: 10 });
    cache.set("k", { value: "broken" } as unknown as CacheEntry);

    const value = await inRequest(() =>
      cachified({
        key: "k",
        cache,
        ttl: 1000,
        staleWhileRevalidate: 60_000,
        getFreshValue: async () => "v",
      })
    );

    expect(value).toBe("v");
  });

  it("is plain cachified outside a request", async () => {
    const cache = new LRUCache<string, CacheEntry>({ max: 10 });
    const pending = deferred<string>();
    const getFreshValue = jest.fn(() => pending.promise);

    const a = cachified({ key: "k", cache, ttl: 1000, getFreshValue });
    const b = cachified({ key: "k", cache, ttl: 1000, getFreshValue });
    pending.resolve("v");

    expect(await Promise.all([a, b])).toEqual(["v", "v"]);
    expect(getFreshValue).toHaveBeenCalledTimes(1);
  });
});
