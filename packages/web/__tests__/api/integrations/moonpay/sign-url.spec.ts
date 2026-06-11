import type { NextApiRequest, NextApiResponse } from "next";

import signMoonPayUrl from "~/pages/api/integrations/moonpay/sign-url";

const VALID_WALLET = "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3";
const ATTACKER_WALLET = "osmo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmcn030";

function createMockResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    send(data: unknown) {
      res.body = data;
      return res;
    },
  } satisfies Pick<NextApiResponse, "status" | "send"> & {
    statusCode: number;
    body: unknown;
  };

  return res;
}

describe("POST /api/integrations/moonpay/sign-url", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      MOONPAY_PRIVATE_KEY: "sk_test_abc123",
      NEXT_PUBLIC_MOONPAY_PUBLIC_KEY: "pk_test_abc123",
    };
  });

  afterEach(() => {
    process.env = env;
  });

  it("rejects the signing-oracle request shape (raw attacker-controlled URL)", async () => {
    const req = {
      method: "POST",
      body: {
        url: `https://buy.moonpay.com?apiKey=pk_test_abc123&walletAddress=${ATTACKER_WALLET}&currencyCode=OSMO`,
      },
    } as NextApiRequest;
    const res = createMockResponse();

    await signMoonPayUrl(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: expect.stringContaining("Raw MoonPay URLs are not accepted"),
    });
  });

  it("rejects invalid wallet addresses with 400", async () => {
    const req = {
      method: "POST",
      body: {
        walletAddress: "not-a-wallet",
        currencyCode: "OSMO",
      },
    } as NextApiRequest;
    const res = createMockResponse();

    await signMoonPayUrl(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: expect.stringContaining("valid bech32 address"),
    });
  });

  it("signs validated wallet params instead of a client-built URL", async () => {
    const req = {
      method: "POST",
      body: {
        walletAddress: VALID_WALLET,
        currencyCode: "OSMO",
        baseCurrencyCode: "USD",
      },
    } as NextApiRequest;
    const res = createMockResponse();

    await signMoonPayUrl(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      signature: expect.any(String),
    });
  });
});
