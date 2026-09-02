import { Dec, RatePretty } from "@osmosis-labs/unit";

import { DefaultSlippage, DYNAMIC_SLIPPAGE_TIERS } from "~/config/swap";
import {
  computeSuggestedSlippage,
  requiresValueDisparityAcknowledgement,
  slippageBoundTruncatesToZero,
} from "~/utils/slippage";

/** Adverse price impact is negative in SQS quotes; pass the signed value. */
const impactQuote = (signedImpact: string) => ({
  priceImpactTokenOut: new RatePretty(new Dec(signedImpact)),
});

const liquidityQuote = (...caps: string[]) => ({
  tokens: caps.map((liquidity_cap) => ({ liquidity_cap })),
});

describe("DYNAMIC_SLIPPAGE_TIERS", () => {
  it("is ordered: slippage ascending, thresholds monotonic", () => {
    for (let i = 1; i < DYNAMIC_SLIPPAGE_TIERS.length; i++) {
      const prev = DYNAMIC_SLIPPAGE_TIERS[i - 1];
      const cur = DYNAMIC_SLIPPAGE_TIERS[i];
      expect(Number(cur.slippage)).toBeGreaterThan(Number(prev.slippage));
      expect(cur.minPriceImpact.gt(prev.minPriceImpact)).toBe(true);
      expect(cur.maxLiquidityCap.lt(prev.maxLiquidityCap)).toBe(true);
    }
  });
});

describe("computeSuggestedSlippage", () => {
  it("returns the default when there is no quote", () => {
    expect(computeSuggestedSlippage(undefined)).toBe(DefaultSlippage);
  });

  it("returns the default when the quote carries no impact or liquidity metadata", () => {
    expect(computeSuggestedSlippage({})).toBe(DefaultSlippage);
    expect(computeSuggestedSlippage({ tokens: [] })).toBe(DefaultSlippage);
  });

  // Boundaries are inclusive: impact >= minPriceImpact selects the tier.
  it.each([
    ["-0.002", DefaultSlippage],
    ["-0.003", "0.2"],
    ["-0.0059", "0.2"],
    ["-0.006", "0.3"],
    ["-0.0099", "0.3"],
    ["-0.01", "0.5"],
    ["-0.029", "0.5"],
    ["-0.03", "1.0"],
    ["-0.049", "1.0"],
    ["-0.05", "2.0"],
    ["-0.099", "2.0"],
    ["-0.1", "3.0"],
    ["-0.199", "3.0"],
    ["-0.2", "5.0"],
    ["-0.9", "5.0"],
  ])("price impact %s selects tier %s", (signedImpact, expected) => {
    expect(computeSuggestedSlippage(impactQuote(signedImpact))).toBe(expected);
  });

  it("clamps favorable (positive) price impact to the default", () => {
    expect(computeSuggestedSlippage(impactQuote("0.2"))).toBe(DefaultSlippage);
    expect(computeSuggestedSlippage(impactQuote("0"))).toBe(DefaultSlippage);
  });

  // Boundaries are inclusive: liquidity cap <= maxLiquidityCap selects the tier.
  it.each([
    ["50001", DefaultSlippage],
    ["50000", "0.2"],
    ["25001", "0.2"],
    ["25000", "0.3"],
    ["10001", "0.3"],
    ["10000", "0.5"],
    ["3001", "0.5"],
    ["3000", "1.0"],
    ["1001", "1.0"],
    ["1000", "2.0"],
    ["301", "2.0"],
    ["300", "3.0"],
    ["101", "3.0"],
    ["100", "5.0"],
    ["0", "5.0"],
  ])("route liquidity cap %s selects tier %s", (cap, expected) => {
    expect(computeSuggestedSlippage(liquidityQuote(cap))).toBe(expected);
  });

  it("uses the lowest liquidity cap across all route tokens", () => {
    expect(computeSuggestedSlippage(liquidityQuote("1000000", "250"))).toBe(
      "3.0"
    );
    expect(
      computeSuggestedSlippage(liquidityQuote("250", "1000000", "40000"))
    ).toBe("3.0");
  });

  it("selects the wider of the impact-derived and liquidity-derived tiers (OR semantics)", () => {
    // impact alone -> 0.2, liquidity alone -> 5.0: liquidity wins
    expect(
      computeSuggestedSlippage({
        ...impactQuote("-0.003"),
        ...liquidityQuote("100"),
      })
    ).toBe("5.0");
    // impact alone -> 5.0, liquidity alone -> no tier: impact wins
    expect(
      computeSuggestedSlippage({
        ...impactQuote("-0.2"),
        ...liquidityQuote("60000"),
      })
    ).toBe("5.0");
    // impact alone -> 1.0, liquidity alone -> 0.3: impact wins
    expect(
      computeSuggestedSlippage({
        ...impactQuote("-0.03"),
        ...liquidityQuote("20000"),
      })
    ).toBe("1.0");
  });

  it("handles one signal missing without touching the other", () => {
    // impact without token metadata
    expect(computeSuggestedSlippage(impactQuote("-0.05"))).toBe("2.0");
    // liquidity without impact metadata
    expect(computeSuggestedSlippage(liquidityQuote("500"))).toBe("2.0");
  });
});

describe("requiresValueDisparityAcknowledgement", () => {
  const exactIn = "out-given-in" as const;
  const exactOut = "in-given-out" as const;

  it("gates a zero minimum output regardless of fiat pricing (exact-in)", () => {
    // Unpriced input asset: no fiat values at all, min-out token amount zero.
    expect(
      requiresValueDisparityAcknowledgement({
        quoteType: exactIn,
        inputUsd: undefined,
        minimumOutputUsd: undefined,
        minimumOutputTokenIsZero: true,
      })
    ).toBe(true);
    // Priced trade whose min-out truncated to zero.
    expect(
      requiresValueDisparityAcknowledgement({
        quoteType: exactIn,
        inputUsd: 100,
        minimumOutputUsd: 0,
        minimumOutputTokenIsZero: true,
      })
    ).toBe(true);
  });

  it("does not gate unpriced trades with a nonzero minimum output", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        quoteType: exactIn,
        inputUsd: undefined,
        minimumOutputUsd: undefined,
        minimumOutputTokenIsZero: false,
      })
    ).toBe(false);
    expect(
      requiresValueDisparityAcknowledgement({
        quoteType: exactIn,
        inputUsd: 100,
        minimumOutputUsd: undefined,
        minimumOutputTokenIsZero: false,
      })
    ).toBe(false);
  });

  it("gates exact-in when the minimum output falls below 75% of input", () => {
    const base = { quoteType: exactIn, minimumOutputTokenIsZero: false };
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 100,
        minimumOutputUsd: 50,
      })
    ).toBe(true);
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 100,
        minimumOutputUsd: 74.99,
      })
    ).toBe(true);
    // Threshold is strict less-than.
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 100,
        minimumOutputUsd: 75,
      })
    ).toBe(false);
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 100,
        minimumOutputUsd: 80,
      })
    ).toBe(false);
  });

  it("exempts sub-$1 trades from the fiat comparison", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        quoteType: exactIn,
        inputUsd: 1,
        minimumOutputUsd: 0.1,
        minimumOutputTokenIsZero: false,
      })
    ).toBe(false);
  });

  it("treats exact-out's $0 output as loading, but gates real disparity", () => {
    const base = { quoteType: exactOut, minimumOutputTokenIsZero: false };
    // Fixed output shows $0 while its spot price loads: not a disparity.
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 100,
        minimumOutputUsd: 0,
      })
    ).toBe(false);
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 100,
        minimumOutputUsd: 50,
      })
    ).toBe(true);
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 100,
        minimumOutputUsd: 80,
      })
    ).toBe(false);
  });

  it("ignores the zero-token flag for exact-out (it describes max input there)", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        quoteType: exactOut,
        inputUsd: undefined,
        minimumOutputUsd: undefined,
        minimumOutputTokenIsZero: true,
      })
    ).toBe(false);
  });
});

describe("slippageBoundTruncatesToZero", () => {
  // Mirrors getSwapTxParameters: displayAmount * 10^decimals, truncated.
  it.each([
    // [display amount, decimals, expected]
    ["0", 6, true],
    // 0.1 minimal unit: nonzero display value, zero on chain
    ["0.0000001", 6, true],
    // 0.97 minimal units: the dust-truncation case from review
    ["0.00000097", 6, true],
    // exactly 1 minimal unit
    ["0.000001", 6, false],
    // 1.5 minimal units truncates to 1, still valid
    ["0.0000015", 6, false],
    ["999999", 6, false],
    // zero-decimal asset: sub-unit display amounts serialize to zero
    ["0.5", 0, true],
    ["1", 0, false],
    // 18-decimal asset at exactly 1 minimal unit
    ["0.000000000000000001", 18, false],
  ])(
    "display %s with %s decimals -> serializes to zero: %s",
    (displayAmount, decimals, expected) => {
      expect(
        slippageBoundTruncatesToZero(new Dec(displayAmount), Number(decimals))
      ).toBe(expected);
    }
  );
});
