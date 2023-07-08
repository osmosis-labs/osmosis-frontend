import { Coin, Dec, Int } from "@keplr-wallet/unit";

import { maxSpotPrice, maxTick, minSpotPrice } from "../const";
import { approxSqrt } from "../math";
import {
  estimateInitialTickBound,
  priceToTick,
  tickToSqrtPrice,
} from "../tick";

// https://github.com/osmosis-labs/osmosis/blob/0f9eb3c1259078035445b3e3269659469b95fd9f/x/concentrated-liquidity/math/tick_test.go#L30
describe("tickToSqrtPrice", () => {
  const testCases: Record<
    string,
    {
      tickIndex: Int;
      expectedPrice?: Dec;
      expectedError?: boolean;
    }
  > = {
    "Ten billionths cent increments at the millionths place: 1": {
      tickIndex: new Int("-51630100"),
      expectedPrice: new Dec("0.0000033699"),
    },
    "Ten billionths cent increments at the millionths place: 2": {
      tickIndex: new Int("-51630000"),
      expectedPrice: new Dec("0.0000033700"),
    },
    "One millionths cent increments at the hundredths place: 1": {
      tickIndex: new Int("-11999800"),
      expectedPrice: new Dec("0.070002"),
    },
    "One millionths cent increments at the hundredths place: 2": {
      tickIndex: new Int("-11999700"),
      expectedPrice: new Dec("0.070003"),
    },
    "One hundred thousandth cent increments at the tenths place: 1": {
      tickIndex: new Int("-999800"),
      expectedPrice: new Dec("0.90002"),
    },
    "One hundred thousandth cent increments at the tenths place: 2": {
      tickIndex: new Int("-999700"),
      expectedPrice: new Dec("0.90003"),
    },
    "One ten thousandth cent increments at the ones place: 1": {
      tickIndex: new Int("1000000"),
      expectedPrice: new Dec("2"),
    },
    "One dollar increments at the ten thousands place: 2": {
      tickIndex: new Int("1000100"),
      expectedPrice: new Dec("2.0001"),
    },
    "One thousandth cent increments at the tens place: 1": {
      tickIndex: new Int("9200100"),
      expectedPrice: new Dec("12.001"),
    },
    "One thousandth cent increments at the tens place: 2": {
      tickIndex: new Int("9200200"),
      expectedPrice: new Dec("12.002"),
    },
    "One cent increments at the hundreds place: 1": {
      tickIndex: new Int("18320100"),
      expectedPrice: new Dec("132.01"),
    },
    "One cent increments at the hundreds place: 2": {
      tickIndex: new Int("18320200"),
      expectedPrice: new Dec("132.02"),
    },
    "Ten cent increments at the thousands place: 1": {
      tickIndex: new Int("27732100"),
      expectedPrice: new Dec("1732.10"),
    },
    "Ten cent increments at the thousands place: 2": {
      tickIndex: new Int("27732200"),
      expectedPrice: new Dec("1732.20"),
    },
    "Dollar increments at the ten thousands place: 1": {
      tickIndex: new Int("36073200"),
      expectedPrice: new Dec("10732"),
    },
    "Dollar increments at the ten thousands place: 2": {
      tickIndex: new Int("36073300"),
      expectedPrice: new Dec("10733"),
    },
    "Max tick and min k": {
      tickIndex: new Int("342000000"),
      expectedPrice: maxSpotPrice,
    },
    "Min tick and max k": {
      tickIndex: new Int("-108000000"),
      expectedPrice: minSpotPrice,
    },
    "error: tickIndex less than minimum": {
      tickIndex: new Int("-162000001"),
      expectedError: true,
    },
  };

  Object.keys(testCases).forEach((desc) => {
    it(desc, () => {
      const testCase = testCases[desc];
      if (testCase.expectedError) {
        expect(() => {
          tickToSqrtPrice(testCase.tickIndex);
        }).toThrow();
      } else if (typeof testCase.expectedPrice !== "undefined") {
        const sqrtPrice = tickToSqrtPrice(testCase.tickIndex);
        const expectedSqrtPrice = approxSqrt(testCase.expectedPrice);
        expect(sqrtPrice.toString()).toEqual(expectedSqrtPrice.toString());
      } else {
        throw new Error("Invalid test case");
      }
    });
  });
});

// https://github.com/osmosis-labs/osmosis/blob/0f9eb3c1259078035445b3e3269659469b95fd9f/x/concentrated-liquidity/math/tick_test.go#L200
describe("priceToTick", () => {
  const testCases: Record<
    string,
    {
      price: Dec;
      tickExpected?: string;
      expectedError?: string;
    }
  > = {
    "BTC <> USD, tick 38035200 -> price 30352": {
      price: new Dec("30352"),
      tickExpected: "38035200",
    },
    "BTC <> USD, tick 38035300 + 100 -> price 30353": {
      price: new Dec("30353"),
      tickExpected: "38035300",
    },
    "SHIB <> USD, tick -44821000 -> price 0.000011790": {
      price: new Dec("0.000011790"),
      tickExpected: "-44821000",
    },
    "SHIB <> USD, tick -44820900 -> price 0.000011791": {
      price: new Dec("0.000011791"),
      tickExpected: "-44820900",
    },
    "ETH <> BTC, tick -12104000 -> price 0.068960": {
      price: new Dec("0.068960"),
      tickExpected: "-12104000",
    },
    "ETH <> BTC, tick -12104000 + 100 -> price 0.068961": {
      price: new Dec("0.068961"),
      tickExpected: "-12103900",
    },
    "max sqrt price -1, max neg tick six - 100 -> max tick neg six - 100": {
      price: new Dec("99999000000000000000000000000000000000"),
      tickExpected: maxTick.sub(new Int(100)).toString(),
    },
    "max sqrt price, max tick neg six -> max spot price": {
      price: maxSpotPrice,
      tickExpected: maxTick.toString(),
    },
    "Gyen <> USD, tick -20594000 -> price 0.0074060": {
      price: new Dec("0.007406"),
      tickExpected: "-20594000",
    },
    "Gyen <> USD, tick -20594000 + 100 -> price 0.0074061": {
      price: new Dec("0.0074061"),
      tickExpected: "-20593900",
    },
    "Spell <> USD, tick -29204000 -> price 0.00077960": {
      price: new Dec("0.0007796"),
      tickExpected: "-29204000",
    },
    "Spell <> USD, tick -29204000 + 100 -> price 0.00077961": {
      price: new Dec("0.00077961"),
      tickExpected: "-29203900",
    },
    "Atom <> Osmo, tick -12150000 -> price 0.068500": {
      price: new Dec("0.0685"),
      tickExpected: "-12150000",
    },
    "Atom <> Osmo, tick -12150000 + 100 -> price 0.068501": {
      price: new Dec("0.068501"),
      tickExpected: "-12149900",
    },
    "Boot <> Osmo, tick 64576000 -> price 25760000": {
      price: new Dec("25760000"),
      tickExpected: "64576000",
    },
    "Boot <> Osmo, tick 64576000 + 100 -> price 25761000": {
      price: new Dec("25761000"),
      tickExpected: "64576100",
    },
  };

  Object.values(testCases).forEach(({ price, expectedError }, i) => {
    it(Object.keys(testCases)[i], () => {
      try {
        const tick = priceToTick(price);
        expect(tick.toString()).toEqual(
          testCases[Object.keys(testCases)[i]].tickExpected
        );
      } catch {
        expect(expectedError).toBeDefined();
      }
    });
  });
});

describe("estimateInitialTickBound", () => {
  // src: https://github.com/osmosis-labs/osmosis/blob/0b199ee187fbff02f68c2dc503d60efe617a67b2/x/concentrated-liquidity/tick_test.go#L1865
  const tokenOutGivenInTestCases = [
    {
      does: "eth -> usdc (one for zero)",
      scenario: {
        tokenIn: new Coin("eth", "2000000"),
        token0: "eth",
        token1: "usdc",
        // these values taken from default CL pool in go tests
        currentTickLiquidity: new Dec("1517882343.751510418088349649"),
        currentSqrtPrice: new Dec("70.710678118654752440"),

        expectedBoundTickIndex: new Int("-108000000"),
      },
    },
    {
      does: "usdc -> eth (zero for one)",
      scenario: {
        tokenIn: new Coin("usdc", "10000000000"),
        token0: "eth",
        token1: "usdc",
        // these values taken from default CL pool in go tests
        currentTickLiquidity: new Dec("1517882343.751510418088349649"),
        currentSqrtPrice: new Dec("70.710678118654752440"),

        expectedBoundTickIndex: new Int("31975106"),
      },
    },
  ];

  describe("outGivenIn", () => {
    tokenOutGivenInTestCases.forEach(
      ({
        does,
        scenario: {
          tokenIn,
          token0,
          token1,
          currentTickLiquidity,
          currentSqrtPrice,
          expectedBoundTickIndex,
        },
      }) => {
        it(does, () => {
          const { boundTickIndex } = estimateInitialTickBound({
            specifiedToken: tokenIn,
            isOutGivenIn: true,
            token0Denom: token0,
            token1Denom: token1,
            currentTickLiquidity,
            currentSqrtPrice,
          });

          expect(boundTickIndex.toString()).toBe(
            expectedBoundTickIndex.toString()
          );
        });
      }
    );
  });

  const tokenInGivenOut = [
    {
      does: "eth -> usdc (one for zero)",
      scenario: {
        tokenOut: new Coin("usdc", "10000000000"),
        token0: "eth",
        token1: "usdc",
        // these values taken from default CL pool in go tests
        currentTickLiquidity: new Dec("1517882343.751510418088349649"),
        currentSqrtPrice: new Dec("70.710678118654752440"),

        expectedBoundTickIndex: new Int("-108000000"),
      },
    },
    {
      does: "usdc -> eth (zero for one)",
      scenario: {
        tokenOut: new Coin("eth", "2000000"),
        token0: "eth",
        token1: "usdc",
        // these values taken from default CL pool in go tests
        currentTickLiquidity: new Dec("1517882343.751510418088349649"),
        currentSqrtPrice: new Dec("70.710678118654752440"),

        expectedBoundTickIndex: new Int("31975106"),
      },
    },
  ];
  describe("inGivenOut", () => {
    tokenInGivenOut.forEach(
      ({
        does,
        scenario: {
          tokenOut,
          token0,
          token1,
          currentTickLiquidity,
          currentSqrtPrice,
          expectedBoundTickIndex,
        },
      }) => {
        it(does, () => {
          const { boundTickIndex } = estimateInitialTickBound({
            specifiedToken: tokenOut,
            isOutGivenIn: false,
            token0Denom: token0,
            token1Denom: token1,
            currentTickLiquidity,
            currentSqrtPrice,
          });

          expect(boundTickIndex.toString()).toBe(
            expectedBoundTickIndex.toString()
          );
        });
      }
    );
  });
});
