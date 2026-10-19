import { Dec, DecUtils } from "@osmosis-labs/unit";

/** Highest slippage tolerance, in percent, the review input accepts. A 100%
 *  tolerance serializes to a zero minimum output, which the chain rejects. */
export const MaxSlippageInputPercent = 99.9;

/** The review demands an explicit acknowledgement when the minimum value
 *  received falls below this fraction of the value sent. */
export const ValueDisparityThreshold = 0.75;

/** Formats a slippage fraction as a percentage without trailing zeros,
 *  e.g. 0.005 -> "0.5", 0.01 -> "1". */
export function formatSlippagePercent(fraction: Dec): string {
  return fraction
    .mul(new Dec(100))
    .toString(2)
    .replace(/\.?0+$/, "");
}

/**
 * Parses a raw slippage input keystroke.
 *
 * Returns `undefined` to reject the keystroke (the input keeps its previous
 * value). Otherwise returns the text to display and, when the text is a
 * complete positive percentage, the value to commit to the slippage config.
 * Intermediate states such as "0", "0." or "1." are displayed but not
 * committed, so typing "0.5" never briefly submits a 0% tolerance.
 */
export function parseSlippageInput(
  raw: string
): { display: string; commit: string | undefined } | undefined {
  if (raw === "") return { display: "", commit: undefined };

  // Digits with at most one decimal place; a leading "." becomes "0." and
  // redundant leading zeros are dropped ("05" -> "5").
  if (!/^\d*\.?\d?$/.test(raw)) return undefined;
  const display = (raw.startsWith(".") ? "0" + raw : raw).replace(
    /^0+(?=\d)/,
    ""
  );

  const value = Number(display);
  if (!Number.isFinite(value)) return undefined;
  if (value > MaxSlippageInputPercent) {
    return {
      display: String(MaxSlippageInputPercent),
      commit: String(MaxSlippageInputPercent),
    };
  }

  const isComplete = !display.endsWith(".") && value > 0;
  return { display, commit: isComplete ? display : undefined };
}

/** Whether the transaction's slippage bound (exact-in's minimum output,
 *  exact-out's maximum input) serializes to zero, which chain-side
 *  ValidateBasic rejects as non-positive, so the transaction could only fail.
 *
 *  Computed in getSwapTxParameters' order: the quote amount scaled to chain
 *  units first, then the slippage applied, then truncated. Applying the
 *  slippage to the display amount first rounds differently, so for an
 *  18-decimal asset one base unit could pass here and still fail onchain. */
export function slippageBoundTruncatesToZero({
  quoteAmount,
  slippage,
  coinDecimals,
  quoteType,
}: {
  /** The quote's amount in display units: the output for exact-in, the
   *  input for exact-out. */
  quoteAmount: Dec;
  /** Tolerance as a fraction, e.g. 0.01 for 1%. */
  slippage: Dec;
  coinDecimals: number;
  quoteType: "out-given-in" | "in-given-out";
}): boolean {
  const factor =
    quoteType === "in-given-out"
      ? new Dec(1).add(slippage)
      : new Dec(1).sub(slippage);
  return quoteAmount
    .mul(DecUtils.getTenExponentNInPrecisionRange(coinDecimals))
    .mul(factor)
    .truncate()
    .isZero();
}

/**
 * Whether a market swap's review must demand an explicit high-loss
 * acknowledgement before confirmation is enabled.
 *
 * Both values must come from each asset's own price. Pricing the output from
 * the input's value and the router's price impact would only restate the
 * price-impact gate, and could never catch a mispriced pool whose quoted
 * impact looks fine. A missing price on either side skips the check.
 */
export function requiresValueDisparityAcknowledgement({
  quoteType,
  inputUsd,
  minimumOutputUsd,
}: {
  quoteType: "out-given-in" | "in-given-out";
  /** USD value sent (exact-in) or maximum paid (exact-out); undefined when
   *  the asset has no fiat price or there is no quote yet. */
  inputUsd: number | undefined;
  /** USD value of the minimum received (exact-in) or of the fixed output
   *  (exact-out); undefined when unpriced or there is no quote yet. */
  minimumOutputUsd: number | undefined;
}): boolean {
  if (inputUsd === undefined || minimumOutputUsd === undefined) return false;

  // Sub-$1 trades are exempt.
  if (inputUsd <= 1) return false;

  // Exact-out's fixed output reads $0 while its price loads; the amount is
  // user-fixed, so a genuine zero cannot occur on this side.
  if (quoteType === "in-given-out" && minimumOutputUsd <= 0) return false;

  return minimumOutputUsd < inputUsd * ValueDisparityThreshold;
}
