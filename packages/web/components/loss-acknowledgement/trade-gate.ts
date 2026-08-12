import type { TxFeMemoFlags } from "@osmosis-labs/stores";
import type { QuoteDirection } from "@osmosis-labs/tx";
import { Dec, RatePretty } from "@osmosis-labs/unit";

import {
  LossFigures,
  normalizePriceImpact,
} from "~/components/loss-acknowledgement";
import { HighPriceImpactGate, HighSlippageGate } from "~/config/trade-warnings";

/** A trade's order type, as the review-order modal already models it. */
export type TradeOrderType = "market" | "limit";

export interface TradeWarningInput {
  /**
   * Price impact from the router quote. Sign is normalized here, so callers
   * pass the quote's value through untouched.
   */
  priceImpactTokenOut?: RatePretty;
  /** Configured slippage tolerance as a fraction (0..1), e.g. 0.005 = 0.5%. */
  slippage?: Dec;
  /** True limit order priced across the opposite side of the book. */
  isBeyondOppositePrice?: boolean;
  /**
   * Signed distance between the limit price and spot (`price / spot - 1`).
   * Magnitude only is used; the sign just reflects the order direction.
   */
  percentAdjusted?: Dec;
  orderType?: TradeOrderType;
}

/**
 * The single source of truth for which loss warnings a trade triggers, shared by
 * the review-order modal and the alloy conversion modal (MTN-150).
 *
 * Returns the figure/warning half of `LossFigures`, so a surface builds its
 * acknowledgement input as `{ identityKey, ...getTradeWarnings(...) }` and the
 * displayed warning and the gated figure cannot drift apart.
 *
 * Two behaviours are deliberate and load-bearing:
 *
 * - **Price impact is normalized to a magnitude.** Router quotes report impact
 *   negatively (`Quote.priceImpactTokenOut`), and every gate assumes larger =
 *   worse, so an un-normalized figure fails `gte` silently and the gate simply
 *   never fires. That is the bug this indirection exists to prevent.
 * - **Missing price-impact data fails open**, never closed: no impact figure
 *   means no impact gate, rather than a checkbox the user has no way to clear.
 *   Slippage is gated independently, so a quote without impact data is still
 *   gated on the tolerance the user chose.
 */
export function getTradeWarnings({
  priceImpactTokenOut,
  slippage,
  isBeyondOppositePrice,
  percentAdjusted,
  orderType,
}: TradeWarningInput): Omit<LossFigures, "identityKey"> {
  const priceImpact = priceImpactTokenOut
    ? normalizePriceImpact(priceImpactTokenOut.toDec())
    : undefined;
  const tolerance = slippage ?? new Dec(0);

  // Only a true limit order can be priced past the book; a market-type order
  // fills at market by definition and has nothing to acknowledge here.
  const warnMarketFill =
    orderType === "limit" && Boolean(isBeyondOppositePrice);

  return {
    slippage: tolerance,
    warnSlippage: tolerance.gte(HighSlippageGate),

    priceImpact: priceImpact ?? new Dec(0),
    warnPriceImpact: priceImpact?.gte(HighPriceImpactGate) ?? false,

    marketFillDistance:
      warnMarketFill && percentAdjusted
        ? normalizePriceImpact(percentAdjusted)
        : undefined,
    warnMarketFill,
  };
}

/**
 * A trade's tx auth-memo flags (MTN-137), derived from the acknowledged basis
 * rather than from live figures — see `deriveBridgeMemoFlags`, which this
 * mirrors for the other surface.
 *
 * The mapping differs from the bridge's in one important way: `slippage` here is
 * the tolerance the user allowed, so it stamps `slip=`, never `loss=`. `loss=`
 * means a realized total loss and must not appear on a trade.
 */
export function deriveTradeMemoFlags(
  basis: LossFigures | null
): TxFeMemoFlags | undefined {
  if (!basis) return undefined;

  const flags: TxFeMemoFlags = {};
  if (basis.warnPriceImpact) flags.priceImpact = basis.priceImpact;
  if (basis.warnSlippage) flags.slippageTolerance = basis.slippage;
  if (basis.warnMarketFill && basis.marketFillDistance) {
    flags.marketFillDistance = basis.marketFillDistance;
  }

  return Object.keys(flags).length > 0 ? flags : undefined;
}

/**
 * Whether the live quote has moved far enough against the user, since the quote
 * they are reviewing, to be worth re-confirming (MTN-150).
 *
 * The comparison is **relative**. Its predecessor subtracted two human-unit token
 * amounts and compared the difference against a slippage *fraction* like 0.005,
 * so the banner's behaviour depended entirely on the denom's scale: for a
 * BTC-scale asset with amounts around 0.001 the difference could never reach
 * 0.005 and the banner never appeared, while for a large-supply token any 0.5%
 * move dwarfed 0.005 and it always did.
 *
 * Direction depends on the quote type, and getting it wrong is silent: worsening
 * means receiving less for `out-given-in`, but paying more for `in-given-out`. A
 * subtraction fixed in one direction simply never fires for half of all quotes.
 *
 * `initial` of zero returns false rather than dividing by it — an unpriced or
 * still-loading quote is not drift.
 */
export function hasQuoteDriftedBeyondSlippage({
  initial,
  current,
  slippageTolerance,
  quoteType = "out-given-in",
}: {
  initial?: Dec;
  current?: Dec;
  slippageTolerance?: Dec;
  quoteType?: QuoteDirection;
}): boolean {
  if (!initial || !current || !slippageTolerance) return false;
  if (!initial.isPositive()) return false;

  const worsening =
    quoteType === "in-given-out" ? current.sub(initial) : initial.sub(current);

  return worsening.quo(initial).gte(slippageTolerance);
}
