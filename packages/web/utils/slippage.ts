import { QuoteDirection } from "@osmosis-labs/tx";
import { Dec } from "@osmosis-labs/unit";

import { AutoSlippageTiers, DefaultSlippage } from "~/config/swap";

/** Minimal slice of a router quote needed to pick a slippage tier. */
export interface AutoSlippageQuote {
  priceImpactTokenOut?: { toDec(): Dec };
  /** Summed USD liquidity of the route's pools. "0" when the router could
   *  not price them. */
  liquidityCap?: string;
  liquidityCapOverflow?: boolean;
}

/** Where the slippage being submitted came from. */
export type SlippageSource = "user" | "fee-error" | "auto" | "default";

/** Parses a route liquidity cap. Zero, missing or unparseable values are
 *  unknown (the router reports "0" when it cannot price a pool), and an
 *  overflow means the route is deeper than an int can hold. */
function parseRouteLiquidity(
  quote: AutoSlippageQuote
): Dec | "deep" | undefined {
  if (quote.liquidityCapOverflow) return "deep";
  if (!quote.liquidityCap) return undefined;
  try {
    const cap = new Dec(quote.liquidityCap);
    return cap.isPositive() ? cap : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Picks the slippage tier for an exact-in quote.
 *
 * Price impact is the primary signal and route liquidity a secondary one.
 * When route liquidity is unknown it contributes nothing, so the tier comes
 * from price impact alone and `liquidityUnknown` is set so the review can say
 * so; an unknown route is never treated as thin, which would silently widen
 * the tolerance on what may be a deep route.
 */
export function computeAutoSlippage(quote: AutoSlippageQuote | undefined): {
  slippage: string;
  liquidityUnknown: boolean;
} {
  if (!quote) return { slippage: DefaultSlippage, liquidityUnknown: false };

  // SQS reports adverse impact as negative for both directions. Favourable
  // (positive) impact is clamped to zero so it never inflates the tier.
  let priceImpact = new Dec(0);
  try {
    const rawImpact = quote.priceImpactTokenOut?.toDec();
    if (rawImpact?.isNegative()) priceImpact = rawImpact.abs();
  } catch {
    // Unreadable impact contributes nothing.
  }

  const routeLiquidity = parseRouteLiquidity(quote);
  const liquidityUnknown = routeLiquidity === undefined;

  for (let i = AutoSlippageTiers.length - 1; i >= 0; i--) {
    const tier = AutoSlippageTiers[i];
    const thinRoute =
      routeLiquidity !== undefined &&
      routeLiquidity !== "deep" &&
      routeLiquidity.lte(tier.maxRouteLiquidityUsd);
    if (priceImpact.gte(tier.minPriceImpact) || thinRoute) {
      return { slippage: tier.slippage, liquidityUnknown };
    }
  }

  return { slippage: DefaultSlippage, liquidityUnknown };
}

/** Extracts the numerical values from the swap required error
 *
 * e.g. Error: Fetch error. failed to execute message; message index: 0:
 * Swap requires 498419192699272362737ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877,
 * which is greater than the amount 497246119581463551214ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877:
 * token amount calculated is greater than max amount at (/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut)
 *
 * returns ["498419192699272362737", "497246119581463551214"]
 */
export function extractSwapRequiredErrorAmounts(str: string) {
  const regex = /^\d+/;
  const split = str
    .split(" ")
    .map((s) => {
      const stripped = s.replace("(", "").replace(")", "");
      if (regex.test(stripped)) {
        return stripped.match(regex)?.[0] ?? undefined;
      }
    })
    .filter(Boolean);

  return [split[1], split[2]];
}

/**
 * The slippage tier an exact-out fee simulation error says the swap needs,
 * or undefined when the error is not a slippage shortfall.
 *
 * The simulation reports the input the swap requires and the maximum input
 * the current tolerance allows. The required tolerance is snapped up to the
 * nearest tier, or the widest tier when beyond all of them. Nothing is
 * suggested once the current tolerance is already 5% or more.
 */
export function slippageRequiredByFeeError({
  errorMessage,
  quoteType,
  currentSlippage,
}: {
  errorMessage: string | undefined;
  quoteType: QuoteDirection;
  /** Current tolerance as a fraction, e.g. 0.001 for 0.1%. */
  currentSlippage: Dec;
}): string | undefined {
  if (quoteType !== "in-given-out" || !errorMessage) return;
  if (
    !errorMessage.includes("Swap requires") &&
    !errorMessage.includes("is greater than max amount")
  )
    return;

  const [required, sent] = extractSwapRequiredErrorAmounts(errorMessage);
  if (!required || !sent) return;

  const onePlusSlippage = new Dec(1).add(currentSlippage);
  if (onePlusSlippage.gte(new Dec("1.05"))) return;

  const amountPreSlippage = new Dec(sent).quo(onePlusSlippage);
  if (!amountPreSlippage.isPositive()) return;
  const requiredFraction = new Dec(required)
    .quo(amountPreSlippage)
    .sub(new Dec(1));
  if (requiredFraction.lte(currentSlippage)) return;

  const tier =
    AutoSlippageTiers.find(({ slippage }) =>
      new Dec(slippage).quo(new Dec(100)).gte(requiredFraction)
    ) ?? AutoSlippageTiers[AutoSlippageTiers.length - 1];
  return tier.slippage;
}

/**
 * Resolves the slippage the swap submits, in priority order: a value the
 * user typed, a tier a fee simulation error requires, the auto tier, then
 * {@link DefaultSlippage}. Exact-out quotes take no auto tier: their impact
 * and fee data come from an inverted exact-in quote and can't be trusted for
 * tier selection.
 */
export function resolveSwapSlippage({
  userSlippage,
  feeErrorSlippage,
  autoSlippage,
  quoteType,
}: {
  userSlippage: string | undefined;
  feeErrorSlippage: string | undefined;
  autoSlippage: string;
  quoteType: QuoteDirection;
}): { slippage: string; source: SlippageSource } {
  if (userSlippage !== undefined) {
    return { slippage: userSlippage, source: "user" };
  }
  if (feeErrorSlippage !== undefined) {
    return { slippage: feeErrorSlippage, source: "fee-error" };
  }
  if (quoteType === "out-given-in" && autoSlippage !== DefaultSlippage) {
    return { slippage: autoSlippage, source: "auto" };
  }
  return { slippage: DefaultSlippage, source: "default" };
}
