import { Dec } from "@osmosis-labs/unit";

import {
  formatSlippagePercent,
  hasQuoteDriftedBeyondSlippage,
  parseSlippageInput,
  requiresValueDisparityAcknowledgement,
  slippageBoundTruncatesToZero,
} from "../swap-review";

describe("formatSlippagePercent", () => {
  it.each([
    ["0.005", "0.5"],
    ["0.01", "1"],
    ["0.001", "0.1"],
    ["0.0125", "1.25"],
    ["0.1", "10"],
    ["0", "0"],
  ])("formats %s as %s", (fraction, expected) => {
    expect(formatSlippagePercent(new Dec(fraction))).toBe(expected);
  });
});

describe("parseSlippageInput", () => {
  it.each([
    ["0.5", "0.5", "0.5"],
    ["1", "1", "1"],
    ["25", "25", "25"],
    ["05", "5", "5"],
    ["99.9", "99.9", "99.9"],
  ])("accepts and commits %s", (raw, display, commit) => {
    expect(parseSlippageInput(raw)).toEqual({ display, commit });
  });

  it.each([
    ["", ""],
    [".", "0."],
    ["0", "0"],
    ["0.", "0."],
    ["0.0", "0.0"],
    ["1.", "1."],
  ])(
    "displays %s without committing it, so typing never submits 0%%",
    (raw, display) => {
      expect(parseSlippageInput(raw)).toEqual({ display, commit: undefined });
    }
  );

  it.each(["0.05", "1.25", "abc", "1..2", "-1", "1e2", " 1"])(
    "rejects %s",
    (raw) => {
      expect(parseSlippageInput(raw)).toBeUndefined();
    }
  );

  it.each(["100", "150", "999"])("clamps %s to 99.9", (raw) => {
    expect(parseSlippageInput(raw)).toEqual({
      display: "99.9",
      commit: "99.9",
    });
  });
});

describe("slippageBoundTruncatesToZero", () => {
  it("is true when the bound is below one base unit", () => {
    // 0.000000009 BTC is under one satoshi at 8 decimals.
    expect(slippageBoundTruncatesToZero(new Dec("0.000000009"), 8)).toBe(true);
  });

  it("is false at exactly one base unit", () => {
    expect(slippageBoundTruncatesToZero(new Dec("0.00000001"), 8)).toBe(false);
  });

  it("uses the asset's own decimals", () => {
    const amount = new Dec("0.0000005");
    expect(slippageBoundTruncatesToZero(amount, 6)).toBe(true);
    expect(slippageBoundTruncatesToZero(amount, 18)).toBe(false);
  });

  it("is true for zero", () => {
    expect(slippageBoundTruncatesToZero(new Dec(0), 6)).toBe(true);
  });
});

describe("requiresValueDisparityAcknowledgement", () => {
  const base = {
    quoteType: "out-given-in" as const,
    minimumOutputTokenIsZero: false,
  };

  it("requires acknowledgement below 75% of the input value", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 100,
        minimumOutputUsd: 74.99,
      })
    ).toBe(true);
  });

  it("does not require it at exactly 75%", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 100,
        minimumOutputUsd: 75,
      })
    ).toBe(false);
  });

  it("gates a zero minimum output even without fiat prices", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: undefined,
        minimumOutputUsd: undefined,
        minimumOutputTokenIsZero: true,
      })
    ).toBe(true);
  });

  it("skips the value comparison when either side is unpriced", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 100,
        minimumOutputUsd: undefined,
      })
    ).toBe(false);
  });

  it("exempts trades of $1 or less", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        ...base,
        inputUsd: 1,
        minimumOutputUsd: 0.1,
      })
    ).toBe(false);
  });

  it("ignores a $0 exact-out output, which only means its price is loading", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        quoteType: "in-given-out",
        minimumOutputTokenIsZero: false,
        inputUsd: 100,
        minimumOutputUsd: 0,
      })
    ).toBe(false);
  });

  it("requires acknowledgement for exact-out when the output is worth far less", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        quoteType: "in-given-out",
        minimumOutputTokenIsZero: false,
        inputUsd: 100,
        minimumOutputUsd: 50,
      })
    ).toBe(true);
  });
});

describe("hasQuoteDriftedBeyondSlippage", () => {
  const onePercent = new Dec("0.01");

  it("flags an exact-in minimum output that shrank by the tolerance", () => {
    expect(
      hasQuoteDriftedBeyondSlippage({
        baseline: new Dec(1000),
        current: new Dec(990),
        slippage: onePercent,
        quoteType: "out-given-in",
      })
    ).toBe(true);
  });

  it("ignores drift smaller than the tolerance, scaled to trade size", () => {
    expect(
      hasQuoteDriftedBeyondSlippage({
        baseline: new Dec(1000),
        current: new Dec(991),
        slippage: onePercent,
        quoteType: "out-given-in",
      })
    ).toBe(false);
  });

  it("ignores favourable drift", () => {
    expect(
      hasQuoteDriftedBeyondSlippage({
        baseline: new Dec(1000),
        current: new Dec(2000),
        slippage: onePercent,
        quoteType: "out-given-in",
      })
    ).toBe(false);
  });

  it("flags an exact-out maximum input that grew by the tolerance", () => {
    expect(
      hasQuoteDriftedBeyondSlippage({
        baseline: new Dec(1000),
        current: new Dec(1010),
        slippage: onePercent,
        quoteType: "in-given-out",
      })
    ).toBe(true);
    expect(
      hasQuoteDriftedBeyondSlippage({
        baseline: new Dec(1000),
        current: new Dec(990),
        slippage: onePercent,
        quoteType: "in-given-out",
      })
    ).toBe(false);
  });

  it("never fires on a zero tolerance, which Accept could not clear", () => {
    expect(
      hasQuoteDriftedBeyondSlippage({
        baseline: new Dec(1000),
        current: new Dec(1000),
        slippage: new Dec(0),
        quoteType: "out-given-in",
      })
    ).toBe(false);
  });

  it("never fires on a zero baseline", () => {
    expect(
      hasQuoteDriftedBeyondSlippage({
        baseline: new Dec(0),
        current: new Dec(0),
        slippage: onePercent,
        quoteType: "out-given-in",
      })
    ).toBe(false);
  });
});
