/**
 * @jest-environment node
 */
import type { ApiHandler } from "../routes";

const ORIGIN = "https://app.test";
const POOLS = "https://sqs.osmosis.zone/pools";

/** An in-memory stand-in for the Workers Cache API, keyed by URL. */
class MemoryCache {
  readonly entries = new Map<string, Response>();

  async match(request: Request) {
    return this.entries.get(request.url)?.clone();
  }

  async put(request: Request, response: Response) {
    this.entries.set(request.url, response.clone());
  }
}

type WorkerModule = {
  default: {
    fetch(
      request: Request,
      env: unknown,
      ctx: { waitUntil(promise: Promise<unknown>): void }
    ): Promise<Response>;
  };
};

describe("API Worker entry", () => {
  const cache = new MemoryCache();
  const upstream = jest.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response("[]", { status: 200 })
  );
  const poolsHandler = jest.fn<ReturnType<ApiHandler>, Parameters<ApiHandler>>(
    async () => {
      await (await globalThis.fetch(POOLS)).text();
      return new Response("pools", {
        headers: { "cache-control": "public, s-maxage=60" },
      });
    }
  );
  const previousFetch = globalThis.fetch;
  const holder = globalThis as { caches?: unknown };
  const previousCaches = holder.caches;
  let worker: WorkerModule["default"];
  let restoreUpstreamCache: () => void;

  beforeAll(() => {
    globalThis.fetch = upstream as unknown as typeof fetch;
    holder.caches = { default: cache };
    jest.doMock("../handlers", () => ({
      apiHandlers: { pools: poolsHandler },
    }));
    worker = (require("../worker") as WorkerModule).default;
    restoreUpstreamCache = (
      require("../upstream-cache") as { restoreUpstreamCache: () => void }
    ).restoreUpstreamCache;
  });

  afterAll(() => {
    restoreUpstreamCache();
    globalThis.fetch = previousFetch;
    holder.caches = previousCaches;
    jest.dontMock("../handlers");
  });

  async function request(pathname: string): Promise<Response> {
    const pending: Promise<unknown>[] = [];
    const response = await worker.fetch(
      new Request(`${ORIGIN}${pathname}`),
      {},
      {
        waitUntil: (promise) => {
          pending.push(promise);
        },
      }
    );
    await Promise.all(pending);
    return response;
  }

  it("reports upstream work on an edge miss and none on the edge hit that follows", async () => {
    const miss = await request("/api/pools");
    expect(miss.headers.get("x-edge-cache")).toBe("MISS");
    expect(miss.headers.get("server-timing")).toBe(
      'upstream;desc="hit=0 miss=1 bypass=0"'
    );

    const hit = await request("/api/pools");
    expect(hit.headers.get("x-edge-cache")).toBe("HIT");
    expect(hit.headers.get("server-timing")).toBe(
      'upstream;desc="hit=0 miss=0 bypass=0"'
    );
    expect(await hit.text()).toBe("pools");
    expect(poolsHandler).toHaveBeenCalledTimes(1);
    expect(upstream).toHaveBeenCalledTimes(1);
  });

  it("appends zero upstream counters to a 404", async () => {
    const response = await request("/api/not-a-route");
    expect(response.status).toBe(404);
    expect(response.headers.get("server-timing")).toBe(
      'upstream;desc="hit=0 miss=0 bypass=0"'
    );
  });
});
