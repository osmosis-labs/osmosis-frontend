import { SkipApiClient } from "@osmosis-labs/bridge";
import type { NextApiRequest, NextApiResponse } from "next";

import { createSkipTxHandler } from "~/server/integrations/skip/tx-status-handler";

jest.mock("@osmosis-labs/bridge", () => ({
  SkipApiClient: jest.fn(),
}));

const MockSkipApiClient = SkipApiClient as unknown as jest.Mock;

function createMockRequest(query: Record<string, string | undefined>) {
  return { query } as unknown as NextApiRequest;
}

type MockResponse = Pick<NextApiResponse, "status" | "json"> & {
  statusCode: number;
  body: unknown;
};

function createMockResponse(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      res.statusCode = code;
      return res as unknown as NextApiResponse;
    },
    json(data: unknown) {
      res.body = data;
      return res as unknown as NextApiResponse;
    },
  };

  return res;
}

const validQuery = {
  chainID: "osmosis-1",
  txHash: "ABC123",
  env: "mainnet",
};

describe("createSkipTxHandler", () => {
  beforeEach(() => {
    MockSkipApiClient.mockClear();
  });

  it.each(["chainID", "txHash", "env"])(
    "returns 400 when %s is missing",
    async (missingParam) => {
      const query = jest.fn();
      const handler = createSkipTxHandler(query);
      const res = createMockResponse();

      await handler(
        createMockRequest({ ...validQuery, [missingParam]: undefined }),
        res as unknown as NextApiResponse
      );

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Missing required query parameters" });
      expect(query).not.toHaveBeenCalled();
      expect(MockSkipApiClient).not.toHaveBeenCalled();
    }
  );

  it("returns 400 when a parameter is an empty string", async () => {
    const query = jest.fn();
    const handler = createSkipTxHandler(query);
    const res = createMockResponse();

    await handler(
      createMockRequest({ ...validQuery, txHash: "" }),
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it("returns 200 with the query result, built against a client for the given env", async () => {
    const result = { status: "STATE_COMPLETED_SUCCESS" };
    const query = jest.fn().mockResolvedValue(result);
    const handler = createSkipTxHandler(query);
    const res = createMockResponse();

    await handler(
      createMockRequest(validQuery),
      res as unknown as NextApiResponse
    );

    expect(MockSkipApiClient).toHaveBeenCalledTimes(1);
    expect(MockSkipApiClient).toHaveBeenCalledWith("mainnet");
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(MockSkipApiClient.mock.instances[0], {
      chainID: "osmosis-1",
      txHash: "ABC123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(result);
  });

  it("returns 500 with the message when the query throws an Error", async () => {
    const query = jest.fn().mockRejectedValue(new Error("skip is down"));
    const handler = createSkipTxHandler(query);
    const res = createMockResponse();

    await handler(
      createMockRequest(validQuery),
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "skip is down" });
  });

  it("returns 500 with a generic message when the query throws a non-Error", async () => {
    const query = jest.fn().mockRejectedValue("string failure");
    const handler = createSkipTxHandler(query);
    const res = createMockResponse();

    await handler(
      createMockRequest(validQuery),
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "An unknown error occurred" });
  });
});
