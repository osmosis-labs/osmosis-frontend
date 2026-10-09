import { Dec, Int } from "@osmosis-labs/unit";

import { BigDec } from "../../../big-dec";
import { simulateSwapOverDepths } from "../zap-in";
import {
  calcZapOutRouteDegradation,
  calcZapOutSwapAmount,
  combineImpactWithDegradation,
  subtractLiquidityFromDepths,
} from "../zap-out";

/** Spot price P = sqrtPrice^2 (token1 per token0, micro basis). Build a
 *  sqrtPrice from a desired spot for readable fixtures. */
function sqrtPriceFromSpot(spot: number): BigDec {
  return new BigDec(Math.sqrt(spot).toString());
}

/** Fraction of the withdrawn value that currently sits in base (token0), at the
 *  given spot. Used to assert the no-swap point. */
function currentBaseValueFraction(
  baseWithdrawn: Int,
  quoteWithdrawn: Int,
  sqrtPrice: BigDec
): BigDec {
  const spot = sqrtPrice.mul(sqrtPrice);
  const baseValue = new BigDec(baseWithdrawn).mul(spot);
  const total = baseValue.add(new BigDec(quoteWithdrawn));
  return baseValue.quo(total);
}

describe("calcZapOutSwapAmount", () => {
  // Spot price of 1: a position withdrawn evenly (1000 base + 1000 quote) is
  // already a 50/50 value split.
  const sqrtPriceAt1 = sqrtPriceFromSpot(1);
  const base = new Int("1000000000"); // 1,000 of a 6-decimal token
  const quote = new Int("1000000000");

  describe("no swap at the withdrawn ratio", () => {
    it("returns 0 when the target equals the current value-split", () => {
      const target = currentBaseValueFraction(base, quote, sqrtPriceAt1);
      const { swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: base,
        quoteWithdrawn: quote,
        currentSqrtPrice: sqrtPriceAt1,
        targetBaseValueFraction: target,
      });
      expect(swapInAmount.toString()).toBe("0");
    });

    it("returns 0 for a one-sided withdrawal when target matches (all base)", () => {
      // Position fully in base: withdrawn ratio is 100% base, target 100% base.
      const { swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: base,
        quoteWithdrawn: new Int(0),
        currentSqrtPrice: sqrtPriceAt1,
        targetBaseValueFraction: new BigDec(1),
      });
      expect(swapInAmount.toString()).toBe("0");
    });
  });

  describe("target shifts toward base (sell quote)", () => {
    it("swaps all quote into base for target = 100% base", () => {
      const { swapSide, swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: base,
        quoteWithdrawn: quote,
        currentSqrtPrice: sqrtPriceAt1,
        targetBaseValueFraction: new BigDec(1),
      });
      expect(swapSide).toBe("quote");
      expect(swapInAmount.toString()).toBe(quote.toString());
    });

    it("swaps ~half the quote for target = 75% base (from 50/50)", () => {
      // At 50/50, target 75% base means moving 25% of total value from quote to
      // base: 0.25 * 2000 = 500 quote.
      const { swapSide, swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: base,
        quoteWithdrawn: quote,
        currentSqrtPrice: sqrtPriceAt1,
        targetBaseValueFraction: new BigDec(0.75),
      });
      expect(swapSide).toBe("quote");
      expect(swapInAmount.toString()).toBe("500000000");
    });
  });

  describe("target shifts toward quote (sell base)", () => {
    it("swaps all base into quote for target = 0% base", () => {
      const { swapSide, swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: base,
        quoteWithdrawn: quote,
        currentSqrtPrice: sqrtPriceAt1,
        targetBaseValueFraction: new BigDec(0),
      });
      expect(swapSide).toBe("base");
      expect(swapInAmount.toString()).toBe(base.toString());
    });

    it("swaps ~half the base for target = 25% base (from 50/50)", () => {
      const { swapSide, swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: base,
        quoteWithdrawn: quote,
        currentSqrtPrice: sqrtPriceAt1,
        targetBaseValueFraction: new BigDec(0.25),
      });
      expect(swapSide).toBe("base");
      // 0.25 * 2000 = 500 value of base to convert; at spot 1, 500 base.
      expect(swapInAmount.toString()).toBe("500000000");
    });
  });

  describe("non-unit spot price", () => {
    // Spot = 4 (token1 per token0). 100 base is worth 400 quote.
    const sqrtPriceAt4 = sqrtPriceFromSpot(4);
    const base4 = new Int("100000000"); // 100 base
    const quote4 = new Int("400000000"); // 400 quote, so already 50/50 by value

    it("recognizes the 50/50 value split at spot 4 as no-swap", () => {
      const { swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: base4,
        quoteWithdrawn: quote4,
        currentSqrtPrice: sqrtPriceAt4,
        targetBaseValueFraction: new BigDec(0.5),
      });
      expect(swapInAmount.toString()).toBe("0");
    });

    it("sells base priced at spot 4 when shifting toward quote", () => {
      // target 0% base: sell all base. 100 base.
      const { swapSide, swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: base4,
        quoteWithdrawn: quote4,
        currentSqrtPrice: sqrtPriceAt4,
        targetBaseValueFraction: new BigDec(0),
      });
      expect(swapSide).toBe("base");
      expect(swapInAmount.toString()).toBe(base4.toString());
    });
  });

  describe("18-decimal pool", () => {
    const base18 = new Int("1000000000000000000000"); // 1,000 of an 18-dec token
    const quote18 = new Int("1000000000000000000000");

    it("produces a sensible partial swap at spot 1", () => {
      const { swapSide, swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: base18,
        quoteWithdrawn: quote18,
        currentSqrtPrice: sqrtPriceAt1,
        targetBaseValueFraction: new BigDec(0.75),
      });
      expect(swapSide).toBe("quote");
      // 25% of 2000e18 total = 500e18 quote.
      expect(swapInAmount.toString()).toBe("500000000000000000000");
    });
  });

  describe("degenerate inputs (early return, no NaN/divide-by-zero)", () => {
    it("returns 0 when the pool has no spot price (zero sqrt price)", () => {
      const { swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: base,
        quoteWithdrawn: quote,
        currentSqrtPrice: new BigDec(0),
        targetBaseValueFraction: new BigDec(0.5),
      });
      expect(swapInAmount.toString()).toBe("0");
    });

    it("returns 0 when nothing was withdrawn", () => {
      const { swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: new Int(0),
        quoteWithdrawn: new Int(0),
        currentSqrtPrice: sqrtPriceAt1,
        targetBaseValueFraction: new BigDec(1),
      });
      expect(swapInAmount.toString()).toBe("0");
    });

    it("never swaps more than the withdrawn amount of the sold side", () => {
      // Lopsided withdrawal: 10 base, 1000 quote. Target 100% base sells all
      // quote, which is at most quoteWithdrawn.
      const { swapSide, swapInAmount } = calcZapOutSwapAmount({
        baseWithdrawn: new Int("10000000"),
        quoteWithdrawn: new Int("1000000000"),
        currentSqrtPrice: sqrtPriceAt1,
        targetBaseValueFraction: new BigDec(1),
      });
      expect(swapSide).toBe("quote");
      expect(swapInAmount.lte(new Int("1000000000"))).toBe(true);
    });
  });
});

describe("subtractLiquidityFromDepths", () => {
  const depth = (lower: number, upper: number, liq: string) => ({
    lowerTick: new Int(lower),
    upperTick: new Int(upper),
    liquidityAmount: new Dec(liq),
  });

  it("subtracts over fully covered ranges and clamps at zero", () => {
    const result = subtractLiquidityFromDepths({
      liquidityDepths: [
        depth(-1000, 0, "500"),
        depth(0, 1000, "2000"),
        depth(1000, 2000, "3000"),
      ],
      lowerTick: new Int(-1000),
      upperTick: new Int(1000),
      liquidity: new Dec("1000"),
    });
    expect(
      result.map((d) => [
        d.lowerTick.toString(),
        d.upperTick.toString(),
        d.liquidityAmount.toString(),
      ])
    ).toEqual([
      ["-1000", "0", new Dec(0).toString()], // 500 - 1000 clamps to 0
      ["0", "1000", new Dec(1000).toString()],
      ["1000", "2000", new Dec(3000).toString()], // outside the span, untouched
    ]);
  });

  it("splits a range partially covered by the position span", () => {
    const result = subtractLiquidityFromDepths({
      liquidityDepths: [depth(-2000, 2000, "1000")],
      lowerTick: new Int(-500),
      upperTick: new Int(500),
      liquidity: new Dec("400"),
    });
    expect(
      result.map((d) => [
        d.lowerTick.toString(),
        d.upperTick.toString(),
        d.liquidityAmount.toString(),
      ])
    ).toEqual([
      ["-2000", "-500", new Dec(1000).toString()],
      ["-500", "500", new Dec(600).toString()],
      ["500", "2000", new Dec(1000).toString()],
    ]);
  });
});

describe("calcZapOutRouteDegradation", () => {
  // Wide range around sqrt price 1; the position holds half the liquidity.
  const positionLowerTick = new Int(-5000000);
  const positionUpperTick = new Int(5000000);
  const liquidityDepths = [
    {
      lowerTick: positionLowerTick,
      upperTick: positionUpperTick,
      liquidityAmount: new Dec("200000000000"), // 2e11 total
    },
  ];
  const withdrawnLiquidity = new Dec("100000000000"); // 1e11: half the book
  const one = new BigDec(1);

  it("returns 1 when nothing routes through the pool or depths are missing", () => {
    expect(
      calcZapOutRouteDegradation({
        swapInAmount: new Int(0),
        swapSide: "base",
        currentSqrtPrice: one,
        liquidityDepths,
        withdrawnLiquidity,
        positionLowerTick,
        positionUpperTick,
      }).toString()
    ).toBe(new Dec(1).toString());
    expect(
      calcZapOutRouteDegradation({
        swapInAmount: new Int("1000000"),
        swapSide: "base",
        currentSqrtPrice: one,
        liquidityDepths: [],
        withdrawnLiquidity,
        positionLowerTick,
        positionUpperTick,
      }).toString()
    ).toBe(new Dec(1).toString());
  });

  // Regression for the withdraw-before-swap ordering: the withdraw removes the
  // position's liquidity before the swap executes, so a min-out derived from
  // the full-depth quote exceeds what the post-withdraw book delivers and the
  // whole tx reverts. The degradation factor must bring the expected output
  // at or below the post-withdraw simulation.
  it("degrades the output for the thinner post-withdraw book", () => {
    const swapInAmount = new Int("1000000000"); // 1e9: ~1% of remaining depth
    const currentSqrtPrice = one;

    const factor = calcZapOutRouteDegradation({
      swapInAmount,
      swapSide: "base",
      currentSqrtPrice,
      liquidityDepths,
      withdrawnLiquidity,
      positionLowerTick,
      positionUpperTick,
    });
    expect(factor.lt(new Dec(1))).toBe(true);
    expect(factor.gt(new Dec(0))).toBe(true);

    // Independent check: the full-book output (what the quote promises)
    // exceeds the post-withdraw book's output (what the chain delivers), and
    // scaling the full output by the factor admits the actual delivery.
    const fullOut = simulateSwapOverDepths({
      tokenInAmount: swapInAmount,
      inputSide: "base",
      currentSqrtPrice,
      liquidityDepths,
    }).amountOut;
    const reducedOut = simulateSwapOverDepths({
      tokenInAmount: swapInAmount,
      inputSide: "base",
      currentSqrtPrice,
      liquidityDepths: subtractLiquidityFromDepths({
        liquidityDepths,
        lowerTick: positionLowerTick,
        upperTick: positionUpperTick,
        liquidity: withdrawnLiquidity,
      }),
    }).amountOut;
    expect(fullOut.gt(reducedOut)).toBe(true);
    const adjusted = new Dec(fullOut).mul(factor).truncate();
    expect(adjusted.lte(reducedOut)).toBe(true);
  });

  it("degrades to (near) zero when the withdraw empties the book", () => {
    const factor = calcZapOutRouteDegradation({
      swapInAmount: new Int("1000000000"),
      swapSide: "quote",
      currentSqrtPrice: one,
      liquidityDepths: [
        {
          lowerTick: positionLowerTick,
          upperTick: positionUpperTick,
          liquidityAmount: new Dec("100000000000"),
        },
      ],
      withdrawnLiquidity: new Dec("100000000000"), // the whole book
      positionLowerTick,
      positionUpperTick,
    });
    expect(factor.isZero()).toBe(true);
  });
});

describe("combineImpactWithDegradation", () => {
  it("returns the quoted impact unchanged when there is no degradation", () => {
    const combined = combineImpactWithDegradation({
      quotedImpact: new Dec("-0.01"),
      degradation: new Dec(1),
    });
    expect(combined.toString()).toBe(new Dec("-0.01").toString());
  });

  // Regression for the guard bypass: a direct own-pool route can quote a
  // TINY impact (computed against pre-withdraw depths) while the
  // withdraw-thinned book degrades the output past the high-cost threshold.
  // The combined figure must trip the -10% gate the quoted figure sails
  // under.
  it("trips the high-cost threshold when degradation dwarfs the quoted impact", () => {
    const threshold = new Dec("-0.1");
    const quotedImpact = new Dec("-0.01"); // 1%: sails under the gate alone
    expect(quotedImpact.lt(threshold)).toBe(false);

    // A position holding half the book, fully withdrawn, degrades a large
    // same-pool swap's output well past 10%.
    const positionLowerTick = new Int(-5000000);
    const positionUpperTick = new Int(5000000);
    const degradation = calcZapOutRouteDegradation({
      swapInAmount: new Int("20000000000"), // 2e10 vs 5e10 remaining depth
      swapSide: "base",
      currentSqrtPrice: new BigDec(1),
      liquidityDepths: [
        {
          lowerTick: positionLowerTick,
          upperTick: positionUpperTick,
          liquidityAmount: new Dec("100000000000"), // 1e11 total
        },
      ],
      withdrawnLiquidity: new Dec("50000000000"), // 5e10: half the book
      positionLowerTick,
      positionUpperTick,
    });
    expect(degradation.lt(new Dec("0.9"))).toBe(true);

    const combined = combineImpactWithDegradation({
      quotedImpact,
      degradation,
    });
    expect(combined.lt(threshold)).toBe(true);
    // Sanity on the formula shape: (1 + combined) = (1 + quoted) x factor.
    expect(
      new Dec(1)
        .add(combined)
        .sub(new Dec(1).add(quotedImpact).mul(degradation))
        .abs()
        .lte(new Dec("0.0000000001"))
    ).toBe(true);
  });
});
