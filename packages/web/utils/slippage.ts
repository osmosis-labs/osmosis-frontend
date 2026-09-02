import { Dec } from "@osmosis-labs/unit";

import {
  DefaultSlippage,
  DYNAMIC_SLIPPAGE_TIERS,
  ExtremeValueDisparityThreshold,
} from "~/config/swap";

/** Minimal slice of a router quote needed to suggest a slippage tier. */
export interface SuggestedSlippageQuote {
  priceImpactTokenOut?: { toDec(): Dec };
  tokens?: { liquidity_cap: string }[];
}

/** Decides whether the swap review must demand an explicit high-loss
 *  acknowledgement before enabling confirmation (pure, no side effects). */
export function requiresValueDisparityAcknowledgement({
  quoteType,
  inputUsd,
  minimumOutputUsd,
  minimumOutputTokenIsZero,
}: {
  quoteType: "out-given-in" | "in-given-out";
  /** USD value sent (exact-in) or maximum paid (exact-out); undefined when
   *  the asset has no fiat pricing or no quote exists yet. */
  inputUsd: number | undefined;
  /** USD value of the minimum received (exact-in) or the fixed output
   *  (exact-out); undefined when unpriced or no quote exists yet. */
  minimumOutputUsd: number | undefined;
  /** True when the minimum output token amount is exactly zero (exact-in). */
  minimumOutputTokenIsZero: boolean;
}): boolean {
  // A zero minimum output offers no execution protection at all, so it is
  // gated regardless of fiat pricing availability. (Chain-side ValidateBasic
  // rejects a zero token_out_min_amount, so such a swap can only fail; the
  // user should learn that here rather than from a failed transaction.)
  if (quoteType === "out-given-in" && minimumOutputTokenIsZero) return true;

  // Without fiat pricing on both legs the value comparison is meaningless.
  if (inputUsd === undefined || minimumOutputUsd === undefined) return false;

  // Sub-$1 trades are exempt.
  if (inputUsd <= 1) return false;

  // For in-given-out the fixed output's fiat value falls back to $0 while its
  // spot price loads; the output amount itself is user-fixed, so a real zero
  // cannot occur on this side.
  if (quoteType === "in-given-out" && minimumOutputUsd <= 0) return false;

  return minimumOutputUsd < inputUsd * ExtremeValueDisparityThreshold;
}

/** Computes the suggested slippage tier from a quote (pure, no side effects). */
export function computeSuggestedSlippage(
  quote: SuggestedSlippageQuote | undefined
): string {
  if (!quote) return DefaultSlippage;

  const rawImpact = quote.priceImpactTokenOut?.toDec() ?? new Dec(0);
  // SQS computes priceImpact as (effectiveOutOverIn / spotOutOverIn) - 1 for
  // both quote directions. Adverse trades always yield a negative value:
  //   out-given-in: user receives less out than spot → ratio < 1 → negative
  //   in-given-out: buyer receives less out per in than spot → ratio < 1 → negative
  // Clamp favorable (positive) values to zero so they don't inflate the tier.
  const priceImpact = rawImpact.isNegative() ? rawImpact.abs() : new Dec(0);
  const tokens = quote.tokens;
  const lowestLiquidityCap =
    tokens && tokens.length > 0
      ? tokens.slice(1).reduce((min, t) => {
          const cap = new Dec(t.liquidity_cap);
          return cap.lt(min) ? cap : min;
        }, new Dec(tokens[0].liquidity_cap))
      : undefined;

  for (const tier of [...DYNAMIC_SLIPPAGE_TIERS].reverse()) {
    if (
      priceImpact.gte(tier.minPriceImpact) ||
      (lowestLiquidityCap !== undefined &&
        lowestLiquidityCap.lte(tier.maxLiquidityCap))
    ) {
      return tier.slippage;
    }
  }

  return DefaultSlippage;
}
