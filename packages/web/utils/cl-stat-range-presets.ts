import { Dec } from "@osmosis-labs/unit";

const MS_PER_DAY = 86_400_000;

/**
 * Statistical range presets for the advanced CL position controls: ranges
 * derived from simple statistics of the historical price series (mean ± k
 * standard deviations over a window) or from spot (± a fixed fraction),
 * rather than from the observed min/max that the lookback+buffer sliders
 * use. Parameterised by simple statistics on purpose, so presets don't
 * overfit any one pool's history.
 */
export type StatRangePreset =
  | { kind: "sigma"; label: string; windowDays: number; sigmas: number }
  | { kind: "spotPercent"; label: string; percent: number };

export const STAT_RANGE_PRESETS: StatRangePreset[] = [
  { kind: "sigma", label: "±1σ · 7d", windowDays: 7, sigmas: 1 },
  { kind: "sigma", label: "±2σ · 30d", windowDays: 30, sigmas: 2 },
  { kind: "spotPercent", label: "±5%", percent: 0.05 },
];

/** Mean and population standard deviation of closes within the window. */
function windowStats(
  prices: { time: number; close: Dec }[],
  windowDays: number,
  nowMs: number
): { mean: number; stdDev: number; count: number } {
  const cutoff = nowMs - windowDays * MS_PER_DAY;
  const closes: number[] = [];
  for (const bar of prices) {
    // Bars carry unix seconds or milliseconds depending on source; normalize.
    const timeMs = bar.time > 1e12 ? bar.time : bar.time * 1000;
    if (timeMs >= cutoff) {
      const value = Number(bar.close.toString());
      if (Number.isFinite(value) && value > 0) closes.push(value);
    }
  }
  if (closes.length === 0) return { mean: 0, stdDev: 0, count: 0 };
  const mean = closes.reduce((sum, v) => sum + v, 0) / closes.length;
  const variance =
    closes.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / closes.length;
  return { mean, stdDev: Math.sqrt(variance), count: closes.length };
}

/**
 * Computes the [lower, upper] price range for a preset, in the same display
 * units as the input series/spot. Returns undefined when the preset can't be
 * computed (not enough data in the window, degenerate stats), so callers can
 * disable the affordance rather than apply a junk range.
 */
export function calcStatPresetRange({
  preset,
  prices,
  spotPrice,
  nowMs,
}: {
  preset: StatRangePreset;
  prices: { time: number; close: Dec }[];
  spotPrice: Dec | undefined;
  nowMs: number;
}): [Dec, Dec] | undefined {
  if (preset.kind === "spotPercent") {
    if (!spotPrice || !spotPrice.isPositive()) return undefined;
    const delta = spotPrice.mul(new Dec(preset.percent.toString()));
    const lower = spotPrice.sub(delta);
    if (!lower.isPositive()) return undefined;
    return [lower, spotPrice.add(delta)];
  }

  const { mean, stdDev, count } = windowStats(prices, preset.windowDays, nowMs);
  // Require a minimally meaningful sample; an hourly series has 24 bars/day.
  if (count < 10 || mean <= 0 || stdDev <= 0) return undefined;

  const lower = mean - preset.sigmas * stdDev;
  const upper = mean + preset.sigmas * stdDev;
  if (lower <= 0 || upper <= lower) return undefined;
  // Round through a fixed exponent so float noise can't break Dec's strict
  // constructor.
  return [new Dec(lower.toFixed(12)), new Dec(upper.toFixed(12))];
}
