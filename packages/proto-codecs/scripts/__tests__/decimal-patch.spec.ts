// decimal.test.ts
import { Decimal as CodegenDecimal } from "../../src/codegen/decimals";
import { Decimal as DecimalPatch } from "../decimals-patch";

/**
 * Run the tests for both the codegen and the patch
 * to ensure that the patch is correctly applied.
 */
[DecimalPatch, CodegenDecimal].forEach((Decimal) => {
  test("should create a Decimal from user input", () => {
    const decimal = Decimal.fromUserInput("123.456", 3);
    expect(decimal.atomics).toBe("123456");
    expect(decimal.fractionalDigits).toBe(3);
  });

  test("should throw an error for invalid user input", () => {
    expect(() => Decimal.fromUserInput("123.45.6", 3)).toThrow(
      "More than one separator found"
    );
    expect(() => Decimal.fromUserInput("123a.456", 3)).toThrow(
      "Invalid character at position 4"
    );
    expect(() => Decimal.fromUserInput("123.4567", 3)).toThrow(
      "Got more fractional digits than supported"
    );
  });

  test("should create a Decimal from atomics", () => {
    const decimal = Decimal.fromAtomics("123456", 3);
    expect(decimal.atomics).toBe("123456");
    expect(decimal.fractionalDigits).toBe(3);
  });

  test("should convert Decimal to string", () => {
    const decimal = Decimal.fromUserInput("123.456", 3);
    expect(decimal.toString()).toBe("123456");

    const decimalNoFraction = Decimal.fromUserInput("123", 3);
    expect(decimalNoFraction.toString()).toBe("123000");
  });

  test("should handle edge cases", () => {
    const decimal = Decimal.fromUserInput("0.000", 3);
    expect(decimal.toString()).toBe("0");

    const decimalMaxFraction = Decimal.fromUserInput("1.999", 3);
    expect(decimalMaxFraction.toString()).toBe("1999");
  });

  test("toString should return the atomics", () => {
    const decimal = Decimal.fromUserInput("0.01", 18);
    expect(decimal.toString()).toBe("10000000000000000");
  });
});
