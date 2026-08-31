import {
  getQuotePrice,
  LEGACY_QUOTE_COIN_MINIMAL_DENOM,
  QUOTE_COIN_MINIMAL_DENOM,
} from "../prices";

describe("getQuotePrice", () => {
  it("reads the current (alloy) quote key", () => {
    expect(getQuotePrice({ [QUOTE_COIN_MINIMAL_DENOM]: "1.5" })).toBe("1.5");
  });

  it("falls back to the legacy (Noble) quote key while sidecar has not restarted", () => {
    expect(getQuotePrice({ [LEGACY_QUOTE_COIN_MINIMAL_DENOM]: "1.5" })).toBe(
      "1.5"
    );
  });

  it("prefers the current key when a response carries both", () => {
    expect(
      getQuotePrice({
        [LEGACY_QUOTE_COIN_MINIMAL_DENOM]: "1.4",
        [QUOTE_COIN_MINIMAL_DENOM]: "1.5",
      })
    ).toBe("1.5");
  });

  it("returns undefined, never zero, when neither key is present", () => {
    expect(getQuotePrice({ "some/other/denom": "1.5" })).toBeUndefined();
    expect(getQuotePrice(undefined)).toBeUndefined();
  });
});
