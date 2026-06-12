import crypto from "crypto";

import {
  parseSwappedSignRequestBody,
  signSwappedUrl,
  SWAPPED_WIDGET_PUBLIC_KEY,
} from "../sign-swapped-url";

const VALID_WALLET = "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3";
const ATTACKER_WALLET = "osmo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmcn030";
const TEST_SECRET = "test-swapped-secret";

describe("Swapped signing oracle prevention", () => {
  it("rejects invalid wallet addresses that were previously accepted", () => {
    expect(() => signSwappedUrl("not-a-wallet", TEST_SECRET)).toThrow(
      /valid Osmosis address/
    );
  });

  it("rejects non-osmo bech32 wallet addresses", () => {
    expect(() =>
      signSwappedUrl(
        "cosmos1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnrql8a",
        TEST_SECRET
      )
    ).toThrow(/valid Osmosis address/);
  });
});

describe("Swapped legitimate signing", () => {
  it("builds a signed URL with server-controlled widget params", () => {
    const { url } = signSwappedUrl(VALID_WALLET, TEST_SECRET);
    const parsed = new URL(url);

    expect(parsed.hostname).toBe("widget.swapped.com");
    expect(parsed.searchParams.get("apiKey")).toBe(SWAPPED_WIDGET_PUBLIC_KEY);
    expect(parsed.searchParams.get("walletAddress")).toBe(VALID_WALLET);
    expect(parsed.searchParams.get("currencyCode")).toBe("OSMO");
    expect(parsed.searchParams.get("signature")).toBeTruthy();
  });

  it("produces an HMAC signature over the query string", () => {
    const { url } = signSwappedUrl(ATTACKER_WALLET, TEST_SECRET);
    const parsed = new URL(url);
    const signature = parsed.searchParams.get("signature");
    parsed.searchParams.delete("signature");

    const expectedSignature = crypto
      .createHmac("sha256", TEST_SECRET)
      .update(parsed.search)
      .digest("base64");

    expect(signature).toBe(expectedSignature);
  });

  it("parses walletAddress from JSON request bodies", () => {
    expect(
      parseSwappedSignRequestBody(
        JSON.stringify({ walletAddress: VALID_WALLET })
      ).walletAddress
    ).toBe(VALID_WALLET);
  });
});
