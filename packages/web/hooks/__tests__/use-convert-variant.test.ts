import { Dec } from "@osmosis-labs/unit";

import { checkLargeAmountDiff } from "../use-convert-variant";

describe("isLargeAmountDiff", () => {
  test("returns false when input amount is zero", () => {
    expect(checkLargeAmountDiff(new Dec("0"), new Dec("100"))).toBe(false);
  });

  test("returns false when output is 95% or more of input", () => {
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("95"))).toBe(false);
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("96"))).toBe(false);
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("100"))).toBe(false);
  });

  test("returns true when output is less than 95% of input", () => {
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("94"))).toBe(true);
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("90"))).toBe(true);
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("50"))).toBe(true);
  });
});
