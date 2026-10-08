import { Dec, RatePretty } from "@osmosis-labs/unit";

import { DefaultSlippage } from "~/config/swap";

import {
  computeAutoSlippage,
  resolveSwapSlippage,
  slippageRequiredByFeeError,
} from "../slippage";

/** SQS reports adverse impact as a negative value; pass the signed number. */
const quote = (
  signedImpact: string,
  liquidityCap?: string,
  overflow = false
) => ({
  priceImpactTokenOut: new RatePretty(new Dec(signedImpact)),
  liquidityCap,
  liquidityCapOverflow: overflow,
});

const DEEP = "10000000";

describe("computeAutoSlippage", () => {
  it("returns the default without a quote", () => {
    expect(computeAutoSlippage(undefined)).toEqual({
      slippage: DefaultSlippage,
      liquidityUnknown: false,
    });
  });

  it("returns the default for a small trade on a deep route", () => {
    expect(computeAutoSlippage(quote("-0.001", DEEP))).toEqual({
      slippage: DefaultSlippage,
      liquidityUnknown: false,
    });
  });

  it.each([
    ["-0.003", "0.2"],
    ["-0.0059", "0.2"],
    ["-0.006", "0.3"],
    ["-0.01", "0.5"],
    ["-0.03", "1"],
    ["-0.05", "2"],
    ["-0.1", "3"],
    ["-0.2", "5"],
    ["-0.9", "5"],
  ])("picks the tier for %s impact on a deep route", (impact, tier) => {
    expect(computeAutoSlippage(quote(impact, DEEP)).slippage).toBe(tier);
  });

  it.each([
    ["50000", "0.2"],
    ["50001", DefaultSlippage],
    ["25000", "0.3"],
    ["10000", "0.5"],
    ["3000", "1"],
    ["1000", "2"],
    ["300", "3"],
    ["100", "5"],
    ["1", "5"],
  ])(
    "picks the tier for $%s of route liquidity with no impact",
    (cap, tier) => {
      expect(computeAutoSlippage(quote("0", cap)).slippage).toBe(tier);
    }
  );

  it("takes whichever signal selects the wider tier", () => {
    // 0.3% impact alone gives 0.2%; $900 of liquidity gives 2%.
    expect(computeAutoSlippage(quote("-0.003", "900")).slippage).toBe("2");
    // $40k of liquidity alone gives 0.2%; 6% impact gives 2%.
    expect(computeAutoSlippage(quote("-0.06", "40000")).slippage).toBe("2");
  });

  it("clamps favourable (positive) impact to zero", () => {
    expect(computeAutoSlippage(quote("0.5", DEEP)).slippage).toBe(
      DefaultSlippage
    );
  });

  describe("unknown route liquidity", () => {
    it.each([
      ["zero, as SQS reports for an unpriced route", "0"],
      ["empty", ""],
      ["missing", undefined],
      ["unparseable", "not-a-number"],
      ["negative", "-5"],
    ])("treats a %s cap as unknown, not as thin", (_label, cap) => {
      // Before, a "0" cap selected the widest 5% tier on any route.
      expect(computeAutoSlippage(quote("-0.001", cap))).toEqual({
        slippage: DefaultSlippage,
        liquidityUnknown: true,
      });
    });

    it("still applies price impact", () => {
      expect(computeAutoSlippage(quote("-0.05", "0"))).toEqual({
        slippage: "2",
        liquidityUnknown: true,
      });
    });
  });

  it("treats an overflowed cap as deep", () => {
    expect(computeAutoSlippage(quote("-0.001", "0", true))).toEqual({
      slippage: DefaultSlippage,
      liquidityUnknown: false,
    });
  });

  it("treats a missing impact as zero", () => {
    expect(computeAutoSlippage({ liquidityCap: DEEP }).slippage).toBe(
      DefaultSlippage
    );
  });
});

describe("slippageRequiredByFeeError", () => {
  // Requires 1.008x the pre-slippage input; the current 0.1% tolerance allows 1.001x.
  const message =
    "Fetch error. failed to execute message; message index: 0: Swap requires 1008000uosmo, which is greater than the amount 1001000uosmo: token amount calculated is greater than max amount";

  it("snaps the required tolerance up to the next tier", () => {
    expect(
      slippageRequiredByFeeError({
        errorMessage: message,
        quoteType: "in-given-out",
        currentSlippage: new Dec("0.001"),
      })
    ).toBe("1");
  });

  it("only applies to exact-out", () => {
    expect(
      slippageRequiredByFeeError({
        errorMessage: message,
        quoteType: "out-given-in",
        currentSlippage: new Dec("0.001"),
      })
    ).toBeUndefined();
  });

  it("ignores unrelated errors", () => {
    expect(
      slippageRequiredByFeeError({
        errorMessage: "insufficient funds",
        quoteType: "in-given-out",
        currentSlippage: new Dec("0.001"),
      })
    ).toBeUndefined();
  });

  it("suggests nothing once the tolerance is already 5% or more", () => {
    expect(
      slippageRequiredByFeeError({
        errorMessage: message,
        quoteType: "in-given-out",
        currentSlippage: new Dec("0.05"),
      })
    ).toBeUndefined();
  });

  it("caps at the widest tier", () => {
    expect(
      slippageRequiredByFeeError({
        errorMessage:
          "Fetch error. failed to execute message; message index: 0: Swap requires 2000000uosmo, which is greater than the amount 1001000uosmo",
        quoteType: "in-given-out",
        currentSlippage: new Dec("0.001"),
      })
    ).toBe("5");
  });
});

describe("resolveSwapSlippage", () => {
  const base = {
    userSlippage: undefined,
    feeErrorSlippage: undefined,
    autoSlippage: "2",
    quoteType: "out-given-in" as const,
  };

  it("prefers a typed value over everything", () => {
    expect(
      resolveSwapSlippage({ ...base, userSlippage: "7", feeErrorSlippage: "3" })
    ).toEqual({ slippage: "7", source: "user" });
  });

  it("prefers a fee-error tier over the auto tier", () => {
    expect(resolveSwapSlippage({ ...base, feeErrorSlippage: "3" })).toEqual({
      slippage: "3",
      source: "fee-error",
    });
  });

  it("uses the auto tier for exact-in", () => {
    expect(resolveSwapSlippage(base)).toEqual({
      slippage: "2",
      source: "auto",
    });
  });

  it("reports the default when the auto tier is the default", () => {
    expect(
      resolveSwapSlippage({ ...base, autoSlippage: DefaultSlippage })
    ).toEqual({ slippage: DefaultSlippage, source: "default" });
  });

  it("ignores the auto tier for exact-out", () => {
    expect(resolveSwapSlippage({ ...base, quoteType: "in-given-out" })).toEqual(
      { slippage: DefaultSlippage, source: "default" }
    );
  });
});
