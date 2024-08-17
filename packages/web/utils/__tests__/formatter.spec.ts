import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import cases from "jest-in-case";

import { compressZeros, formatFiatPrice } from "../formatter";

describe("compressZeros function", () => {
  it("should not compress zeros with and handle the absence of currency symbol", () => {
    expect(compressZeros("123.00", false)).toEqual({
      currencySign: undefined,
      significantDigits: "123",
      zeros: 0,
      decimalDigits: "00",
    });
  });

  it("should not compress zeros even if there is a currency symbol", () => {
    expect(compressZeros("$0.00", true)).toEqual({
      currencySign: "$",
      significantDigits: "0",
      zeros: 0,
      decimalDigits: "00",
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

  it("should correctly handle cases with only leading zeros less than the default threshold", () => {
    expect(compressZeros("$00.005", true)).toEqual({
      currencySign: "$",
      significantDigits: "00",
      zeros: 0,
      decimalDigits: "005",
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
      zeros: 0,
      decimalDigits: "00",
    });
  });
  it("should compress zeros with the default threshold", () => {
    expect(compressZeros("$0.00000029183", true)).toEqual({
      currencySign: "$",
      significantDigits: "0",
      zeros: 6,
      decimalDigits: "29183",
    });
  });
  it("should not compress zeros with a different threshold", () => {
    expect(compressZeros("$1.000000323", true, 8)).toEqual({
      currencySign: "$",
      significantDigits: "1",
      zeros: 0,
      decimalDigits: "000000323",
    });
  });
  it("should compress zeros with a different threshold", () => {
    expect(compressZeros("$1.00000000323", true, 5)).toEqual({
      currencySign: "$",
      significantDigits: "1",
      zeros: 8,
      decimalDigits: "323",
    });
  });
});

cases(
  "formatFiatPrice",
  ({ input, output, maxDecimals }) => {
    const inputPrice = new PricePretty(DEFAULT_VS_CURRENCY, new Dec(input));
    expect(formatFiatPrice(inputPrice, maxDecimals)).toEqual(output);
  },
  [
    {
      name: "Standard formatting",
      input: "1.24",
      output: "$1.24",
    },
    {
      name: "1c Value",
      input: "0.01",
      output: "$0.01",
    },
    {
      name: "Sub 1c value",
      input: "0.001",
      output: "<$0.01",
    },
    {
      name: "Large value with too many decimals",
      input: "12345.12345",
      output: "$12,345.12",
      maxDecimals: 2,
    },
    {
      name: "Large value with too few decimals",
      input: "12345.1",
      output: "$12,345.10",
      maxDecimals: 2,
    },
    {
      name: "Extremely small value",
      input: "0.000000000012",
      output: "<$0.01",
    },
  ]
);
