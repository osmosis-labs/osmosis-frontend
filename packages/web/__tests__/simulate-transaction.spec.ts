// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { ChainList } from "~/config/generated/chain-list";
import simulateTransactionHandler from "~/pages/api/simulate-transaction";
import { server } from "~/tests/msw";

it("returns 405 for non-POST requests", async () => {
  const mockReq = { method: "GET" } as Request;
  const response = await simulateTransactionHandler(mockReq);
  expect(response.status).toBe(405);
  const responseBody = await response.json();
  expect(responseBody.error).toBe("Method not allowed");
});

it("returns 400 for invalid rest endpoint", async () => {
  const mockReq = {
    method: "POST",
    json: async () => ({
      restEndpoint: "invalidEndpoint",
      tx_bytes: "someBytes",
    }),
  } as unknown as Request;
  const response = await simulateTransactionHandler(mockReq);
  expect(response.status).toBe(400);
  const responseBody = await response.json();
  expect(responseBody.error).toBe("Invalid rest endpoint");
});

it("returns 400 for invalid tx_bytes", async () => {
  const mockReq = {
    method: "POST",
    json: async () => ({ restEndpoint: ChainList[0].apis.rest[0].address }),
  } as unknown as Request;
  const response = await simulateTransactionHandler(mockReq);
  expect(response.status).toBe(400);
  const responseBody = await response.json();
  expect(responseBody.error).toBe("Invalid tx_bytes");
});

it("successfully simulates a transaction", async () => {
  const mockReq = {
    method: "POST",
    json: async () => ({
      restEndpoint: ChainList[0].apis.rest[0].address,
      tx_bytes: "validBytes",
    }),
  } as unknown as Request;

  const mockResponse = { data: "someData" };
  server.use(
    rest.post(
      `${ChainList[0].apis.rest[0].address}/cosmos/tx/v1beta1/simulate`,
      (_req, res, ctx) => {
        return res(ctx.json(mockResponse));
      }
    )
  );

  const response = await simulateTransactionHandler(mockReq);
  expect(response.status).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toEqual(mockResponse);
});

it("handles errors correctly", async () => {
  const mockReq = {
    method: "POST",
    json: async () => ({
      restEndpoint: ChainList[0].apis.rest[0].address,
      tx_bytes: "validBytes",
    }),
  } as unknown as Request;

  server.use(
    rest.post(
      `${ChainList[0].apis.rest[0].address}/cosmos/tx/v1beta1/simulate`,
      (_req, res, ctx) => {
        return res(ctx.status(500));
      }
    )
  );

  const response = await simulateTransactionHandler(mockReq);
  expect(response.status).toBe(500);
  const responseBody = await response.json();
  expect(responseBody.message).toBe(
    "An unexpected error occurred. Please try again."
  );
});

it("handles 400 errors correctly", async () => {
  const mockReq = {
    method: "POST",
    json: async () => ({
      restEndpoint: ChainList[0].apis.rest[0].address,
      tx_bytes: "validBytes",
    }),
  } as unknown as Request;

  server.use(
    rest.post(
      `${ChainList[0].apis.rest[0].address}/cosmos/tx/v1beta1/simulate`,
      (_req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ message: "Invalid tx_bytes", code: 123 })
        );
      }
    )
  );

  const response = await simulateTransactionHandler(mockReq);
  expect(response.status).toBe(400);
  const responseBody = await response.json();
  expect(responseBody.message).toBe("Invalid tx_bytes");
  expect(responseBody.code).toBe(123);
});
