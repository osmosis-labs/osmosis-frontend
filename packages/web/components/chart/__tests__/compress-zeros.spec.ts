import { compressZeros } from "~/components/chart/compress-zeros";

describe("compressZeros function", () => {
  it("should correctly compress zeros when no currency symbol is present", () => {
    expect(compressZeros("123.00", false)).toEqual({
      currencySign: undefined,
      significantDigits: "123",
      zeros: 2,
      decimalDigits: "",
    });
  });

  it("should correctly compress zeros when currency symbol is present", () => {
    expect(compressZeros("$0.00", true)).toEqual({
      currencySign: "$",
      significantDigits: "0",
      zeros: 2,
      decimalDigits: "",
    });
  });

  it("should correctly handle significant digits with leading zeros", () => {
    expect(compressZeros("$001.2300", true)).toEqual({
      currencySign: "$",
      significantDigits: "001",
      zeros: 0,
      decimalDigits: "2300",
    });
  });

  it("should return original value if there are no zeros to compress", () => {
    expect(compressZeros("$123.45", true)).toEqual({
      currencySign: "$",
      significantDigits: "123",
      zeros: 0,
      decimalDigits: "45",
    });
  });

  it("should correctly handle cases with only leading zeros", () => {
    expect(compressZeros("$00.005", true)).toEqual({
      currencySign: "$",
      significantDigits: "00",
      zeros: 2,
      decimalDigits: "5",
    });
  });

  it("should handle cases with no decimal part", () => {
    expect(compressZeros("$123", true)).toEqual({
      currencySign: "$",
      significantDigits: "123",
    });
  });

  it("should handle cases with no significant digits", () => {
    expect(compressZeros("$0.00", true)).toEqual({
      currencySign: "$",
      significantDigits: "0",
      zeros: 2,
      decimalDigits: "",
    });
  });
});
