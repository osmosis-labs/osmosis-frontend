import { Dec, Int } from "@keplr-wallet/unit";

import {
  exponentAtPriceOneMax,
  exponentAtPriceOneMin,
  maxSpotPrice,
  minSpotPrice,
} from "../const";
import {
  calculatePriceAndTicksPassed,
  computeMinMaxTicksFromExponentAtPriceOne,
  priceToTick,
} from "../tick";

// https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/internal/math/tick_test.go#L358
describe("computeMinMaxTicksFromExponentAtPriceOne", () => {
  it("exponentAtPriceOne -1", () => {
    const exponentAtPriceOne = -1;
    const { minTick, maxTick } =
      computeMinMaxTicksFromExponentAtPriceOne(exponentAtPriceOne);
    expect(minTick.toString()).toEqual("-1620");
    expect(maxTick.toString()).toEqual("3420");
  });
  it("exponentAtPriceOne -6", () => {
    const exponentAtPriceOne = -6;
    const { minTick, maxTick } =
      computeMinMaxTicksFromExponentAtPriceOne(exponentAtPriceOne);
    expect(minTick.toString()).toEqual("-162000000");
    expect(maxTick.toString()).toEqual("342000000");
  });
  it("exponentAtPriceOne -12", () => {
    const exponentAtPriceOne = -12;
    const { minTick, maxTick } =
      computeMinMaxTicksFromExponentAtPriceOne(exponentAtPriceOne);
    expect(minTick.toString()).toEqual("-162000000000000");
    expect(maxTick.toString()).toEqual("342000000000000");
  });
  it("exponentAtPriceOne -13", () => {
    const exponentAtPriceOne = -13;
    const { minTick, maxTick } =
      computeMinMaxTicksFromExponentAtPriceOne(exponentAtPriceOne);
    expect(minTick.toString()).toEqual("-1620000000000000");
    expect(maxTick.toString()).toEqual("3420000000000000");
  });
});

// https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/internal/math/tick_test.go#L325
describe("calculatePriceAndTicksPassed", () => {
  it("price > 1", () => {
    const price = new Dec("9.78");
    const exponentAtPriceOne = -5;

    const { currentPrice, ticksPassed, currentAdditiveIncrementInTicks } =
      calculatePriceAndTicksPassed(price, exponentAtPriceOne);

    expect(currentPrice.toString()).toEqual("10.000000000000000000");
    expect(ticksPassed.toString()).toEqual("900000");
    expect(currentAdditiveIncrementInTicks.toString()).toEqual(
      "0.000010000000000000000000000000000000"
    );
  });
  it("price < 1", () => {
    const price = new Dec("0.71");
    const exponentAtPriceOne = -6;

    const { currentPrice, ticksPassed, currentAdditiveIncrementInTicks } =
      calculatePriceAndTicksPassed(price, exponentAtPriceOne);

    expect(currentPrice.toString()).toEqual("0.100000000000000000");
    expect(ticksPassed.toString()).toEqual("-9000000");
    expect(currentAdditiveIncrementInTicks.toString()).toEqual(
      "0.000000100000000000000000000000000000"
    );
  });
});

describe("priceToTick", () => {
  interface TestCase {
    price: string;
    exponentAtPriceOne: number;
    tickExpected?: string;
    expectedError?: string;
  }

  const testCases: Record<string, TestCase> = {
    "50000 to tick with -4 k at price one": {
      price: "50000",
      exponentAtPriceOne: -4,
      tickExpected: "400000",
    },
    "5.01 to tick with -2 k at price one": {
      price: "5.01",
      exponentAtPriceOne: -2,
      tickExpected: "401",
    },
    "50000.01 to tick with -6 k at price one": {
      price: "50000.01",
      exponentAtPriceOne: -6,
      tickExpected: "40000001",
    },
    "0.090000889 to tick with -8 k at price one": {
      price: "0.090000889",
      exponentAtPriceOne: -8,
      tickExpected: "-999991110",
    },
    "0.9998 to tick with -4 k at price one": {
      price: "0.9998",
      exponentAtPriceOne: -4,
      tickExpected: "-20",
    },
    "53030.10 to tick with -5 k at price one": {
      price: "53030.1",
      exponentAtPriceOne: -5,
      tickExpected: "4030301",
    },
    "max spot price and minimum exponentAtPriceOne": {
      price: maxSpotPrice.toString(),
      exponentAtPriceOne: -1,
      tickExpected: "3420",
    },
    "min spot price and minimum exponentAtPriceOne": {
      price: minSpotPrice.toString(),
      exponentAtPriceOne: -1,
      tickExpected: "-1620",
    },
    "error: max spot price plus one and minimum exponentAtPriceOne": {
      price: "MAX_SPOT_PRICE_PLUS_ONE",
      exponentAtPriceOne: -1,
      expectedError: "PriceBoundError",
    },
    "error: price must be positive": {
      price: "-1",
      exponentAtPriceOne: -6,
      expectedError: "price must be greater than zero",
    },
    "error: exponentAtPriceOne less than minimum": {
      price: "50000",
      exponentAtPriceOne: exponentAtPriceOneMin
        .sub(new Int(1))
        .toBigNumber()
        .toJSNumber(),
      expectedError: "ExponentAtPriceOneError",
    },
    "error: exponentAtPriceOne greater than maximum": {
      price: "50000",
      exponentAtPriceOne: exponentAtPriceOneMax
        .sub(new Int(1))
        .toBigNumber()
        .toJSNumber(),
      expectedError: "ExponentAtPriceOneError",
    },
    random: {
      price: "0.0000000000889",
      exponentAtPriceOne: -8,
      tickExpected: "-9111000000",
    },
  };

  Object.values(testCases).forEach(
    ({ price, exponentAtPriceOne, expectedError }, i) => {
      it(Object.keys(testCases)[i], () => {
        try {
          const tick = priceToTick(new Dec(price), exponentAtPriceOne);
          expect(tick.toString()).toEqual(
            testCases[Object.keys(testCases)[i]].tickExpected
          );
        } catch {
          expect(expectedError).toBeDefined();
        }
      });
    }
  );
});
