import { Int } from "@osmosis-labs/unit";

import { BigDec } from "../../../big-dec";
import { calcZapOutSwapAmount } from "../zap-out";

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
