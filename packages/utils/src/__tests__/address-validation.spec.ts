import { isTonAddressValid } from "../address-validation";

// Fixtures generated with `Address` from @ton/core 0.61, which this
// validation replaced and was checked against.
describe("isTonAddressValid", () => {
  it.each([
    ["bounceable", "EQAHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHB8Jh"],
    [
      "non-bounceable, url-safe",
      "UQAHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHB5-k",
    ],
    ["test-only", "kQAHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHB3nr"],
    ["masterchain", "Ef-rq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urqzps"],
    [
      "raw",
      "-1:abababababababababababababababababababababababababababababababab",
    ],
    ["raw, upper-case hash", "0:" + "AB".repeat(32)],
  ])("accepts a %s address", (_, address) => {
    expect(isTonAddressValid({ address })).toBe(true);
  });

  it.each([
    ["a bad checksum", "EQAHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHB8Ji"],
    ["an unknown tag", "AQAHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHB8Jh"],
    ["the wrong length", "EQAHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHB8J"],
    [
      "non-base64 characters",
      "EQAHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcH!8Jh",
    ],
    ["a short raw hash", "0:" + "ab".repeat(31)],
    ["a non-hex raw hash", "0:" + "zz".repeat(32)],
    ["a non-numeric workchain", "x:" + "ab".repeat(32)],
    ["an empty string", ""],
  ])("rejects %s", (_, address) => {
    expect(isTonAddressValid({ address })).toBe(false);
  });
});
