/**
 * @jest-environment node
 */
import fs from "node:fs";
import path from "node:path";

import { handleApiRequest } from "../dispatch";
import {
  API_HANDLER_IDS,
  API_ROUTES,
  type ApiHandler,
  type ApiHandlerId,
  matchApiRoute,
} from "../routes";

const ORIGIN = "https://app.test";

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

function stubHandlers(): Record<
  ApiHandlerId,
  jest.Mock<ReturnType<ApiHandler>, Parameters<ApiHandler>>
> {
  const handlers = {} as Record<
    ApiHandlerId,
    jest.Mock<ReturnType<ApiHandler>, Parameters<ApiHandler>>
  >;
  for (const id of API_HANDLER_IDS) {
    handlers[id] = jest.fn(
      async (_request: Request) => new Response(id, { status: 200 })
    );
  }
  return handlers;
}

function dispatch(url: string, init?: RequestInit, handlers = stubHandlers()) {
  const cache = new MemoryCache();
  const pending: Promise<unknown>[] = [];
  const response = handleApiRequest(
    new Request(url, init),
    (promise) => {
      pending.push(promise);
    },
    cache as unknown as Cache,
    handlers
  );
  return {
    handlers,
    cache,
    done: response.then(async (res) => {
      await Promise.all(pending);
      return res;
    }),
  };
}

/** Every `pages/api` file, relative to that directory. */
function listApiPageFiles(dir: string, prefix = ""): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...listApiPageFiles(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(rel);
    }
  }
  return files;
}

describe("matchApiRoute", () => {
  it.each([
    ["/api/trpc/pools.list", "trpc"],
    ["/api/trpc", "trpc"],
    ["/api/edge-trpc-main/edge.assets.get", "edgeTrpcMain"],
    ["/api/edge-trpc-pools/edge.pools.foo", "edgeTrpcPools"],
    ["/api/edge-trpc-assets/edge.assets.getUserAsset", "edgeTrpcAssets"],
    ["/api/pools", "pools"],
    ["/api/active-gauges", "activeGauges"],
    ["/api/broadcast-transaction", "broadcastTransaction"],
    ["/api/estimate-gas-fee", "estimateGasFee"],
    ["/api/evm-rpc", "evmRpc"],
    ["/api/simulate-position-migration", "simulatePositionMigration"],
    ["/api/solana-rpc", "solanaRpc"],
    ["/api/swapped-signature", "swappedSignature"],
    ["/api/skip-track-tx", "skipTrackTx"],
    ["/api/skip-tx-status", "skipTxStatus"],
  ] as const)("routes %s to %s", (pathname, handlerId) => {
    expect(matchApiRoute(pathname)?.handlerId).toBe(handlerId);
  });

  it("parses a single pool id and leaves the list route exact", () => {
    expect(matchApiRoute("/api/pools/1")).toEqual({
      handlerId: "pool",
      params: { id: "1" },
    });
    expect(matchApiRoute("/api/pools/42")?.params.id).toBe("42");
    expect(matchApiRoute("/api/pools")).toEqual({
      handlerId: "pools",
      params: {},
    });
    expect(matchApiRoute("/api/pools/1/ticks")).toBeUndefined();
    expect(matchApiRoute("/api/pools/")).toBeUndefined();
  });

  it("does not treat a prefix as a prefix of a longer sibling", () => {
    expect(matchApiRoute("/api/trpc-other")).toBeUndefined();
    expect(matchApiRoute("/api/edge-trpc-mainextra")).toBeUndefined();
  });

  it("returns undefined for an unknown path", () => {
    expect(matchApiRoute("/api/missing")).toBeUndefined();
    expect(matchApiRoute("/pools")).toBeUndefined();
  });
});

describe("pages/api drift", () => {
  it("has a route-table entry for every pages/api file, and no extra entries", () => {
    const root = path.resolve(__dirname, "../../pages/api");
    const onDisk = listApiPageFiles(root).sort();
    const inTable = API_ROUTES.map((route) => route.page).sort();

    expect(inTable).toEqual(onDisk);
    expect(new Set(API_ROUTES.map((route) => route.handlerId)).size).toBe(
      API_HANDLER_IDS.length
    );
    expect(API_ROUTES.map((route) => route.handlerId).sort()).toEqual(
      [...API_HANDLER_IDS].sort()
    );
  });
});

describe("handleApiRequest", () => {
  it("calls the handler the route table names", async () => {
    const cases: [string, ApiHandlerId][] = [
      ["/api/trpc/pools.list", "trpc"],
      ["/api/edge-trpc-main/edge.x", "edgeTrpcMain"],
      ["/api/edge-trpc-pools/edge.x", "edgeTrpcPools"],
      ["/api/edge-trpc-assets/edge.x", "edgeTrpcAssets"],
      ["/api/pools", "pools"],
      ["/api/pools/7", "pool"],
      ["/api/active-gauges", "activeGauges"],
      ["/api/broadcast-transaction", "broadcastTransaction"],
      ["/api/estimate-gas-fee", "estimateGasFee"],
      ["/api/evm-rpc", "evmRpc"],
      ["/api/simulate-position-migration", "simulatePositionMigration"],
      ["/api/solana-rpc", "solanaRpc"],
      ["/api/swapped-signature", "swappedSignature"],
      ["/api/skip-track-tx", "skipTrackTx"],
      ["/api/skip-tx-status", "skipTxStatus"],
    ];

    for (const [pathname, handlerId] of cases) {
      const { handlers, done } = dispatch(`${ORIGIN}${pathname}`, {
        method: pathname.includes("broadcast") ? "POST" : "GET",
        body: pathname.includes("broadcast") ? "{}" : undefined,
      });
      const response = await done;
      expect(response.status).toBe(200);
      expect(await response.text()).toBe(handlerId);
      expect(handlers[handlerId]).toHaveBeenCalledTimes(1);
    }
  });

  it("answers an unknown path with JSON 404 and calls no handler", async () => {
    const { handlers, done } = dispatch(`${ORIGIN}/api/not-a-route`);

    const response = await done;
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual({ error: "Not found" });
    for (const handler of Object.values(handlers)) {
      expect(handler).not.toHaveBeenCalled();
    }
  });

  it("returns 403 for a blocked user agent and does not call the handler or the cache", async () => {
    const { handlers, cache, done } = dispatch(`${ORIGIN}/api/pools`, {
      headers: { "user-agent": "python-requests/2.31" },
    });

    const response = await done;
    expect(response.status).toBe(403);
    expect(await response.text()).toBe("Forbidden");
    expect(handlers.pools).not.toHaveBeenCalled();
    expect(cache.entries.size).toBe(0);
  });

  it("does not serve a cached API response to a blocked user agent", async () => {
    const handlers = stubHandlers();
    handlers.pools.mockResolvedValue(
      new Response("pools", {
        headers: { "cache-control": "public, s-maxage=60" },
      })
    );
    const cache = new MemoryCache();
    const pending: Promise<unknown>[] = [];
    const run = (userAgent?: string) =>
      handleApiRequest(
        new Request(`${ORIGIN}/api/pools`, {
          headers: userAgent ? { "user-agent": userAgent } : {},
        }),
        (promise) => {
          pending.push(promise);
        },
        cache as unknown as Cache,
        handlers
      );

    await run();
    await Promise.all(pending);
    const blocked = await run("python-requests/2.31");

    expect(blocked.status).toBe(403);
    expect(await blocked.text()).toBe("Forbidden");
    expect(handlers.pools).toHaveBeenCalledTimes(1);
  });

  it("passes the method through to the handler", async () => {
    const { handlers, done } = dispatch(`${ORIGIN}/api/pools`, {
      method: "POST",
      body: "{}",
    });

    expect((await done).status).toBe(200);
    expect(handlers.pools.mock.calls[0][0].method).toBe("POST");
  });

  it("returns JSON 500 without the thrown message when a handler throws", async () => {
    const handlers = stubHandlers();
    handlers.pools.mockRejectedValue(new Error("secret stack detail"));
    const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});

    const { done } = dispatch(`${ORIGIN}/api/pools`, undefined, handlers);
    const response = await done;

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal Server Error" });
    expect(errorLog).toHaveBeenCalledWith(
      "API handler threw",
      "pools",
      expect.any(Error)
    );
    errorLog.mockRestore();
  });

  it("caches a shared GET and skips the handler on the second request", async () => {
    const handlers = stubHandlers();
    handlers.activeGauges.mockResolvedValue(
      new Response("gauges", {
        headers: { "cache-control": "public, s-maxage=900" },
      })
    );
    const cache = new MemoryCache();
    const pending: Promise<unknown>[] = [];
    const run = () =>
      handleApiRequest(
        new Request(`${ORIGIN}/api/active-gauges`),
        (promise) => {
          pending.push(promise);
        },
        cache as unknown as Cache,
        handlers
      );

    const miss = await run();
    await Promise.all(pending);
    const hit = await run();

    expect(miss.headers.get("x-edge-cache")).toBe("MISS");
    expect(hit.headers.get("x-edge-cache")).toBe("HIT");
    expect(handlers.activeGauges).toHaveBeenCalledTimes(1);
  });
});
