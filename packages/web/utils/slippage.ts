import { Dec } from "@osmosis-labs/unit";

import { DefaultSlippage, DYNAMIC_SLIPPAGE_TIERS } from "~/config/swap";

/** Minimal slice of a router quote needed to suggest a slippage tier. */
export interface SuggestedSlippageQuote {
  priceImpactTokenOut?: { toDec(): Dec };
  tokens?: { liquidity_cap: string }[];
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
