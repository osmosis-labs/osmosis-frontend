import { Dec } from "@osmosis-labs/unit";

import { api } from "~/utils/trpc";

/**
 * Price-ratio guard for orderbook creation with an 18-decimal base against a
 * 6-decimal quote: the orderbook contract's tick math needs the base to be
 * worth at least 100 quote units, or orders on the book cannot be priced.
 *
 * Fails closed: `isBlocked` is true while prices are still loading or missing,
 * so a verdict that arrives after the user clicked cannot be skipped. Callers
 * that render a create affordance and callers that confirm the paid creation
 * should both consult this, so the check cannot go stale between the two.
 */
export function useOrderbookRatioGuard({
  baseDenom,
  quoteDenom,
  baseDecimals,
  quoteDecimals,
}: {
  baseDenom: string;
  quoteDenom: string;
  baseDecimals?: number;
  quoteDecimals?: number;
}) {
  const is18DecimalBase = baseDecimals === 18 && quoteDecimals === 6;

  const { data: basePrice, isLoading: isBasePriceLoading } =
    api.edge.assets.getAssetPrice.useQuery(
      { coinMinimalDenom: baseDenom },
      { enabled: is18DecimalBase && !!baseDenom }
    );
  const { data: quotePrice, isLoading: isQuotePriceLoading } =
    api.edge.assets.getAssetPrice.useQuery(
      { coinMinimalDenom: quoteDenom },
      { enabled: is18DecimalBase && !!quoteDenom }
    );

  const isBlocked =
    is18DecimalBase &&
    (isBasePriceLoading ||
      isQuotePriceLoading ||
      basePrice === undefined ||
      quotePrice === undefined ||
      quotePrice.toDec().isZero() ||
      basePrice.toDec().quo(quotePrice.toDec()).lt(new Dec(100)));

  return { is18DecimalBase, isBlocked };
}
