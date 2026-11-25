import { http, HttpResponse } from "msw";

import { server } from "~/__tests__/msw";
import { broadcastTransactionHandler } from "~/server/api-handlers/broadcast-transaction";

// Mocking ChainList to control its behavior in tests
jest.mock("~/config/generated/chain-list", () => ({
  ChainList: [
    {
      apis: {
        rest: [
          { address: "https://fake-endpoint.com" },
          { address: "https://lcd.osmosis.zone" },
          { address: "https://rest.cosmos.directory/osmosis" },
        ],
      },
    },
  ],
}));

const validTxBody = {
  tx_bytes: "bytes",
  mode: "sync",
};

function makeBroadcastRequest(body: unknown) {
  return new Request("https://app.test/api/broadcast-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function expectInvalidRestEndpoint(restEndpoint: string) {
  const req = makeBroadcastRequest({ restEndpoint, ...validTxBody });

  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(400);
  expect(await result.json()).toEqual({ error: "Invalid rest endpoint" });
}

it("should return method not allowed if not a POST request", async () => {
  const req = new Request("https://app.test/api/broadcast-transaction", {
    method: "GET",
  });
  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(405);
});

it("should return error for invalid rest endpoint", async () => {
  const req = makeBroadcastRequest({
    restEndpoint: "https://invalid-endpoint.com",
  });
  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(400);
});

it("should return error for invalid tx_bytes or mode", async () => {
  const req = makeBroadcastRequest({
    restEndpoint: "https://fake-endpoint.com",
    tx_bytes: "",
    mode: "",
  });
  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(400);
});

it("should reject unsupported broadcast modes", async () => {
  const req = makeBroadcastRequest({
    restEndpoint: "https://fake-endpoint.com",
    tx_bytes: "bytes",
    mode: "invalid-mode",
  });
  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(400);
});

it("should reject oversized request bodies with 413", async () => {
  const req = makeBroadcastRequest("x".repeat(1024 * 1024 + 1));
  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(413);
});

it("should successfully broadcast transaction", async () => {
  const req = makeBroadcastRequest({
    restEndpoint: "https://fake-endpoint.com",
    tx_bytes: "bytes",
    mode: "sync",
  });

  server.use(
    http.post("https://fake-endpoint.com/cosmos/tx/v1beta1/txs", () => {
      return HttpResponse.json({ data: "someData" });
    })
  );

  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({ data: "someData" });
});

describe("SSRF bypass prevention", () => {
  it("rejects an empty rest endpoint", async () => {
    await expectInvalidRestEndpoint("");
  });

  it("rejects a bare https prefix", async () => {
    await expectInvalidRestEndpoint("https://");
  });

  it("rejects allowlisted URL prefixes", async () => {
    await expectInvalidRestEndpoint("https://l");
  });

  it("rejects subdomain suffix bypasses", async () => {
    await expectInvalidRestEndpoint("https://fake-endpoint.com.evil.com");
  });
});

it("should broadcast via path-prefixed REST endpoints", async () => {
  const req = makeBroadcastRequest({
    restEndpoint: "https://rest.cosmos.directory/osmosis",
    tx_bytes: "bytes",
    mode: "sync",
  });

  server.use(
    http.post(
      "https://rest.cosmos.directory/osmosis/cosmos/tx/v1beta1/txs",
      () => {
        return HttpResponse.json({ data: "pathPrefixedData" });
      }
    )
  );

  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({ data: "pathPrefixedData" });
});

it("should handle fetch errors gracefully", async () => {
  const req = makeBroadcastRequest({
    restEndpoint: "https://fake-endpoint.com",
    tx_bytes: "bytes",
    mode: "sync",
  });

  server.use(
    http.post("https://fake-endpoint.com/cosmos/tx/v1beta1/txs", () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(500);
});
