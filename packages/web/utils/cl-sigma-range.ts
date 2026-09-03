import { Dec } from "@osmosis-labs/unit";

const MS_PER_DAY = 86_400_000;

/** Mean, population standard deviation, and observed extremes of closes
 *  within the window. */
function windowStats(
  prices: { time: number; close: Dec }[],
  windowDays: number,
  nowMs: number
): { mean: number; stdDev: number; count: number; min: number; max: number } {
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
  if (closes.length === 0)
    return { mean: 0, stdDev: 0, count: 0, min: 0, max: 0 };
  let min = closes[0];
  let max = closes[0];
  for (const v of closes) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const mean = closes.reduce((sum, v) => sum + v, 0) / closes.length;
  const variance =
    closes.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / closes.length;
  return { mean, stdDev: Math.sqrt(variance), count: closes.length, min, max };
}

/**
 * Mean, population standard deviation, observed [min, max], and sample count
 * of the closes inside the lookback window — for callers that need the
 * statistics themselves (e.g. to display the window mean or anchor a band on
 * the observed range).
 */
export function calcWindowStats({
  prices,
  windowDays,
  nowMs,
}: {
  prices: { time: number; close: Dec }[];
  windowDays: number;
  nowMs: number;
}): { mean: number; stdDev: number; count: number; min: number; max: number } {
  return windowStats(prices, windowDays, nowMs);
}

/**
 * Range of ±k standard deviations over the lookback window, in the same
 * display units as the input series. The band widens beyond `anchor`: a
 * point (e.g. spot or the window mean) or an interval (e.g. the observed
 * [min, max]); it defaults to the window mean. σ always comes from the
 * window. Parameterised by simple statistics on purpose, so ranges don't
 * overfit any one pool's history.
 *
 * `sigmas === 0` on a point anchor yields a deliberately tight scalp band
 * (±0.25% of the anchor) rather than the degenerate zero-width range; on an
 * interval anchor it is exactly the interval.
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
  anchor,
}: {
  prices: { time: number; close: Dec }[];
  windowDays: number;
  sigmas: number;
  nowMs: number;
  anchor?: Dec | [Dec, Dec];
}): [Dec, Dec] | undefined {
  const { mean, stdDev, count } = windowStats(prices, windowDays, nowMs);
  // Require a minimally meaningful sample; an hourly series has 24 bars/day.
  if (count < 10 || mean <= 0 || stdDev <= 0) return undefined;

  const [anchorLo, anchorHi] =
    anchor === undefined
      ? [mean, mean]
      : Array.isArray(anchor)
      ? [Number(anchor[0].toString()), Number(anchor[1].toString())]
      : [Number(anchor.toString()), Number(anchor.toString())];
  if (
    !Number.isFinite(anchorLo) ||
    !Number.isFinite(anchorHi) ||
    anchorLo <= 0 ||
    anchorHi < anchorLo
  )
    return undefined;

  const halfWidth =
    sigmas === 0
      ? anchorLo === anchorHi
        ? anchorLo * 0.0025
        : 0
      : sigmas * stdDev;
  const lower = anchorLo - halfWidth;
  const upper = anchorHi + halfWidth;
  if (lower <= 0 || upper <= lower) return undefined;
  // Round through a fixed exponent so float noise can't break Dec's strict
  // constructor.
  return [new Dec(lower.toFixed(12)), new Dec(upper.toFixed(12))];
}
