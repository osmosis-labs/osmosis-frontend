import { Dec, Int } from "@osmosis-labs/unit";

import { BigDec } from "../../../big-dec";
import { approxSqrt } from "../../../utils";
import { tickToSqrtPrice } from "../tick";
import { calcZapInSwapAmount } from "../zap-in";

/** Geometric mean of the range's sqrt-price bounds — the spot at which a
 *  position requires equal value on both sides (50/50 split). */
function geometricMeanSqrtPrice(lowerTick: Int, upperTick: Int): BigDec {
  const lower = tickToSqrtPrice(lowerTick);
  const upper = tickToSqrtPrice(upperTick);
  return new BigDec(approxSqrt(lower.mul(upper)));
}

/** Asserts `actual` is within `tolerance` micro units of `expected`. */
function expectWithin(actual: Int, expected: Int, tolerance: Int) {
  const diff = actual.sub(expected).abs();
  // surfaced via the message on failure
  if (!diff.lte(tolerance)) {
    throw new Error(
      `expected ${actual.toString()} within ${tolerance.toString()} of ${expected.toString()} (diff ${diff.toString()})`
    );
  }
}

describe("calcZapInSwapAmount", () => {
  // A representative 6-decimal pool range around a price of ~1.
  const lowerTick = new Int(-1000000); // price < 1
  const upperTick = new Int(1000000); // price > 1
  const inputAmount = new Int("1000000000"); // 1,000 of a 6-decimal token

  describe("range centered on spot (geometric mean)", () => {
    const currentSqrtPrice = geometricMeanSqrtPrice(lowerTick, upperTick);

    it("swaps ~half when providing base", () => {
      const swap = calcZapInSwapAmount({
        inputAmount,
        inputSide: "base",
        lowerTick,
        upperTick,
        currentSqrtPrice,
      });
      expectWithin(
        swap,
        inputAmount.toDec().quo(new Dec(2)).truncate(),
        new Int("1000")
      );
    });

    it("swaps ~half when providing quote", () => {
      const swap = calcZapInSwapAmount({
        inputAmount,
        inputSide: "quote",
        lowerTick,
        upperTick,
        currentSqrtPrice,
      });
      expectWithin(
        swap,
        inputAmount.toDec().quo(new Dec(2)).truncate(),
        new Int("1000")
      );
    });
  });

  describe("range entirely above spot (spot below range)", () => {
    // Spot sits below the lower bound => position is one-sided base (token0).
    const currentSqrtPrice = new BigDec(
      tickToSqrtPrice(lowerTick).mul(new Dec("0.5"))
    );

    it("requires no swap when providing base (the active asset)", () => {
      const swap = calcZapInSwapAmount({
        inputAmount,
        inputSide: "base",
        lowerTick,
        upperTick,
        currentSqrtPrice,
      });
      expect(swap.toString()).toBe("0");
    });

    it("swaps the full input when providing quote (the inactive asset)", () => {
      const swap = calcZapInSwapAmount({
        inputAmount,
        inputSide: "quote",
        lowerTick,
        upperTick,
        currentSqrtPrice,
      });
      expect(swap.toString()).toBe(inputAmount.toString());
    });
  });

  describe("range entirely below spot (spot above range)", () => {
    // Spot sits above the upper bound => position is one-sided quote (token1).
    const currentSqrtPrice = new BigDec(
      tickToSqrtPrice(upperTick).mul(new Dec("2"))
    );

    it("requires no swap when providing quote (the active asset)", () => {
      const swap = calcZapInSwapAmount({
        inputAmount,
        inputSide: "quote",
        lowerTick,
        upperTick,
        currentSqrtPrice,
      });
      expect(swap.toString()).toBe("0");
    });

    it("swaps the full input when providing base (the inactive asset)", () => {
      const swap = calcZapInSwapAmount({
        inputAmount,
        inputSide: "base",
        lowerTick,
        upperTick,
        currentSqrtPrice,
      });
      expect(swap.toString()).toBe(inputAmount.toString());
    });
  });

  describe("underweighted vs overweighted asset", () => {
    // Skew spot toward the lower bound => position is mostly base (token0),
    // so base is the overweighted side and quote the underweighted side.
    const geoMean = geometricMeanSqrtPrice(lowerTick, upperTick);
    const lower = new BigDec(tickToSqrtPrice(lowerTick));
    // Halfway (in sqrt-price space) between the lower bound and the center.
    const currentSqrtPrice = lower.add(geoMean.sub(lower).quo(new BigDec(2)));

    it("swaps less of the overweighted (base) asset than the underweighted (quote) asset", () => {
      const baseSwap = calcZapInSwapAmount({
        inputAmount,
        inputSide: "base",
        lowerTick,
        upperTick,
        currentSqrtPrice,
      });
      const quoteSwap = calcZapInSwapAmount({
        inputAmount,
        inputSide: "quote",
        lowerTick,
        upperTick,
        currentSqrtPrice,
      });

      // both are partial swaps
      expect(baseSwap.gt(new Int(0))).toBe(true);
      expect(baseSwap.lt(inputAmount)).toBe(true);
      expect(quoteSwap.gt(new Int(0))).toBe(true);
      expect(quoteSwap.lt(inputAmount)).toBe(true);

      // providing the already-overweighted base requires swapping less
      expect(baseSwap.lt(quoteSwap)).toBe(true);
    });
  });

  describe("non-6-decimal pool (18-decimal asset)", () => {
    // 18-decimal token0 against a 6-decimal token1. The chain sqrt price is on
    // the micro-denom basis, so a price near $1 with a 10^12 decimal gap gives
    // a price ~10^-12 and a sqrt price ~10^-6. The split math is decimal-
    // agnostic, so it should still land the position's ratio.
    const lower18 = new Int(-108000000 / 2);
    const upper18 = new Int(108000000 / 2);
    const currentSqrtPrice = geometricMeanSqrtPrice(lower18, upper18);
    const input18 = new Int("1000000000000000000000"); // 1,000 of an 18-dec token

    it("produces a sensible partial swap when centered", () => {
      const swap = calcZapInSwapAmount({
        inputAmount: input18,
        inputSide: "base",
        lowerTick: lower18,
        upperTick: upper18,
        currentSqrtPrice,
      });
      expectWithin(
        swap,
        input18.toDec().quo(new Dec(2)).truncate(),
        // tolerance scaled to the 18-decimal magnitude
        new Int("1000000000000000")
      );
    });
  });

  describe("degenerate inputs (early return, no NaN/divide-by-zero)", () => {
    const currentSqrtPrice = geometricMeanSqrtPrice(lowerTick, upperTick);

    it("returns 0 for a zero input amount", () => {
      const swap = calcZapInSwapAmount({
        inputAmount: new Int(0),
        inputSide: "base",
        lowerTick,
        upperTick,
        currentSqrtPrice,
      });
      expect(swap.toString()).toBe("0");
    });

    it("returns 0 when the pool has no spot price (zero sqrt price)", () => {
      const swap = calcZapInSwapAmount({
        inputAmount,
        inputSide: "quote",
        lowerTick,
        upperTick,
        currentSqrtPrice: new BigDec(0),
      });
      expect(swap.toString()).toBe("0");
    });
  });
});
