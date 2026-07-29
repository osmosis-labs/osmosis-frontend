import { Dec, Int } from "@osmosis-labs/unit";

import { BigDec } from "../../../big-dec";
import { approxSqrt } from "../../../utils";
import { calcAmount0Delta, calcAmount1Delta } from "../math";
import { tickToSqrtPrice } from "../tick";
import {
  calcZapInPositionMinima,
  calcZapInSwapAmount,
  estimateSqrtPriceAfterSwapIn,
} from "../zap-in";

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

    // A dust input on a genuinely two-sided range truncates the swap split to
    // zero. Callers must treat this as "too small", NOT as "one-sided range, no
    // swap needed" — otherwise they would submit a one-sided position for a
    // range that needs both tokens, which reverts on-chain. The range-side
    // classification (spot strictly inside [lower, upper]) is what distinguishes
    // the two; this asserts the truncation half of that contract.
    it("truncates to 0 for a dust input on a two-sided range", () => {
      const centered = geometricMeanSqrtPrice(lowerTick, upperTick);
      const swap = calcZapInSwapAmount({
        inputAmount: new Int(1), // 1 micro unit, smallest possible
        inputSide: "base",
        lowerTick,
        upperTick,
        currentSqrtPrice: centered,
      });
      // spot is strictly inside the range, so the position is two-sided, yet the
      // swap rounds to nothing.
      expect(centered.gt(new BigDec(tickToSqrtPrice(lowerTick)))).toBe(true);
      expect(centered.lt(new BigDec(tickToSqrtPrice(upperTick)))).toBe(true);
      expect(swap.toString()).toBe("0");
    });
  });
});

describe("estimateSqrtPriceAfterSwapIn", () => {
  const one = new BigDec(1);

  /** One wide range straddling sqrt price 1 with the given liquidity. */
  const singleRange = (liquidity: string) => [
    {
      lowerTick: new Int(-5000000),
      upperTick: new Int(5000000),
      liquidityAmount: new Dec(liquidity),
    },
  ];

  it("returns the current price for zero input or no depths", () => {
    expect(
      estimateSqrtPriceAfterSwapIn({
        tokenInAmount: new Int(0),
        inputSide: "base",
        currentSqrtPrice: one,
        liquidityDepths: singleRange("1000000000000"),
      }).equals(one)
    ).toBe(true);
    expect(
      estimateSqrtPriceAfterSwapIn({
        tokenInAmount: new Int(1000),
        inputSide: "base",
        currentSqrtPrice: one,
        liquidityDepths: [],
      }).equals(one)
    ).toBe(true);
  });

  it("moves the price up within one range for token1 in (Pt = Pc + in/L)", () => {
    const result = estimateSqrtPriceAfterSwapIn({
      tokenInAmount: new Int("1000000000"), // 1e9
      inputSide: "quote",
      currentSqrtPrice: one,
      liquidityDepths: singleRange("1000000000000"), // 1e12
    });
    expect(result.equals(new BigDec("1.001"))).toBe(true);
  });

  it("moves the price down within one range for token0 in (Pt = L*Pc/(L + in*Pc))", () => {
    const liquidity = new BigDec("1000000000000"); // 1e12
    const input = new BigDec("1000000000"); // 1e9
    const result = estimateSqrtPriceAfterSwapIn({
      tokenInAmount: new Int("1000000000"),
      inputSide: "base",
      currentSqrtPrice: one,
      liquidityDepths: singleRange("1000000000000"),
    });
    const expected = liquidity.mul(one).quo(liquidity.add(input.mul(one)));
    expect(result.equals(expected)).toBe(true);
    expect(result.lt(one)).toBe(true);
  });

  it("crosses a range boundary and continues in the next range's liquidity", () => {
    const boundaryTick = new Int(1000);
    const boundary = new BigDec(tickToSqrtPrice(boundaryTick));
    const liquidityA = new BigDec("1000000000000"); // 1e12
    const liquidityB = new BigDec("2000000000000"); // 2e12
    const depths = [
      {
        lowerTick: new Int(-1000),
        upperTick: boundaryTick,
        liquidityAmount: new Dec("1000000000000"),
      },
      {
        lowerTick: boundaryTick,
        upperTick: new Int(100000),
        liquidityAmount: new Dec("2000000000000"),
      },
    ];
    // capacity of range A upward from 1: L_A * (boundary - 1)
    const capacityA = liquidityA.mul(boundary.sub(one));
    const surplus = new BigDec("100000000"); // 1e8 continues into range B
    const input = capacityA.add(surplus).truncate();

    const result = estimateSqrtPriceAfterSwapIn({
      tokenInAmount: input,
      inputSide: "quote",
      currentSqrtPrice: one,
      liquidityDepths: depths,
    });

    // Continues from the boundary with range B's liquidity. The input was
    // truncated to an integer, so allow that much slack in the comparison.
    const expected = boundary.add(
      new BigDec(input).sub(capacityA).quo(liquidityB)
    );
    expect(result.sub(expected).abs().lte(new BigDec("0.000000001"))).toBe(
      true
    );
    expect(result.gt(boundary)).toBe(true);
  });

  it("crosses a zero-liquidity gap without consuming input", () => {
    const gapStart = new Int(1000);
    const gapEnd = new Int(2000);
    const depths = [
      {
        lowerTick: new Int(-1000),
        upperTick: gapStart,
        liquidityAmount: new Dec("1000000000000"),
      },
      {
        lowerTick: gapStart,
        upperTick: gapEnd,
        liquidityAmount: new Dec(0),
      },
      {
        lowerTick: gapEnd,
        upperTick: new Int(100000),
        liquidityAmount: new Dec("1000000000000"),
      },
    ];
    const liquidity = new BigDec("1000000000000");
    const gapStartSqrt = new BigDec(tickToSqrtPrice(gapStart));
    const gapEndSqrt = new BigDec(tickToSqrtPrice(gapEnd));
    const capacityA = liquidity.mul(gapStartSqrt.sub(one));
    const surplus = new BigDec("100000000"); // lands past the gap
    const input = capacityA.add(surplus).truncate();

    const result = estimateSqrtPriceAfterSwapIn({
      tokenInAmount: input,
      inputSide: "quote",
      currentSqrtPrice: one,
      liquidityDepths: depths,
    });

    // The gap is crossed for free: the surplus continues from the gap's END.
    expect(result.gte(gapEndSqrt)).toBe(true);
    const expected = gapEndSqrt.add(
      new BigDec(input).sub(capacityA).quo(liquidity)
    );
    expect(result.sub(expected).abs().lte(new BigDec("0.000000001"))).toBe(
      true
    );
  });

  it("clamps to the furthest boundary when depths are exhausted", () => {
    const depths = singleRange("1000000"); // thin: 1e6
    const lowest = new BigDec(tickToSqrtPrice(new Int(-5000000)));
    const result = estimateSqrtPriceAfterSwapIn({
      tokenInAmount: new Int("1000000000000000000"), // absurdly large
      inputSide: "base",
      currentSqrtPrice: one,
      liquidityDepths: depths,
    });
    expect(result.equals(lowest)).toBe(true);
  });
});

describe("calcZapInPositionMinima", () => {
  // Price bounds 0.5 and 2 with spot at price 1: the sqrt-price bounds are
  // reciprocal (sqrt(0.5) * sqrt(2) = 1), so at sqrt = 1 the position's
  // required ratio is EXACTLY 1:1 in micro amounts (a0 = 1 - 1/sqrt(2) =
  // 1 - sqrt(0.5) = a1), which the worked examples below rely on.
  const lowerTick = new Int(-5000000); // price 0.5
  const upperTick = new Int(1000000); // price 2
  const spot = new BigDec(1);

  it("buffers below the ratio-fit consumption, not the caps (quoted-spread case)", () => {
    // The review's worked example: 500,000 unswapped remainder, 499,000
    // quoted out, 0.1% slippage => swapped-side cap (floor) 498,501. A 1:1
    // position consumes 498,501 from EACH side; the old remainder-derived
    // minimum (500,000 x 0.999^2 = 499,001) exceeded that and reverted.
    const minima = calcZapInPositionMinima({
      cap0: new Int(500000),
      cap1: new Int(498501),
      lowerTick,
      upperTick,
      currentSqrtPrice: spot,
      slippage: new Dec("0.001"),
    });
    // Both minima admit the actual ~498,501-per-side consumption.
    expect(minima.tokenMinAmount0.lte(new Int(498501))).toBe(true);
    expect(minima.tokenMinAmount1.lte(new Int(498501))).toBe(true);
    // And keep one slippage-width of buffer, no more.
    expectWithin(minima.tokenMinAmount0, new Int(498002), new Int(10));
    expectWithin(minima.tokenMinAmount1, new Int(498002), new Int(10));
  });

  it("zeroes the dead side for a one-sided range", () => {
    const belowRange = new BigDec(tickToSqrtPrice(new Int(-6000000))); // price 0.4
    const minima = calcZapInPositionMinima({
      cap0: new Int(1000000),
      cap1: new Int(0),
      lowerTick,
      upperTick,
      currentSqrtPrice: belowRange,
      slippage: new Dec("0.005"),
    });
    expect(minima.tokenMinAmount1.toString()).toBe("0");
    expectWithin(minima.tokenMinAmount0, new Int(995000), new Int(1));
  });

  // Regression for a DIRECT route through the destination pool: the swap leg
  // itself moves the pool's sqrt price before MsgCreatePosition executes, so
  // the ratio the chain fits the caps to is the POST-swap ratio. Minima fitted
  // at spot alone overstate the shrinking side and revert; the envelope
  // admits the consumption at every price between spot and the estimate.
  it("envelopes minima across the destination pool's own price movement", () => {
    const liquidityDepths = [
      {
        lowerTick: new Int(-5000000),
        upperTick: new Int(5000000),
        liquidityAmount: new Dec("100000000000"), // 1e11: thin enough to move
      },
    ];
    // Base-in swap of 1e9 through the destination pool itself (~1% of depth).
    const swapIn = new Int("1000000000");
    const postSwapSqrtPrice = estimateSqrtPriceAfterSwapIn({
      tokenInAmount: swapIn,
      inputSide: "base",
      currentSqrtPrice: spot,
      liquidityDepths,
    });
    expect(postSwapSqrtPrice.lt(spot)).toBe(true);

    const cap0 = new Int(500000);
    const cap1 = new Int(498501);
    const slippage = new Dec("0.001");

    // Independent consumption at the post-swap price: ratio from the deltas,
    // fitted to the caps (what the chain will actually pull).
    const lowerSqrt = new BigDec(tickToSqrtPrice(lowerTick));
    const upperSqrt = new BigDec(tickToSqrtPrice(upperTick));
    const a0 = calcAmount0Delta(
      new BigDec(1),
      postSwapSqrtPrice,
      upperSqrt,
      false
    );
    const a1 = calcAmount1Delta(
      new BigDec(1),
      lowerSqrt,
      postSwapSqrtPrice,
      false
    );
    const lambda0 = new BigDec(cap0).quo(a0);
    const lambda1 = new BigDec(cap1).quo(a1);
    const lambda = lambda0.lt(lambda1) ? lambda0 : lambda1;
    const actualUsed0 = lambda.mul(a0).truncate();
    const actualUsed1 = lambda.mul(a1).truncate();

    const spotOnly = calcZapInPositionMinima({
      cap0,
      cap1,
      lowerTick,
      upperTick,
      currentSqrtPrice: spot,
      slippage,
    });
    const enveloped = calcZapInPositionMinima({
      cap0,
      cap1,
      lowerTick,
      upperTick,
      currentSqrtPrice: spot,
      postSwapSqrtPrice,
      slippage,
    });

    // Price moved down (base in) => the position needs relatively less
    // token1. Spot-only minima demand more token1 than the chain consumes:
    // guaranteed revert. The enveloped minima admit the actual consumption
    // on BOTH sides.
    expect(spotOnly.tokenMinAmount1.gt(actualUsed1)).toBe(true);
    expect(enveloped.tokenMinAmount0.lte(actualUsed0)).toBe(true);
    expect(enveloped.tokenMinAmount1.lte(actualUsed1)).toBe(true);
    // The envelope only relaxes the side the movement shrinks; the other
    // side keeps its spot-fitted floor.
    expect(enveloped.tokenMinAmount0.equals(spotOnly.tokenMinAmount0)).toBe(
      true
    );
    expect(enveloped.tokenMinAmount1.lt(spotOnly.tokenMinAmount1)).toBe(true);
  });
});
