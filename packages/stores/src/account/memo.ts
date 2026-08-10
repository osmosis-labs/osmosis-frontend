import { Dec } from "@osmosis-labs/unit";

/**
 * Single writer of the frontend's tx auth-memo tag. This tags the top-level
 * `TxBody.memo` (the auth memo) only — never the IBC forwarding memo inside
 * `MsgTransfer.value.memo`, which carries bridge routing data.
 *
 * Grammar (canonical spec — MTN-137):
 *
 * ```
 * <BASE>                              # default — no acknowledgement happened
 * <BASE>/warn:pi=12.40                # user acknowledged the price-impact warning
 * <BASE>/warn:slip=99.89              # user acknowledged the total-loss warning
 * <BASE>/warn:slip=99.89,pi=12.40     # both (fixed order: slip before pi)
 * ```
 *
 * where `<BASE>` is `OsmosisFE` (normal sign) or `1CT` (one-click session).
 *
 * Format rules:
 * - Percentages at 2 decimal places, half-up rounding, no `%` sign
 *   (`99.895` → `99.90`).
 * - A flag appears only for a warning that was actually shown and
 *   acknowledged; unwarned transactions carry the bare base tag.
 * - The total memo stays well under 100 bytes.
 * - A non-empty caller memo keeps the historical behavior: the tag is
 *   appended after `" \n"`.
 * - Amino caveat: wallets can let the user edit the memo before signing;
 *   callers stamping flags should set `preferNoSetMemo` so the proof
 *   survives signing untouched.
 */

/** Base tag appended to every frontend-originated tx for QA purposes. */
export const FeMemoTag = "OsmosisFE";
/** Base tag for transactions signed by a one-click trading session. */
export const OneClickFeMemoTag = "1CT";

export type FeMemoBaseTag = typeof FeMemoTag | typeof OneClickFeMemoTag;

/**
 * Warn-accept flags stamped into the auth memo (MTN-137). Values are the
 * figures the user explicitly acknowledged (the frozen basis), never live
 * sign-time values. A field is present iff its warning was shown and the
 * user ticked the acknowledgement checkbox for it.
 */
export interface TxFeMemoFlags {
  /** Acknowledged total-loss fraction (0..1) — stamped as `slip=<pct>`. */
  slippage?: Dec;
  /**
   * Acknowledged bundled-swap price impact as a positive magnitude fraction
   * (0..1) — stamped as `pi=<pct>`.
   */
  priceImpact?: Dec;
}

/**
 * Formats a non-negative loss fraction as a percentage with exactly 2 decimal
 * places, rounded half-up, without a `%` sign: `0.99895` → `"99.90"`.
 */
export function formatWarnPct(fraction: Dec): string {
  // Work in hundredths of a percent so half-up rounding is a +0.5 truncate.
  const hundredths = fraction
    .mul(new Dec(10000))
    .add(new Dec("0.5"))
    .truncate()
    .toString()
    .padStart(3, "0");
  return `${hundredths.slice(0, -2)}.${hundredths.slice(-2)}`;
}

/**
 * Appends the frontend base tag — plus the `warn:` suffix when flags are
 * present — to a tx auth memo, preserving the historical behavior for
 * non-empty caller memos.
 */
export function appendFeMemoTag(
  memo: string,
  baseTag: FeMemoBaseTag,
  flags?: TxFeMemoFlags
): string {
  const warnParts: string[] = [];
  if (flags?.slippage !== undefined) {
    warnParts.push(`slip=${formatWarnPct(flags.slippage)}`);
  }
  if (flags?.priceImpact !== undefined) {
    warnParts.push(`pi=${formatWarnPct(flags.priceImpact)}`);
  }

  const tag =
    warnParts.length > 0 ? `${baseTag}/warn:${warnParts.join(",")}` : baseTag;

  return memo === "" ? tag : `${memo} \n${tag}`;
}
