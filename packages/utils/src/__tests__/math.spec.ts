import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";
import cases from "jest-in-case";

import { DEFAULT_VS_CURRENCY } from "../fiat-getters";
import { mulPrice, sum } from "../math";

cases(
  "sumArray(arr)",
  (opts) => {
    expect(sum(opts.arr as any[])).toEqual(new Dec(opts.result));
  },
  [
    {
      name: "should return correct sum for array of numbers",
      arr: [1, 2, 3, 4, 5],
      result: "15",
    },
    {
      name: "should return correct sum for array of strings",
      arr: ["1", "2", "3", "4", "5"],
      result: "15",
    },
    {
      name: "should return correct sum for array of Decs",
      arr: [new Dec(1), new Dec(2), new Dec(3), new Dec(4), new Dec(5)],
      result: "15",
    },
    {
      name: "should return correct sum for array of objects with toDec method",
      arr: [
        { toDec: () => new Dec(1) },
        { toDec: () => new Dec(2) },
        { toDec: () => new Dec(3) },
        { toDec: () => new Dec(4) },
        { toDec: () => new Dec(5) },
      ],
      result: "15",
    },
    {
      name: "should return correct sum for mixed array",
      arr: [1, "2", new Dec(3), { toDec: () => new Dec(4) }, "5"],
      result: "15",
    },
    {
      name: "should return 0 for empty array",
      arr: [],
      result: "0",
    },
    {
      name: "should return 0 for empty array",
      arr: undefined,
      result: "0",
    },
  ]
);

const testDenom = "USDC";

describe("mulPrice", () => {
  const defaultCurrency = {
    coinDenom: testDenom,
    coinMinimalDenom: testDenom,
    coinDecimals: 0,
  };

  const defaultHundredCoin: CoinPretty = new CoinPretty(defaultCurrency, 100);
  const defaultTenPrice = new PricePretty(DEFAULT_VS_CURRENCY, 10);

  it("should return undefined if either amount or price is undefined", () => {
    expect(mulPrice(undefined, undefined, DEFAULT_VS_CURRENCY)).toBeUndefined();
    expect(
      mulPrice(defaultHundredCoin, undefined, DEFAULT_VS_CURRENCY)
    ).toBeUndefined();
    expect(
      mulPrice(undefined, defaultTenPrice, DEFAULT_VS_CURRENCY)
    ).toBeUndefined();
  });

  it("should return the multiplied price if both amount and price are defined", () => {
    const expectedValue = defaultHundredCoin
      .toDec()
      .mul(defaultTenPrice.toDec());
    const expectedPrice = new PricePretty(DEFAULT_VS_CURRENCY, expectedValue);

    expect(
      mulPrice(defaultHundredCoin, defaultTenPrice, DEFAULT_VS_CURRENCY)
    ).toEqual(expectedPrice);
  });
});
