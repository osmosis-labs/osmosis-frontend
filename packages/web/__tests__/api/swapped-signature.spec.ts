import type { NextApiRequest, NextApiResponse } from "next";

import swappedSignatureHandler from "~/pages/api/swapped-signature";

const VALID_WALLET = "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3";

function createMockResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(data: unknown) {
      res.body = data;
      return res;
    },
  } satisfies Pick<NextApiResponse, "status" | "json"> & {
    statusCode: number;
    body: unknown;
  };

  return res;
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
