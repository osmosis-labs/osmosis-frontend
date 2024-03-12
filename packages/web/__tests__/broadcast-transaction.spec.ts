// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import broadcastTransactionHandler from "~/pages/api/broadcast-transaction";
import { server } from "~/tests/msw";

// Mocking ChainList to control its behavior in tests
jest.mock("~/config/generated/chain-list", () => ({
  ChainList: [
    {
      apis: {
        rest: [{ address: "https://fake-endpoint.com" }],
      },
    },
  ],
}));

it("should return method not allowed if not a POST request", async () => {
  const req = { method: "GET" } as Request;
  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(405);
});

it("should return error for invalid rest endpoint", async () => {
  const req = {
    method: "POST",
    json: () =>
      Promise.resolve({ restEndpoint: "https://invalid-endpoint.com" }),
  } as unknown as Request;
  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(400);
});

it("should return error for invalid tx_bytes or mode", async () => {
  const req = {
    method: "POST",
    json: () =>
      Promise.resolve({
        restEndpoint: "https://fake-endpoint.com",
        tx_bytes: "",
        mode: "",
      }),
  } as unknown as Request;
  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(400);
});

it("should successfully broadcast transaction", async () => {
  const req = {
    method: "POST",
    json: () =>
      Promise.resolve({
        restEndpoint: "https://fake-endpoint.com",
        tx_bytes: "bytes",
        mode: "sync",
      }),
  } as unknown as Request;

  server.use(
    rest.post(
      "https://fake-endpoint.com/cosmos/tx/v1beta1/txs",
      (_req, res, ctx) => {
        return res(ctx.json({ data: "someData" }));
      }
    )
  );

  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({ data: "someData" });
});

it("should handle fetch errors gracefully", async () => {
  const req = {
    method: "POST",
    json: () =>
      Promise.resolve({
        restEndpoint: "https://fake-endpoint.com",
        tx_bytes: "bytes",
        mode: "sync",
      }),
  } as unknown as Request;

  server.use(
    rest.post(
      "https://fake-endpoint.com/cosmos/tx/v1beta1/txs",
      (_req, res, ctx) => {
        return res(ctx.status(500));
      }
    )
  );

  const result = await broadcastTransactionHandler(req);
  expect(result.status).toBe(500);
});
