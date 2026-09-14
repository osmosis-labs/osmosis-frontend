import { Dec } from "@osmosis-labs/unit";

/**
 * Single writer of the frontend's tx auth-memo tag. This tags the top-level
 * `TxBody.memo` (the auth memo) only — never the IBC forwarding memo inside
 * `MsgTransfer.value.memo`, which carries bridge routing data.
 *
 * Grammar (canonical spec — MTN-137, extended with the trade surfaces by
 * MTN-150):
 *
 * ```
 * <BASE>                              # default — no acknowledgement happened
 * <BASE>/warn:loss=99.89              # accepted a total value loss (bridge)
 * <BASE>/warn:pi=12.40                # accepted a price-impact warning
 * <BASE>/warn:slip=6.00               # accepted a slippage tolerance (trade)
 * <BASE>/warn:mktfill=3.25            # accepted a limit order filling at market
 * <BASE>/warn:pi=12.40,slip=6.00      # several, in the fixed order below
 * ```
 *
 * where `<BASE>` is `OsmosisFE` (normal sign) or `1CT` (one-click session).
 *
 * Each key names one specific acknowledged quantity, so a tx hash alone answers
 * "what was this user warned about, and by how much?" without needing to know
 * which screen produced the transaction:
 *
 * | Key       | Acknowledged quantity                     | Surface              |
 * | --------- | ----------------------------------------- | -------------------- |
 * | `loss`    | total value lost across the transfer      | bridge withdrawal    |
 * | `pi`      | price impact magnitude                    | swap, limit, convert |
 * | `slip`    | slippage tolerance the user allowed       | swap, limit          |
 * | `mktfill` | distance past market the price was set    | true limit order     |
 *
 * Fixed key order when several are present: `loss`, `pi`, `slip`, `mktfill`.
 *
 * `loss` and `slip` are deliberately separate keys rather than one shared key
 * with a per-surface meaning. `loss` is a computed loss the transfer will
 * realize; `slip` is an upper bound a trade most likely never reaches. Sharing
 * a key would let an aggregate query over memos add the two together, and look
 * correct while being wrong.
 *
 * History: MTN-137 shipped the bridge's total-loss figure under the key `slip`,
 * before MTN-150 introduced the trade keys and this naming. A `slip=` on a
 * bridge transfer therefore predates the rename and carries the meaning that
 * `loss=` has here.
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
  /**
   * Acknowledged total value loss across a bridge transfer, as a fraction
   * (0..1) — stamped as `loss=<pct>`. A loss the transfer realizes, not a
   * tolerance; see `slippageTolerance` for the trade-side bound.
   */
  totalLoss?: Dec;
  /**
   * Acknowledged price impact as a positive magnitude fraction (0..1) —
   * stamped as `pi=<pct>`. Providers disagree on sign, so callers normalize
   * before snapshotting.
   */
  priceImpact?: Dec;
  /**
   * Acknowledged slippage tolerance the user allowed on a trade, as a fraction
   * (0..1) — stamped as `slip=<pct>`. This is the bound they accepted, not the
   * loss they took; realized loss is usually far smaller.
   */
  slippageTolerance?: Dec;
  /**
   * Acknowledged distance past the market price at which a true limit order was
   * placed, as a positive magnitude fraction (0..1) — stamped as
   * `mktfill=<pct>`. Such an order crosses the book and fills immediately
   * instead of resting, which is what the user is acknowledging.
   */
  marketFillDistance?: Dec;
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
  // Fixed key order — see the grammar spec above.
  const warnParts: string[] = [];
  if (flags?.totalLoss !== undefined) {
    warnParts.push(`loss=${formatWarnPct(flags.totalLoss)}`);
  }
  if (flags?.priceImpact !== undefined) {
    warnParts.push(`pi=${formatWarnPct(flags.priceImpact)}`);
  }
  if (flags?.slippageTolerance !== undefined) {
    warnParts.push(`slip=${formatWarnPct(flags.slippageTolerance)}`);
  }
  if (flags?.marketFillDistance !== undefined) {
    warnParts.push(`mktfill=${formatWarnPct(flags.marketFillDistance)}`);
  }

  const tag =
    warnParts.length > 0 ? `${baseTag}/warn:${warnParts.join(",")}` : baseTag;

  return memo === "" ? tag : `${memo} \n${tag}`;
}
