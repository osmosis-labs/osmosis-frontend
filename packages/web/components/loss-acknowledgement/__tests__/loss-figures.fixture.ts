import { Dec } from "@osmosis-labs/unit";

import { LossFigures } from "~/components/loss-acknowledgement";
import { HighSlippageGate } from "~/config/trade-warnings";

/**
 * Shared LossFigures builder for the acknowledgement specs. Figures are built
 * relative to the shared gate constants rather than hard-coded percentages,
 * so tuning `~/config/trade-warnings` does not spuriously break tests — the
 * single-knob contract is test-enforced.
 */
export const warnedSlippage = HighSlippageGate.add(new Dec(0.01));

export const baseFigures = (overrides?: Partial<LossFigures>): LossFigures => ({
  identityKey: "Nomic|osmosis-1|bitcoin|allBTC|sat|100000000",
  slippage: warnedSlippage,
  priceImpact: new Dec(0),
  warnSlippage: true,
  warnPriceImpact: false,
  swapImpactUnknown: false,
  ...overrides,
});
