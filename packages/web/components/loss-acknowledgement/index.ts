import type { TxFeMemoFlags } from "@osmosis-labs/stores";
import { Dec } from "@osmosis-labs/unit";

import { AckReArmTolerance } from "~/config/trade-warnings";

/**
 * Frozen-basis model for high-loss acknowledgements (MTN-199, generalized to the
 * trade surfaces by MTN-150).
 *
 * When the user ticks the acknowledgement checkbox, the loss figures and the
 * identity of whatever is about to be signed are snapshotted ("the acknowledged
 * basis"). The acknowledgement is only valid while the live quote stays within
 * `AckReArmTolerance` of that basis and still describes the same operation — so
 * what the user acknowledged is, within tolerance, what gets signed. Any of the
 * re-arm conditions in `shouldResetAcknowledgement` clears the basis and the
 * checkbox must be re-ticked. The tx memo flags (MTN-137) are stamped from the
 * basis, never from live values, so they can never claim acceptance of numbers
 * the user was not shown.
 *
 * The model knows nothing about bridges or trades: a surface supplies an
 * `identityKey` and its figures, and gets a gate predicate back.
 */
export interface LossFigures {
  /**
   * Opaque identity of the operation the figures describe — everything that
   * makes this a *different* thing to sign rather than a re-quote of the same
   * thing. Any change re-arms the acknowledgement immediately, with no
   * tolerance, so each surface composes it from the fields that matter there
   * (the bridge from provider, chains, assets and input amount; a trade from the
   * denom pair, quote type and input amount).
   *
   * Figures that merely drift as quotes refresh — slippage, price impact —
   * belong in the fields below instead, where `AckReArmTolerance` governs them.
   * Putting one here would re-arm the checkbox on every tick.
   */
  identityKey: string;

  /**
   * The loss figure being accepted, as a fraction (0..1): total value lost
   * across a bridge transfer, or the slippage tolerance allowed on a trade. The
   * field keeps its historical name; the memo key it stamps into depends on the
   * surface (`loss=` versus `slip=` — see `TxFeMemoFlags`).
   */
  slippage: Dec;
  /**
   * Price impact as a positive magnitude fraction (0..1). Callers must
   * normalize provider sign conventions before snapshotting — the worsening
   * comparison assumes larger = worse.
   */
  priceImpact: Dec;

  /**
   * How far past the market price a true limit order is priced, as a positive
   * magnitude fraction (0..1) — such an order crosses the book and fills
   * immediately instead of resting. Trade surfaces only; absent when the figure
   * is unavailable, in which case `warnMarketFill` still gates but there is
   * nothing to stamp.
   */
  marketFillDistance?: Dec;

  warnSlippage: boolean;
  warnPriceImpact: boolean;
  /** True limit order priced across the opposite side of the book. */
  warnMarketFill?: boolean;
  /**
   * Quote bundles an Osmosis swap whose price impact is unknown. Bridge-only —
   * the trade surfaces quote their own impact directly and omit this.
   */
  swapImpactUnknown?: boolean;
}

/**
 * Normalize a reported price impact to a positive magnitude.
 *
 * Sources disagree on sign: Nomic, whose quotes bundle an Osmosis swap, reports
 * impact as a negative fraction and Squid reports it positive, while our own
 * swap router reports it negative. Both the
 * `HighPriceImpactGate` comparison and the worsening check in
 * `shouldResetAcknowledgement` assume larger = worse, so a negative figure
 * silently fails every gate — which is why the ≥10% gate had never fired for
 * any bundled-swap provider before MTN-199.
 *
 * Exported (rather than inlined at the call site) so this sign contract is
 * test-enforced: a regression here does not throw or misrender, it just stops
 * the gate firing for bundled-swap providers.
 */
export function normalizePriceImpact(priceImpact: Dec): Dec {
  return priceImpact.abs();
}

/** Whether any warning requiring acknowledgement is active. */
export function hasActiveWarning(figures: LossFigures): boolean {
  return (
    figures.warnSlippage ||
    figures.warnPriceImpact ||
    (figures.warnMarketFill ?? false) ||
    (figures.swapImpactUnknown ?? false)
  );
}

/**
 * Whether the current figures demand a (fresh) acknowledgement that the given
 * basis does not provide. This is THE gate predicate: the rendered
 * `warningNeedsAcknowledgement` flag and each surface's synchronous sign-time
 * guard both call it, so the UI and the signing path cannot disagree about when
 * an acknowledgement is required.
 */
export function needsAcknowledgement(
  basis: LossFigures | null,
  current: LossFigures | undefined
): boolean {
  if (!current || !hasActiveWarning(current)) return false;
  return basis === null || shouldResetAcknowledgement(basis, current);
}

/**
 * Whether a previously acknowledged basis is stale for the current figures
 * and the acknowledgement must be reset. Pure; exhaustively unit-tested.
 *
 * Resets when:
 * 1. The operation's `identityKey` changed — a different thing to sign.
 * 2. A warning type is active now that was not active at acknowledgement time
 *    (the user never saw it).
 * 3. A loss figure worsened by more than `AckReArmTolerance` (absolute
 *    percentage points). Improvements never reset.
 */
export function shouldResetAcknowledgement(
  acknowledged: LossFigures,
  current: LossFigures
): boolean {
  if (acknowledged.identityKey !== current.identityKey) return true;

  if (current.warnSlippage && !acknowledged.warnSlippage) return true;
  if (current.warnPriceImpact && !acknowledged.warnPriceImpact) return true;
  if (current.warnMarketFill && !acknowledged.warnMarketFill) return true;
  if (current.swapImpactUnknown && !acknowledged.swapImpactUnknown) return true;

  if (current.slippage.sub(acknowledged.slippage).gt(AckReArmTolerance)) {
    return true;
  }
  if (current.priceImpact.sub(acknowledged.priceImpact).gt(AckReArmTolerance)) {
    return true;
  }
  // Spot moves while the modal is open, so how far past market a limit order
  // sits drifts like any other figure. Compared only when both sides have it;
  // a figure appearing where there was none is caught by the newly-warned
  // checks above.
  if (
    current.marketFillDistance &&
    acknowledged.marketFillDistance &&
    current.marketFillDistance
      .sub(acknowledged.marketFillDistance)
      .gt(AckReArmTolerance)
  ) {
    return true;
  }

  return false;
}

/**
 * A bridge transfer's tx auth-memo flags (MTN-137), derived from the
 * acknowledged basis — never from live sign-time figures, so the memo can only
 * claim acceptance of numbers the user was actually shown. A figure is stamped
 * iff its warning fired and was acknowledged; an unknown-impact acknowledgement
 * has no figure to stamp, so it yields no flags.
 *
 * Named for the bridge because the mapping is surface-specific:
 * `LossFigures.slippage` is a realized total loss here and so stamps `loss=`,
 * whereas on a trade the same field is a tolerance and must stamp `slip=`. A
 * surface using the wrong mapping would emit a memo that reads plausibly and
 * means something else, which is exactly what the separate keys exist to prevent.
 */
export function deriveBridgeMemoFlags(
  basis: LossFigures | null
): TxFeMemoFlags | undefined {
  if (!basis) return undefined;

  const flags: TxFeMemoFlags = {};
  if (basis.warnSlippage) flags.totalLoss = basis.slippage;
  if (basis.warnPriceImpact) flags.priceImpact = basis.priceImpact;

  return flags.totalLoss || flags.priceImpact ? flags : undefined;
}
