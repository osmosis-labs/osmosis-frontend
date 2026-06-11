import { MoonPay } from "@moonpay/moonpay-node";

import {
  buildMoonpayUrl,
  parseMoonpaySignRequestBody,
  signMoonpayUrl,
} from "../sign-moonpay-url";

const VALID_WALLET = "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3";
const ATTACKER_WALLET = "osmo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmcn030";

const TEST_KEYS = {
  privateKey: "sk_test_abc123",
  publicKey: "pk_test_abc123",
};

describe("MoonPay signing oracle prevention", () => {
  it("rejects raw client-supplied MoonPay URLs (signing oracle vector)", () => {
    const maliciousUrl = `https://buy.moonpay.com?apiKey=${TEST_KEYS.publicKey}&walletAddress=${ATTACKER_WALLET}&currencyCode=OSMO`;

    expect(() =>
      parseMoonpaySignRequestBody({
        url: maliciousUrl,
      })
    ).toThrow(/Raw MoonPay URLs are not accepted/);
  });

  it("rejects requests that include both url and walletAddress", () => {
    expect(() =>
      parseMoonpaySignRequestBody({
        url: `https://buy.moonpay.com?walletAddress=${ATTACKER_WALLET}`,
        walletAddress: VALID_WALLET,
      })
    ).toThrow(/Raw MoonPay URLs are not accepted/);
  });

  it("rejects requests that include url even when null or empty", () => {
    expect(() => parseMoonpaySignRequestBody({ url: null })).toThrow(
      /Raw MoonPay URLs are not accepted/
    );
    expect(() => parseMoonpaySignRequestBody({ url: "" })).toThrow(
      /Raw MoonPay URLs are not accepted/
    );
  });

  it("rejects invalid bech32 wallet addresses", () => {
    expect(() =>
      signMoonpayUrl(
        {
          walletAddress: "not-a-wallet",
          currencyCode: "OSMO",
        },
        TEST_KEYS
      )
    ).toThrow(/valid bech32 address/);
  });

  it("rejects non-osmo bech32 wallet addresses", () => {
    expect(() =>
      signMoonpayUrl(
        {
          walletAddress: "cosmos1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnrql8a",
          currencyCode: "OSMO",
        },
        TEST_KEYS
      )
    ).toThrow(/Osmosis \(osmo\) address/);
  });
});

describe("MoonPay legitimate signing", () => {
  it("builds a MoonPay URL from validated params instead of trusting client input", () => {
    const url = buildMoonpayUrl(
      {
        walletAddress: VALID_WALLET,
        currencyCode: "OSMO",
        baseCurrencyCode: "USD",
      },
      TEST_KEYS.publicKey
    );

    const parsed = new URL(url);
    expect(parsed.hostname).toBe("buy-sandbox.moonpay.com");
    expect(parsed.searchParams.get("apiKey")).toBe(TEST_KEYS.publicKey);
    expect(parsed.searchParams.get("walletAddress")).toBe(VALID_WALLET);
    expect(parsed.searchParams.get("currencyCode")).toBe("OSMO");
    expect(parsed.searchParams.get("baseCurrencyCode")).toBe("USD");
  });

  it("returns a signature that MoonPay SDK accepts for server-built URLs", () => {
    const signature = signMoonpayUrl(
      {
        walletAddress: VALID_WALLET,
        currencyCode: "OSMO",
        baseCurrencyCode: "USD",
      },
      TEST_KEYS
    );

    const url = buildMoonpayUrl(
      {
        walletAddress: VALID_WALLET,
        currencyCode: "OSMO",
        baseCurrencyCode: "USD",
      },
      TEST_KEYS.publicKey
    );
    const signedUrl = `${url}&signature=${encodeURIComponent(signature)}`;

    const moonPay = new MoonPay(TEST_KEYS.privateKey);
    expect(moonPay.url.isSignatureValid(signedUrl)).toBe(true);
  });
});
