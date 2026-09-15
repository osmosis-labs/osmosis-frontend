import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import cases from "jest-in-case";

import { compressZeros, formatFiatPrice, formatPretty } from "../formatter";

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

describe("formatPretty", () => {
  const opts = {
    maxDecimals: 6,
    maximumSignificantDigits: undefined,
    maximumFractionDigits: 3,
    notation: "standard" as const,
  };

  it("formats a PricePretty instance", () => {
    const price = new PricePretty(DEFAULT_VS_CURRENCY, new Dec("0.03349"));
    expect(formatPretty(price, opts)).toContain("0.033");
  });

  it("formats a foreign PricePretty copy without instanceof", () => {
    const foreign = {
      fiatCurrency: DEFAULT_VS_CURRENCY,
      toDec: () => new Dec("0.03349"),
      toString: () => "$0.03349",
    };
    expect(foreign instanceof PricePretty).toBe(false);
    expect(formatPretty(foreign as unknown as PricePretty, opts)).toContain(
      "0.033"
    );
  });

  it("revives a superjson-leaked PricePretty plain object", () => {
    const leaked = {
      _fiatCurrency: DEFAULT_VS_CURRENCY,
      amount: 0.03349002870085137,
      _options: {
        separator: "",
        upperCase: false,
        lowerCase: false,
        locale: "en-US",
      },
    };
    expect(formatPretty(leaked as unknown as PricePretty, opts)).toContain(
      "0.033"
    );
  });

  it("formats a foreign Dec copy without instanceof or toDec", () => {
    const real = new Dec("1.25");
    const foreign = {
      int: "int-from-other-bundle",
      truncate: () => ({ toString: () => "1" }),
      toString: () => real.toString(),
    };
    expect(foreign instanceof Dec).toBe(false);
    expect(formatPretty(foreign as unknown as Dec, opts)).toContain("1.25");
  });
});
