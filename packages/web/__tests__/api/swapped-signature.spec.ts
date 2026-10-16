import type { NextApiRequest, NextApiResponse } from "next";

import swappedSignatureHandler from "~/pages/api/swapped-signature";

const VALID_WALLET = "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3";

type MockResponse = NextApiResponse & { body: unknown };

/** Implements only what the handler calls; the cast covers the rest. */
function createMockResponse(): MockResponse {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number): MockResponse {
      res.statusCode = code;
      return res as unknown as MockResponse;
    },
    json(data: unknown): MockResponse {
      res.body = data;
      return res as unknown as MockResponse;
    },
  };

  return res as unknown as MockResponse;
}

describe("POST /api/swapped-signature", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      SWAPPED_COM_SK: "test-swapped-secret",
    };
  });

  afterEach(() => {
    process.env = env;
  });

  it("rejects malformed JSON request bodies with 400", async () => {
    const req = {
      method: "POST",
      body: "{not-json",
    } as NextApiRequest;
    const res = createMockResponse();

    await swappedSignatureHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Malformed JSON request body",
    });
  });

  it("rejects invalid wallet addresses that were previously accepted", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({ walletAddress: "not-a-wallet" }),
    } as NextApiRequest;
    const res = createMockResponse();

    await swappedSignatureHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: expect.stringContaining("valid Osmosis address"),
    });
  });

  it("returns a signed URL for valid Osmosis wallet addresses", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({ walletAddress: VALID_WALLET }),
    } as NextApiRequest;
    const res = createMockResponse();

    await swappedSignatureHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      url: expect.stringContaining("widget.swapped.com"),
    });
  });
});
