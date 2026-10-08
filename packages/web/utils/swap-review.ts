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

/** Mirrors getSwapTxParameters' chain-unit serialization: scales a display
 *  amount by the asset's decimals and truncates. A true result means the
 *  transaction's slippage bound (exact-in's minimum output, exact-out's
 *  maximum input) would serialize to zero, which chain-side ValidateBasic
 *  rejects as non-positive, so the transaction could only fail. */
export function slippageBoundTruncatesToZero(
  displayAmount: Dec,
  coinDecimals: number
): boolean {
  return displayAmount
    .mul(DecUtils.getTenExponentNInPrecisionRange(coinDecimals))
    .truncate()
    .isZero();
}

/**
 * Whether a market swap's review must demand an explicit high-loss
 * acknowledgement before confirmation is enabled.
 *
 * The output value is not an independent price: for exact-in it is derived
 * from the input's fiat value and the router's price impact and fees. A
 * missing or out-of-range impact therefore reads as a zero output value and
 * fails safe by requiring the acknowledgement.
 */
export function requiresValueDisparityAcknowledgement({
  quoteType,
  inputUsd,
  minimumOutputUsd,
  minimumOutputTokenIsZero,
}: {
  quoteType: "out-given-in" | "in-given-out";
  /** USD value sent (exact-in) or maximum paid (exact-out); undefined when
   *  the asset has no fiat price or there is no quote yet. */
  inputUsd: number | undefined;
  /** USD value of the minimum received (exact-in) or of the fixed output
   *  (exact-out); undefined when unpriced or there is no quote yet. */
  minimumOutputUsd: number | undefined;
  /** True when the exact-in minimum output token amount is exactly zero. */
  minimumOutputTokenIsZero: boolean;
}): boolean {
  // A zero minimum output offers no protection at all, so it is gated
  // whether or not fiat prices are available.
  if (quoteType === "out-given-in" && minimumOutputTokenIsZero) return true;

  if (inputUsd === undefined || minimumOutputUsd === undefined) return false;

  // Sub-$1 trades are exempt.
  if (inputUsd <= 1) return false;

  // Exact-out's fixed output reads $0 while its price loads; the amount is
  // user-fixed, so a genuine zero cannot occur on this side.
  if (quoteType === "in-given-out" && minimumOutputUsd <= 0) return false;

  return minimumOutputUsd < inputUsd * ValueDisparityThreshold;
}
