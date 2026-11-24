/**
 * @jest-environment node
 */
import { MAX_JSON_BODY_BYTES } from "~/server/api-handlers/request-body";
import {
  edgeTrpcAssetsHandler,
  edgeTrpcMainHandler,
  edgeTrpcPoolsHandler,
  trpcHandler,
} from "~/server/api-handlers/trpc";

describe.each([
  ["/api/trpc", trpcHandler],
  ["/api/edge-trpc-main", edgeTrpcMainHandler],
  ["/api/edge-trpc-pools", edgeTrpcPoolsHandler],
  ["/api/edge-trpc-assets", edgeTrpcAssetsHandler],
] as const)("%s body limit", (endpoint, handler) => {
  it("refuses a POST body over the size limit with a 413", async () => {
    const response = await handler(
      new Request(`https://app.test${endpoint}/some.procedure`, {
        method: "POST",
        body: "x".repeat(MAX_JSON_BODY_BYTES + 1),
      })
    );

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "Request too large" });
  });
});

describe("trpcHandler", () => {
  it("hands a body within the limit to tRPC", async () => {
    const response = await trpcHandler(
      new Request("https://app.test/api/trpc/no.such.procedure", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      })
    );

    // tRPC itself answers: the procedure does not exist.
    expect(response.status).toBe(404);
  });

  it.each([
    "edge.assets.getUserAsset",
    "local.bridgeTransfer.getSupportedAssetsBalances",
  ])(
    "serves only the bridgeTransfer router (%s is not found)",
    async (path) => {
      const response = await trpcHandler(
        new Request(`https://app.test/api/trpc/${path}`)
      );

      expect(response.status).toBe(404);
    }
  );
});
