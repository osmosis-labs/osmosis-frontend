import type { Bridge } from "@osmosis-labs/bridge";
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

/** Whether any warning requiring acknowledgement is active. */
export function hasActiveWarning(figures: LossFigures): boolean {
  return (
    figures.warnSlippage || figures.warnPriceImpact || figures.swapImpactUnknown
  );
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
