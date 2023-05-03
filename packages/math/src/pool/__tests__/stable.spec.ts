import { Coin, Dec, DecUtils, Int } from "@keplr-wallet/unit";

import { BigDec } from "../../big-dec";
import { checkMultiplicativeErrorTolerance } from "../../rounding";
import {
  calcWSumSquares,
  cfmmConstantMultiNoV,
  solveCfmm,
  StableSwapMath,
  StableSwapToken,
} from "../stable";

describe("Test stableswap math", () => {
  describe("calcOutGivenIn", () => {
    test("even pool basic trade", () => {
      const poolAssets: StableSwapToken[] = [
        {
          amount: new Dec(1_000_000),
          denom: "foo",
          scalingFactor: 1,
        },
        {
          amount: new Dec(1_000_000),
          denom: "bar",
          scalingFactor: 1,
        },
      ];

      const tokenIn = new Coin("foo", 100);
      const swapFee = new Dec(0);

      const expectedTokenOut = { denom: "bar", amount: new Int(99) };

      const outAmount = StableSwapMath.calcOutGivenIn(
        poolAssets,
        tokenIn,
        expectedTokenOut.denom,
        swapFee
      );

      expect(outAmount.equals(expectedTokenOut.amount)).toBeTruthy();
    });

    test("even large pool basic trade (precision test)", () => {
      const poolAssets: StableSwapToken[] = [
        {
          amount: new Dec(1_000_000_000_000),
          denom: "foo",
          scalingFactor: 1,
        },
        {
          amount: new Dec(1_000_000_000_000),
          denom: "bar",
          scalingFactor: 1,
        },
      ];

      const tokenIn = new Coin("foo", 100);
      const swapFee = new Dec(0);

      const expectedTokenOut = { denom: "bar", amount: new Int(99) };

      const outAmount = StableSwapMath.calcOutGivenIn(
        poolAssets,
        tokenIn,
        expectedTokenOut.denom,
        swapFee
      );

      expect(outAmount.equals(expectedTokenOut.amount)).toBeTruthy();
    });

    test("even large pool basic trade (precision test)", () => {
      const poolAssets: StableSwapToken[] = [
        {
          amount: new Dec(1_000_000_000_000_000),
          denom: "foo",
          scalingFactor: 1,
        },
        {
          amount: new Dec(1_000_000_000_000_000),
          denom: "bar",
          scalingFactor: 1,
        },
      ];

      const tokenIn = new Coin("foo", 100);
      const swapFee = new Dec(0);

      const expectedTokenOut = { denom: "bar", amount: new Int(99) };

      const outAmount = StableSwapMath.calcOutGivenIn(
        poolAssets,
        tokenIn,
        expectedTokenOut.denom,
        swapFee
      );

      expect(outAmount.equals(expectedTokenOut.amount)).toBeTruthy();
    });

    // TODO: add swap fee tests
  });

  describe("calcInGivenOut", () => {
    test("even pool basic trade", () => {
      const poolAssets: StableSwapToken[] = [
        {
          amount: new Dec(1_000_000_000),
          denom: "foo",
          scalingFactor: 1,
        },
        {
          amount: new Dec(1_000_000_000),
          denom: "bar",
          scalingFactor: 1,
        },
      ];

      const tokenOut = new Coin("bar", 100);
      const swapFee = new Dec(0);

      const expectedTokenIn = { denom: "foo", amount: new Int(101) };

      const inAmount = StableSwapMath.calcInGivenOut(
        poolAssets,
        tokenOut,
        expectedTokenIn.denom,
        swapFee
      );

      expect(inAmount.equals(expectedTokenIn.amount)).toBeTruthy();
    });

    test("even large pool basic trade (precision test)", () => {
      const poolAssets: StableSwapToken[] = [
        {
          amount: new Dec(1_000_000_000_000),
          denom: "foo",
          scalingFactor: 1,
        },
        {
          amount: new Dec(1_000_000_000_000),
          denom: "bar",
          scalingFactor: 1,
        },
      ];

      const tokenOut = new Coin("bar", 100);
      const swapFee = new Dec(0);

      const expectedTokenIn = { denom: "foo", amount: new Int(101) };

      const inAmount = StableSwapMath.calcInGivenOut(
        poolAssets,
        tokenOut,
        expectedTokenIn.denom,
        swapFee
      );

      expect(inAmount.equals(expectedTokenIn.amount)).toBeTruthy();
    });

    test("even large pool basic trade (precision test)", () => {
      const poolAssets: StableSwapToken[] = [
        {
          amount: new Dec(1_000_000_000_000_000),
          denom: "foo",
          scalingFactor: 1,
        },
        {
          amount: new Dec(1_000_000_000_000_000),
          denom: "bar",
          scalingFactor: 1,
        },
      ];

      const tokenIn = new Coin("foo", 100);
      const swapFee = new Dec(0);

      const expectedTokenOut = { denom: "bar", amount: new Int(99) };

      const outAmount = StableSwapMath.calcOutGivenIn(
        poolAssets,
        tokenIn,
        expectedTokenOut.denom,
        swapFee
      );

      expect(outAmount.equals(expectedTokenOut.amount)).toBeTruthy();
    });

    // TODO: add swap fee tests
  });

  describe("calcSpotPrice", () => {
    test("foo in terms of bar in even pool", () => {
      const poolAssets: StableSwapToken[] = [
        {
          amount: new Dec(1_000_000_000),
          denom: "foo",
          scalingFactor: 1,
        },
        {
          amount: new Dec(1_000_000_000),
          denom: "bar",
          scalingFactor: 1,
        },
        {
          amount: new Dec(1_000_000_000),
          denom: "baz",
          scalingFactor: 1,
        },
      ];

      const baseDenom = "foo";
      const quoteDenom = "bar";

      const expectedSpotPrice = new Dec(1.0);

      const actualSpotPrice = StableSwapMath.calcSpotPrice(
        poolAssets,
        baseDenom,
        quoteDenom
      );

      const tolerance = new Dec(1).quo(
        DecUtils.getTenExponentNInPrecisionRange(3)
      );
      const comparison = checkMultiplicativeErrorTolerance(
        expectedSpotPrice,
        actualSpotPrice,
        tolerance,
        "roundBankers"
      );
      expect(comparison == 0).toBeTruthy();
    });

    test("foo in terms of bar in uneven pool", () => {
      const poolAssets: StableSwapToken[] = [
        {
          amount: new Dec(10_000_000_000),
          denom: "foo",
          scalingFactor: 1,
        },
        {
          amount: new Dec(20_000_000_000),
          denom: "bar",
          scalingFactor: 1,
        },
        {
          amount: new Dec(30_000_000_000),
          denom: "baz",
          scalingFactor: 1,
        },
      ];

      // quote and base definitions following V2 Querier
      const baseDenom = "bar";
      const quoteDenom = "foo";

      const expectedSpotPrice = new Dec(1.45454545454545);

      const actualSpotPrice = StableSwapMath.calcSpotPrice(
        poolAssets,
        baseDenom,
        quoteDenom
      );

      const tolerance = new Dec(1).quo(
        DecUtils.getTenExponentNInPrecisionRange(3)
      );
      const comparison = checkMultiplicativeErrorTolerance(
        expectedSpotPrice,
        actualSpotPrice,
        tolerance,
        "roundBankers"
      );

      expect(comparison == 0).toBeTruthy();
    });

    test("even large pool basic trade (precision test)", () => {
      const poolAssets: StableSwapToken[] = [
        {
          amount: new Dec(1_000_000_000_000),
          denom: "foo",
          scalingFactor: 1,
        },
        {
          amount: new Dec(1_000_000_000_000),
          denom: "bar",
          scalingFactor: 1,
        },
      ];

      const tokenOut = new Coin("bar", 100);
      const swapFee = new Dec(0);

      const expectedTokenIn = { denom: "foo", amount: new Int(101) };

      const inAmount = StableSwapMath.calcInGivenOut(
        poolAssets,
        tokenOut,
        expectedTokenIn.denom,
        swapFee
      );

      expect(inAmount.equals(expectedTokenIn.amount)).toBeTruthy();
    });
  });

  describe("solver", () => {
    test("even 3-asset small pool, small input", () => {
      const xReserve = new BigDec(100_000_000);
      const yReserve = new BigDec(100_000_000);
      const remReserves = [new BigDec(100_000_000)];
      const yIn = new BigDec(1_000);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);
      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("even 3-asset medium pool, small input", () => {
      const xReserve = new BigDec(100_000);
      const yReserve = new BigDec(100_000);
      const remReserves = [new BigDec(100_000)];
      const yIn = new BigDec(100);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });

    test("even 4-asset small pool, small input", () => {
      const xReserve = new BigDec(100);
      const yReserve = new BigDec(100);
      const remReserves = [new BigDec(100), new BigDec(100)];
      const yIn = new BigDec(1);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("even 4-asset medium pool, small input", () => {
      const xReserve = new BigDec(100_000);
      const yReserve = new BigDec(100_000);
      const remReserves = [new BigDec(100_000), new BigDec(100_000)];
      const yIn = new BigDec(1);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("even 4-asset large pool (100M each), small input", () => {
      const xReserve = new BigDec(100_000_000);
      const yReserve = new BigDec(100_000_000);
      const remReserves = [new BigDec(100_000_000), new BigDec(100_000_000)];
      const yIn = new BigDec(100);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("even 4-asset pool (10B each post-scaled), small input", () => {
      const xReserve = new BigDec(10_000_000_000);
      const yReserve = new BigDec(10_000_000_000);
      const remReserves = [
        new BigDec(10_000_000_000),
        new BigDec(10_000_000_000),
      ];
      const yIn = new BigDec(100_000_000);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("even 10-asset pool (10B each post-scaled), small input", () => {
      const xReserve = new BigDec(10_000_000_000);
      const yReserve = new BigDec(10_000_000_000);
      const remReserves = [
        new BigDec(10_000_000_000), // 3
        new BigDec(10_000_000_000), // 4
        new BigDec(10_000_000_000), // 5
        new BigDec(10_000_000_000), // 6
        new BigDec(10_000_000_000), // 7
        new BigDec(10_000_000_000), // 8
        new BigDec(10_000_000_000), // 9
        new BigDec(10_000_000_000), // 10
      ];
      const yIn = new BigDec(100);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("even 10-asset pool (100B each post-scaled), large input", () => {
      const xReserve = new BigDec(100_000_000_000);
      const yReserve = new BigDec(100_000_000_000);
      const remReserves = [
        new BigDec(100_000_000_000), // 3
        new BigDec(100_000_000_000), // 4
        new BigDec(100_000_000_000), // 5
        new BigDec(100_000_000_000), // 6
        new BigDec(100_000_000_000), // 7
        new BigDec(100_000_000_000), // 8
        new BigDec(100_000_000_000), // 9
        new BigDec(100_000_000_000), // 10
      ];
      const yIn = new BigDec(10_000_000_000);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });

    // uneven pools
    test("uneven 3-asset pool, even swap assets as pool minority", () => {
      const xReserve = new BigDec(100);
      const yReserve = new BigDec(100);
      const remReserves = [new BigDec(100_000)];
      const yIn = new BigDec(10);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("uneven 3-asset pool, uneven swap assets as pool minority, y > x", () => {
      const xReserve = new BigDec(100);
      const yReserve = new BigDec(200);
      const remReserves = [new BigDec(100_000)];
      const yIn = new BigDec(10);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("uneven 3-asset pool, uneven swap assets as pool minority, x > y", () => {
      const xReserve = new BigDec(200);
      const yReserve = new BigDec(100);
      const remReserves = [new BigDec(100_000)];
      const yIn = new BigDec(10);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("uneven 3-asset pool, no round numbers", () => {
      const xReserve = new BigDec(1178349);
      const yReserve = new BigDec(8329743);
      const remReserves = [new BigDec(329847)];
      const yIn = new BigDec(10);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("uneven 4-asset pool, small input and swap assets in pool minority", () => {
      const xReserve = new BigDec(100);
      const yReserve = new BigDec(100);
      const remReserves = [new BigDec(100_000), new BigDec(100_000)];
      const yIn = new BigDec(10);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("uneven 4-asset pool, even swap assets in pool majority", () => {
      const xReserve = new BigDec(100_000);
      const yReserve = new BigDec(100_000);
      const remReserves = [new BigDec(100), new BigDec(100)];
      const yIn = new BigDec(10);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("uneven 4-asset pool, even swap assets in pool majority", () => {
      const xReserve = new BigDec(100_000);
      const yReserve = new BigDec(100_000);
      const remReserves = [new BigDec(100), new BigDec(100)];
      const yIn = new BigDec(10);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("uneven 4-asset pool, uneven swap assets in pool majority, y > x", () => {
      const xReserve = new BigDec(100_000);
      const yReserve = new BigDec(200_000);
      const remReserves = [new BigDec(100), new BigDec(100)];
      const yIn = new BigDec(10);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("uneven 4-asset pool, uneven swap assets in pool majority, y < x", () => {
      const xReserve = new BigDec(200_000);
      const yReserve = new BigDec(100_000);
      const remReserves = [new BigDec(100), new BigDec(100)];
      const yIn = new BigDec(10);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });
    test("uneven 4-asset pool, no round numbers", () => {
      const xReserve = new BigDec(1178349);
      const yReserve = new BigDec(8329743);
      const remReserves = [new BigDec(329847), new BigDec(4372897)];
      const yIn = new BigDec(10);

      const xOut = solveCfmm(xReserve, yReserve, remReserves, yIn);

      const xFinal = xReserve.add(xOut);
      const yFinal = yReserve.add(yIn);

      // wSumSquares shouldn't change across swaps
      const wSumSquares = calcWSumSquares(remReserves);
      const kBefore = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
      const kAfter = cfmmConstantMultiNoV(xFinal, yFinal, wSumSquares);

      expect(kBefore.lt(kAfter)).toBeTruthy();
    });

    // check for expected exceptions to be thrown
    test("negative xReserve", () => {
      const xReserve = new BigDec(-100);
      const yReserve = new BigDec(100);
      const remReserves = [new BigDec(100), new BigDec(100)];
      const yIn = new BigDec(1);

      expect(() =>
        solveCfmm(xReserve, yReserve, remReserves, yIn)
      ).toThrowError();
    });
    test("negative yReserve", () => {
      const xReserve = new BigDec(100);
      const yReserve = new BigDec(-100);
      const remReserves = [new BigDec(100), new BigDec(100)];
      const yIn = new BigDec(1);

      expect(() =>
        solveCfmm(xReserve, yReserve, remReserves, yIn)
      ).toThrowError();
    });
    test("input greater than pool reserves (even 4-asset pool)", () => {
      const xReserve = new BigDec(100);
      const yReserve = new BigDec(100);
      const remReserves = [new BigDec(100), new BigDec(100)];
      const yIn = new BigDec(1000);

      expect(() =>
        solveCfmm(xReserve, yReserve, remReserves, yIn)
      ).toThrowError();
    });
  });
});
