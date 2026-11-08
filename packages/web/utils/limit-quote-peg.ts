import { Dec } from "@osmosis-labs/unit";

/** How far the limit order's quote asset is from $1. The limit tool prices
 *  every quote at exactly $1. */
export type QuotePegStatus = "ok" | "warn" | "block" | "unknown";

const QUOTE_PEG_WARN_DEVIATION = new Dec("0.01");
const QUOTE_PEG_BLOCK_DEVIATION = new Dec("0.05");

/**
 * Checks the quote's onchain (SQS) price, quoted in allUSDC like the base
 * asset's spot price. The order's tick is off from the chosen price by
 * exactly this factor. Unknown when the price is unknown.
 */
export function getQuotePegStatus(
  quoteOnchainPrice: Dec | undefined
): QuotePegStatus {
  if (!quoteOnchainPrice?.isPositive()) return "unknown";

  const deviation = quoteOnchainPrice.sub(new Dec(1)).abs();
  if (deviation.gte(QUOTE_PEG_BLOCK_DEVIATION)) return "block";
  if (deviation.gte(QUOTE_PEG_WARN_DEVIATION)) return "warn";
  return "ok";
}
