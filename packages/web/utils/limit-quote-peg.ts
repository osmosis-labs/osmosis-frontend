import { Dec } from "@osmosis-labs/unit";

/** How far the limit order's quote asset is from $1. The limit tool prices
 *  every quote at exactly $1. */
export type QuotePegStatus = "ok" | "warn" | "block" | "unknown";

export const QUOTE_PEG_WARN_DEVIATION = new Dec("0.01");
export const QUOTE_PEG_BLOCK_DEVIATION = new Dec("0.05");

/**
 * Checks the quote's peg from two prices:
 * - its onchain (SQS) price, quoted in allUSDC like the base asset's spot
 *   price. The order's tick is off from the chosen price by exactly this
 *   factor, so it alone can block.
 * - USDC's USD price (CoinGecko). It only makes the "$" labels approximate,
 *   so moving off $1 warns but never blocks: the order still rests where the
 *   user put it relative to the market.
 *
 * Unknown when the onchain price is unknown; a missing USDC price skips only
 * the label check.
 *
 * @returns the status and the quote's best-known USD price, for display.
 */
export function getQuotePeg(
  quoteOnchainPrice: Dec | undefined,
  usdcUsdPrice: Dec | undefined
): { status: QuotePegStatus; usdPrice?: Dec } {
  if (!quoteOnchainPrice?.isPositive()) return { status: "unknown" };

  const usdPrice = usdcUsdPrice?.isPositive()
    ? quoteOnchainPrice.mul(usdcUsdPrice)
    : quoteOnchainPrice;
  const onchainDeviation = quoteOnchainPrice.sub(new Dec(1)).abs();
  const usdDeviation = usdPrice.sub(new Dec(1)).abs();

  if (onchainDeviation.gte(QUOTE_PEG_BLOCK_DEVIATION))
    return { status: "block", usdPrice };
  if (
    onchainDeviation.gte(QUOTE_PEG_WARN_DEVIATION) ||
    usdDeviation.gte(QUOTE_PEG_WARN_DEVIATION)
  )
    return { status: "warn", usdPrice };
  return { status: "ok", usdPrice };
}
