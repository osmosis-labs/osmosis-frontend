/**
 * @jest-environment node
 */

// Polyfill for TextEncoder and TextDecoder
import { TextDecoder, TextEncoder } from "util";

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

import { isBitcoinAddressValid, shorten } from "../string";

describe("shorten", () => {
  it("should return an empty string if input is empty", () => {
    expect(shorten("")).toBe("");
  });

  it("should return the original string if it is shorter than the combined prefix and suffix length", () => {
    expect(shorten("short", { prefixLength: 3, suffixLength: 3 })).toBe(
      "short"
    );
  });

  it("should return the original string if it is exactly the combined prefix and suffix length", () => {
    expect(shorten("exactly", { prefixLength: 3, suffixLength: 4 })).toBe(
      "exactly"
    );
  });

  it("should shorten the string with default options", () => {
    expect(shorten("thisisaverylongstring")).toBe("thisis...tring");
  });

  it("should shorten the string with custom prefix and suffix lengths", () => {
    expect(
      shorten("thisisaverylongstring", { prefixLength: 4, suffixLength: 6 })
    ).toBe("this...string");
  });

  it("should shorten the string with a custom delimiter", () => {
    expect(
      shorten("thisisaverylongstring", {
        prefixLength: 4,
        suffixLength: 6,
        delim: "---",
      })
    ).toBe("this---string");
  });

  it("should handle edge cases where prefix or suffix is empty", () => {
    expect(
      shorten("thisisaverylongstring", { prefixLength: 0, suffixLength: 6 })
    ).toBe("...string");
    expect(
      shorten("thisisaverylongstring", { prefixLength: 4, suffixLength: 0 })
    ).toBe("this...");
  });
});

describe("isBitcoinAddressValid", () => {
  it("should return true for a valid Bitcoin address (P2PKH)", () => {
    const validAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    expect(isBitcoinAddressValid({ address: validAddress })).toBe(true);
  });

  it("should return true for a valid Bitcoin address (P2SH)", () => {
    const validAddress = "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy";
    expect(isBitcoinAddressValid({ address: validAddress })).toBe(true);
  });

  it("should return true for a valid Bitcoin address (P2WPKH)", () => {
    const validAddress = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq";
    expect(isBitcoinAddressValid({ address: validAddress })).toBe(true);
  });

  it("should return false for an invalid Bitcoin address", () => {
    const invalidAddress = "invalidBitcoinAddress";
    expect(isBitcoinAddressValid({ address: invalidAddress })).toBe(false);
  });

  it("should return false for an empty address", () => {
    const emptyAddress = "";
    expect(isBitcoinAddressValid({ address: emptyAddress })).toBe(false);
  });

  it("should return false for a malformed address", () => {
    const malformedAddress = "12345";
    expect(isBitcoinAddressValid({ address: malformedAddress })).toBe(false);
  });
});
