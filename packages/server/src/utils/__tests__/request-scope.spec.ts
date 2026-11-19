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

  it("keeps the request alive until a fresh value settles", async () => {
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

    expect(waitUntil).toHaveBeenCalledTimes(1);
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
