import { Dec } from "@osmosis-labs/unit";

import {
  formatSlippagePercent,
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
  const bound = (
    quoteAmount: string,
    slippage: string,
    coinDecimals: number,
    quoteType: "out-given-in" | "in-given-out" = "out-given-in"
  ) =>
    slippageBoundTruncatesToZero({
      quoteAmount: new Dec(quoteAmount),
      slippage: new Dec(slippage),
      coinDecimals,
      quoteType,
    });

  it("is true when the minimum output is below one base unit", () => {
    // 0.00000001 BTC (one satoshi) less 10% is under one satoshi.
    expect(bound("0.00000001", "0.1", 8)).toBe(true);
  });

  it("is false while the minimum output keeps a base unit", () => {
    expect(bound("0.00000002", "0.1", 8)).toBe(false);
  });

  it("uses the asset's own decimals", () => {
    expect(bound("0.0000005", "0.01", 6)).toBe(true);
    expect(bound("0.0000005", "0.01", 18)).toBe(false);
  });

  // Scaling first, as the transaction does: one base unit times 0.6 truncates
  // to zero. Applying the slippage to the display amount first rounds it back
  // up to one unit at 18 decimals and would have passed.
  it("matches the transaction's order for an 18-decimal asset", () => {
    expect(bound("0.000000000000000001", "0.4", 18)).toBe(true);
  });

  it("applies exact-out slippage as a maximum input", () => {
    expect(bound("0.00000001", "0.1", 8, "in-given-out")).toBe(false);
  });
});

describe("requiresValueDisparityAcknowledgement", () => {
  const base = {
    quoteType: "out-given-in" as const,
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
        inputUsd: 100,
        minimumOutputUsd: 0,
      })
    ).toBe(false);
  });

  it("requires acknowledgement for exact-out when the output is worth far less", () => {
    expect(
      requiresValueDisparityAcknowledgement({
        quoteType: "in-given-out",
        inputUsd: 100,
        minimumOutputUsd: 50,
      })
    ).toBe(true);
  });
});
