import { Dec } from "@osmosis-labs/unit";

const MS_PER_DAY = 86_400_000;

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
 * Range of mean ± k standard deviations over the lookback window, in the same
 * display units as the input series. These are the statistical stops of the
 * advanced width slider; parameterised by simple statistics on purpose, so
 * ranges don't overfit any one pool's history.
 *
 * `sigmas === 0` yields a deliberately tight scalp band (±0.25% of the mean)
 * rather than the degenerate zero-width range.
 *
 * Returns undefined when the window can't support the statistic (not enough
 * bars, flat series, non-positive bounds), so callers can fall back rather
 * than apply a junk range.
 */
export function calcSigmaRange({
  prices,
  windowDays,
  sigmas,
  nowMs,
}: {
  prices: { time: number; close: Dec }[];
  windowDays: number;
  sigmas: number;
  nowMs: number;
}): [Dec, Dec] | undefined {
  const { mean, stdDev, count } = windowStats(prices, windowDays, nowMs);
  // Require a minimally meaningful sample; an hourly series has 24 bars/day.
  if (count < 10 || mean <= 0 || stdDev <= 0) return undefined;

  const halfWidth = sigmas === 0 ? mean * 0.0025 : sigmas * stdDev;
  const lower = mean - halfWidth;
  const upper = mean + halfWidth;
  if (lower <= 0 || upper <= lower) return undefined;
  // Round through a fixed exponent so float noise can't break Dec's strict
  // constructor.
  return [new Dec(lower.toFixed(12)), new Dec(upper.toFixed(12))];
}
