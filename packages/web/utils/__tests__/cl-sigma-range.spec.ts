import { Dec } from "@osmosis-labs/unit";

import { calcSigmaRange, calcWindowStats } from "../cl-sigma-range";

const NOW = 1_750_000_000_000; // fixed ms epoch for determinism

/** Hourly bars over `days` days with the given closes cycle. */
function makeBars(
  days: number,
  closes: number[]
): { time: number; close: Dec }[] {
  const bars: { time: number; close: Dec }[] = [];
  const count = days * 24;
  for (let i = 0; i < count; i++) {
    bars.push({
      time: NOW - i * 3_600_000,
      close: new Dec(closes[i % closes.length].toString()),
    });
  }
  return bars;
}

describe("calcSigmaRange", () => {
  it("computes mean ± kσ over the window", () => {
    // Alternating 0.9 / 1.1: mean 1, population σ = 0.1.
    const bars = makeBars(7, [0.9, 1.1]);
    const range = calcSigmaRange({
      prices: bars,
      windowDays: 7,
      sigmas: 1,
      nowMs: NOW,
    });
    expect(range).toBeDefined();
    expect(Number(range![0].toString())).toBeCloseTo(0.9, 6);
    expect(Number(range![1].toString())).toBeCloseTo(1.1, 6);

    const twoSigma = calcSigmaRange({
      prices: bars,
      windowDays: 7,
      sigmas: 2,
      nowMs: NOW,
    });
    expect(Number(twoSigma![0].toString())).toBeCloseTo(0.8, 6);
    expect(Number(twoSigma![1].toString())).toBeCloseTo(1.2, 6);
  });

  it("treats 0σ as a tight band around the mean, not a zero-width range", () => {
    const bars = makeBars(7, [0.9, 1.1]);
    const range = calcSigmaRange({
      prices: bars,
      windowDays: 7,
      sigmas: 0,
      nowMs: NOW,
    });
    expect(range).toBeDefined();
    const [lower, upper] = range!;
    expect(upper.gt(lower)).toBe(true);
    expect(Number(lower.toString())).toBeCloseTo(1 * (1 - 0.0025), 6);
    expect(Number(upper.toString())).toBeCloseTo(1 * (1 + 0.0025), 6);
  });

  it("only uses bars inside the window", () => {
    // 7d of stable prices preceded by wild old bars outside the window.
    const recent = makeBars(7, [0.99, 1.01]);
    const old = makeBars(30, [5, 0.1]).filter(
      (bar) => bar.time < NOW - 8 * 86_400_000
    );
    const range = calcSigmaRange({
      prices: [...recent, ...old],
      windowDays: 7,
      sigmas: 1,
      nowMs: NOW,
    });
    expect(range).toBeDefined();
    expect(Number(range![0].toString())).toBeGreaterThan(0.95);
    expect(Number(range![1].toString())).toBeLessThan(1.05);
  });

  it("widens with the window when volatility differs across windows", () => {
    // Recent 7d calm (±1%), older bars (7-30d ago) wild (±50%): the 30d
    // window must produce a wider band than the 7d window.
    const recent = makeBars(7, [0.99, 1.01]);
    const old = makeBars(30, [1.5, 0.5]).filter(
      (bar) => bar.time < NOW - 7 * 86_400_000
    );
    const bars = [...recent, ...old];
    const narrow = calcSigmaRange({
      prices: bars,
      windowDays: 7,
      sigmas: 1,
      nowMs: NOW,
    });
    const wide = calcSigmaRange({
      prices: bars,
      windowDays: 30,
      sigmas: 1,
      nowMs: NOW,
    });
    expect(narrow).toBeDefined();
    expect(wide).toBeDefined();
    const width = (r: [Dec, Dec]) =>
      Number(r[1].toString()) - Number(r[0].toString());
    expect(width(wide!)).toBeGreaterThan(width(narrow!));
  });

  it("handles unix-second timestamps", () => {
    const bars = makeBars(7, [0.9, 1.1]).map((bar) => ({
      time: Math.floor(bar.time / 1000),
      close: bar.close,
    }));
    expect(
      calcSigmaRange({ prices: bars, windowDays: 7, sigmas: 1, nowMs: NOW })
    ).toBeDefined();
  });

  it("supports fractional sigmas", () => {
    // Alternating 0.9 / 1.1: mean 1, population σ = 0.1 → 1.5σ = [0.85, 1.15].
    const bars = makeBars(7, [0.9, 1.1]);
    const range = calcSigmaRange({
      prices: bars,
      windowDays: 7,
      sigmas: 1.5,
      nowMs: NOW,
    });
    expect(range).toBeDefined();
    expect(Number(range![0].toString())).toBeCloseTo(0.85, 6);
    expect(Number(range![1].toString())).toBeCloseTo(1.15, 6);
  });

  it("centers the band on `center` when given, keeping the window's σ", () => {
    // mean 1, σ = 0.1; center on 1.05 (a spot above the mean).
    const bars = makeBars(7, [0.9, 1.1]);
    const range = calcSigmaRange({
      prices: bars,
      windowDays: 7,
      sigmas: 1,
      nowMs: NOW,
      center: new Dec("1.05"),
    });
    expect(range).toBeDefined();
    expect(Number(range![0].toString())).toBeCloseTo(0.95, 6);
    expect(Number(range![1].toString())).toBeCloseTo(1.15, 6);

    // 0σ scalps around the center, not the mean.
    const scalp = calcSigmaRange({
      prices: bars,
      windowDays: 7,
      sigmas: 0,
      nowMs: NOW,
      center: new Dec("1.05"),
    });
    expect(Number(scalp![0].toString())).toBeCloseTo(1.05 * (1 - 0.0025), 6);
    expect(Number(scalp![1].toString())).toBeCloseTo(1.05 * (1 + 0.0025), 6);
  });

  it("returns undefined for a non-positive center", () => {
    const bars = makeBars(7, [0.9, 1.1]);
    expect(
      calcSigmaRange({
        prices: bars,
        windowDays: 7,
        sigmas: 1,
        nowMs: NOW,
        center: new Dec(0),
      })
    ).toBeUndefined();
  });

  it("returns undefined without enough data or with flat prices", () => {
    expect(
      calcSigmaRange({
        prices: makeBars(7, [1]).slice(0, 5),
        windowDays: 7,
        sigmas: 1,
        nowMs: NOW,
      })
    ).toBeUndefined();
    // σ = 0 series → no meaningful band
    expect(
      calcSigmaRange({
        prices: makeBars(7, [1]),
        windowDays: 7,
        sigmas: 1,
        nowMs: NOW,
      })
    ).toBeUndefined();
  });
});

describe("calcWindowStats", () => {
  it("returns the window's mean, σ, and sample count", () => {
    const bars = makeBars(7, [0.9, 1.1]);
    const stats = calcWindowStats({ prices: bars, windowDays: 7, nowMs: NOW });
    expect(stats.count).toBe(7 * 24);
    expect(stats.mean).toBeCloseTo(1, 6);
    expect(stats.stdDev).toBeCloseTo(0.1, 6);
  });

  it("returns a zero count on an empty window", () => {
    const stats = calcWindowStats({ prices: [], windowDays: 7, nowMs: NOW });
    expect(stats.count).toBe(0);
  });
});
