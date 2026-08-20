import type { Bridge } from "@osmosis-labs/bridge";
import type { TxFeMemoFlags } from "@osmosis-labs/stores";
import { Dec } from "@osmosis-labs/unit";

import { AckReArmTolerance } from "~/config/trade-warnings";

/**
 * Frozen-basis model for high-loss acknowledgements (MTN-199).
 *
 * When the user ticks the acknowledgement checkbox, the loss figures and
 * transfer identity visible at that moment are snapshotted ("the acknowledged
 * basis"). The acknowledgement is only valid while the live quote stays within
 * `AckReArmTolerance` of that basis and describes the same transfer — so what
 * the user acknowledged is, within tolerance, what gets signed. Any of the
 * re-arm conditions in `shouldResetAcknowledgement` clears the basis and the
 * checkbox must be re-ticked. The tx memo flags (MTN-137) are stamped from the
 * basis, never from live values, so they can never claim acceptance of numbers
 * the user was not shown.
 */
export interface LossFigures {
  /** Identity of the transfer the figures describe. */
  providerId: Bridge;
  fromChainId: string | number | undefined;
  toChainId: string | number | undefined;
  fromAssetAddress: string | undefined;
  toAssetAddress: string | undefined;
  /** Debounced input amount in base units. */
  inputAmount: string;

  /** Total value loss as a fraction (0..1). */
  slippage: Dec;
  /**
   * Bundled-swap price impact as a positive magnitude fraction (0..1).
   * Callers must normalize provider sign conventions before snapshotting —
   * the worsening comparison assumes larger = worse.
   */
  priceImpact: Dec;

  warnSlippage: boolean;
  warnPriceImpact: boolean;
  /** Quote bundles an Osmosis swap whose price impact is unknown. */
  swapImpactUnknown: boolean;
}

/**
 * Normalize a provider-reported price impact to a positive magnitude.
 *
 * Nomic, whose quotes bundle an Osmosis swap, reports impact as a negative
 * fraction; Squid reports it positive. Both the `HighPriceImpactGate`
 * comparison and the worsening check in `shouldResetAcknowledgement` assume
 * larger = worse, so a negative figure silently fails every gate — which is why
 * the ≥10% gate had never fired for any bundled-swap provider before MTN-199.
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
    figures.warnSlippage || figures.warnPriceImpact || figures.swapImpactUnknown
  );
}

/**
 * Whether the current figures demand a (fresh) acknowledgement that the given
 * basis does not provide. This is THE gate predicate: the rendered
 * `warningNeedsAcknowledgement` flag and the synchronous sign-time guard in
 * `onTransfer` both call it, so the UI and the signing path cannot disagree
 * about when an acknowledgement is required.
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
 * 1. The transfer identity changed (provider, chains, assets, input amount).
 * 2. A warning type is active now that was not active at acknowledgement time
 *    (the user never saw it).
 * 3. A loss figure worsened by more than `AckReArmTolerance` (absolute
 *    percentage points). Improvements never reset.
 */
export function shouldResetAcknowledgement(
  acknowledged: LossFigures,
  current: LossFigures
): boolean {
  if (
    acknowledged.providerId !== current.providerId ||
    acknowledged.fromChainId !== current.fromChainId ||
    acknowledged.toChainId !== current.toChainId ||
    acknowledged.fromAssetAddress !== current.fromAssetAddress ||
    acknowledged.toAssetAddress !== current.toAssetAddress ||
    acknowledged.inputAmount !== current.inputAmount
  ) {
    return true;
  }

  if (current.warnSlippage && !acknowledged.warnSlippage) return true;
  if (current.warnPriceImpact && !acknowledged.warnPriceImpact) return true;
  if (current.swapImpactUnknown && !acknowledged.swapImpactUnknown) return true;

  if (current.slippage.sub(acknowledged.slippage).gt(AckReArmTolerance)) {
    return true;
  }
  if (current.priceImpact.sub(acknowledged.priceImpact).gt(AckReArmTolerance)) {
    return true;
  }

  return false;
}

/**
 * Tx auth-memo flags (MTN-137) derived from the acknowledged basis — never
 * from live sign-time figures, so the memo can only claim acceptance of
 * numbers the user was actually shown. A figure is stamped iff its warning
 * fired and was acknowledged; an unknown-impact acknowledgement has no figure
 * to stamp, so it yields no flags.
 */
export function deriveMemoFlags(
  basis: LossFigures | null
): TxFeMemoFlags | undefined {
  if (!basis) return undefined;

  const flags: TxFeMemoFlags = {};
  if (basis.warnSlippage) flags.slippage = basis.slippage;
  if (basis.warnPriceImpact) flags.priceImpact = basis.priceImpact;

  return flags.slippage || flags.priceImpact ? flags : undefined;
}
