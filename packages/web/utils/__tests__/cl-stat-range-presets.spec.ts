import { Dec } from "@osmosis-labs/unit";

import { calcStatPresetRange, StatRangePreset } from "../cl-stat-range-presets";

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

const sigmaPreset: StatRangePreset = {
  kind: "sigma",
  label: "±1σ · 7d",
  windowDays: 7,
  sigmas: 1,
};

describe("calcStatPresetRange", () => {
  it("computes mean ± kσ over the window", () => {
    // Alternating 0.9 / 1.1: mean 1, population σ = 0.1.
    const bars = makeBars(7, [0.9, 1.1]);
    const range = calcStatPresetRange({
      preset: sigmaPreset,
      prices: bars,
      spotPrice: new Dec(1),
      nowMs: NOW,
    });
    expect(range).toBeDefined();
    const [lower, upper] = range!;
    expect(Number(lower.toString())).toBeCloseTo(0.9, 6);
    expect(Number(upper.toString())).toBeCloseTo(1.1, 6);
  });

  it("only uses bars inside the window", () => {
    // 7d of stable 1.0 preceded by wild old bars outside the window.
    const recent = makeBars(7, [0.99, 1.01]);
    const old = makeBars(30, [5, 0.1]).filter(
      (bar) => bar.time < NOW - 8 * 86_400_000
    );
    const range = calcStatPresetRange({
      preset: sigmaPreset,
      prices: [...recent, ...old],
      spotPrice: new Dec(1),
      nowMs: NOW,
    });
    expect(range).toBeDefined();
    const [lower, upper] = range!;
    expect(Number(lower.toString())).toBeGreaterThan(0.95);
    expect(Number(upper.toString())).toBeLessThan(1.05);
  });

  it("handles unix-second timestamps", () => {
    const bars = makeBars(7, [0.9, 1.1]).map((bar) => ({
      time: Math.floor(bar.time / 1000),
      close: bar.close,
    }));
    const range = calcStatPresetRange({
      preset: sigmaPreset,
      prices: bars,
      spotPrice: new Dec(1),
      nowMs: NOW,
    });
    expect(range).toBeDefined();
  });

  it("returns undefined without enough data or with flat prices", () => {
    expect(
      calcStatPresetRange({
        preset: sigmaPreset,
        prices: makeBars(7, [1]).slice(0, 5),
        spotPrice: new Dec(1),
        nowMs: NOW,
      })
    ).toBeUndefined();
    // σ = 0 → no meaningful range
    expect(
      calcStatPresetRange({
        preset: sigmaPreset,
        prices: makeBars(7, [1]),
        spotPrice: new Dec(1),
        nowMs: NOW,
      })
    ).toBeUndefined();
  });

  it("computes spot ± percent and guards a non-positive lower bound", () => {
    const preset: StatRangePreset = {
      kind: "spotPercent",
      label: "±5%",
      percent: 0.05,
    };
    const range = calcStatPresetRange({
      preset,
      prices: [],
      spotPrice: new Dec("0.4"),
      nowMs: NOW,
    });
    expect(range).toBeDefined();
    expect(Number(range![0].toString())).toBeCloseTo(0.38, 9);
    expect(Number(range![1].toString())).toBeCloseTo(0.42, 9);

    expect(
      calcStatPresetRange({
        preset: { kind: "spotPercent", label: "±150%", percent: 1.5 },
        prices: [],
        spotPrice: new Dec("0.4"),
        nowMs: NOW,
      })
    ).toBeUndefined();
  });
});
