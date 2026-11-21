/**
 * @jest-environment node
 */
import {
  type FetchHandlerRequestOptions,
  fetchRequestHandler,
} from "@trpc/server/adapters/fetch";

import { edgeLocalRouter } from "~/server/api/edge-local-router";
import { edgeRouter } from "~/server/api/edge-router";
import { nodeRouter } from "~/server/api/node-router";
import { createTrpcContext } from "~/server/api/trpc";
import {
  edgeTrpcAssetsHandler,
  edgeTrpcLocalHandler,
  edgeTrpcMainHandler,
  edgeTrpcPoolsHandler,
  trpcHandler,
} from "~/server/api-handlers/trpc";
import { onTrpcError } from "~/server/api-handlers/trpc-error-log";

jest.mock("@trpc/server/adapters/fetch", () => ({
  fetchRequestHandler: jest.fn(async () => new Response("trpc")),
}));

const adapter = jest.mocked(fetchRequestHandler);

const ORIGIN = "https://app.test";

/** The options the last handler call passed to tRPC's fetch adapter. */
function adapterOptions(): FetchHandlerRequestOptions<typeof edgeRouter> {
  const call = adapter.mock.calls.at(-1);
  if (!call) throw new Error("fetchRequestHandler was not called");
  return call[0] as FetchHandlerRequestOptions<typeof edgeRouter>;
}

beforeEach(() => {
  adapter.mockClear();
});

describe("tRPC endpoints", () => {
  it.each([
    ["trpc", trpcHandler, "/api/trpc", nodeRouter],
    ["edge main", edgeTrpcMainHandler, "/api/edge-trpc-main", edgeRouter],
    ["edge pools", edgeTrpcPoolsHandler, "/api/edge-trpc-pools", edgeRouter],
    ["edge assets", edgeTrpcAssetsHandler, "/api/edge-trpc-assets", edgeRouter],
    [
      "edge local",
      edgeTrpcLocalHandler,
      "/api/edge-trpc-local",
      edgeLocalRouter,
    ],
  ] as const)(
    "serves %s at its endpoint with the shared context and error log",
    async (_name, handler, endpoint, router) => {
      const request = new Request(`${ORIGIN}${endpoint}/some.procedure`);

      expect(await (await handler(request)).text()).toBe("trpc");

      const options = adapterOptions();
      expect(options.endpoint).toBe(endpoint);
      expect(options.router).toBe(router);
      expect(options.req).toBe(request);
      expect(options.createContext).toBe(createTrpcContext);
      expect(options.onError).toBe(onTrpcError);
      expect(options.responseMeta === undefined).toBe(
        handler !== edgeTrpcAssetsHandler && handler !== edgeTrpcLocalHandler
      );
    }
  );
});

describe("edgeTrpcAssetsHandler responseMeta", () => {
  async function metaFor(input: unknown) {
    const params = new URLSearchParams({
      input: JSON.stringify({ json: input }),
    });
    await edgeTrpcAssetsHandler(
      new Request(
        `${ORIGIN}/api/edge-trpc-assets/assets.getMarketAsset?${params}`
      )
    );
    const responseMeta = adapterOptions().responseMeta;
    if (!responseMeta) throw new Error("no responseMeta");
    return responseMeta({
      paths: ["assets.getMarketAsset"],
      type: "query",
      errors: [],
      data: [{ result: { data: { coinDenom: "OSMO" } } }],
      eagerGeneration: false,
    } as unknown as Parameters<typeof responseMeta>[0]);
  }

  it("sets Cache-Control and Vary together on a public cacheable query", async () => {
    expect(await metaFor({ findMinDenomOrSymbol: "OSMO" })).toEqual({
      headers: {
        "Cache-Control": "public, s-maxage=10",
        Vary: "trpc-batch-mode",
      },
    });
  });

  it("sets neither header when the input names a user", async () => {
    expect(
      await metaFor({
        findMinDenomOrSymbol: "OSMO",
        userOsmoAddress: "osmo1abc",
      })
    ).toEqual({});
  });
});
