import { Dec } from "@osmosis-labs/unit";

import { api } from "~/utils/trpc";

/**
 * Price-ratio guard for orderbook creation with an 18-decimal base against a
 * 6-decimal quote: the orderbook contract's tick math needs the base to be
 * worth at least 100 quote units, or orders on the book cannot be priced.
 *
 * Fails closed: `isBlocked` is true while either price is loading, being
 * refetched in the background, or in an error state, and when a price is
 * missing or zero. React Query keeps serving cached data through a refetch and
 * after a failed refetch, so `isLoading` alone would let a stale permissive
 * price through; only a settled, successful pair of prices can unblock a paid
 * creation. Callers that render a create affordance and callers that confirm
 * the creation should both consult this, so the check cannot go stale between
 * the two.
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

  const {
    data: basePrice,
    isLoading: isBasePriceLoading,
    isFetching: isBasePriceFetching,
    isError: isBasePriceError,
  } = api.edge.assets.getAssetPrice.useQuery(
    { coinMinimalDenom: baseDenom },
    { enabled: is18DecimalBase && !!baseDenom }
  );
  const {
    data: quotePrice,
    isLoading: isQuotePriceLoading,
    isFetching: isQuotePriceFetching,
    isError: isQuotePriceError,
  } = api.edge.assets.getAssetPrice.useQuery(
    { coinMinimalDenom: quoteDenom },
    { enabled: is18DecimalBase && !!quoteDenom }
  );

  const isBlocked =
    is18DecimalBase &&
    (isBasePriceLoading ||
      isQuotePriceLoading ||
      isBasePriceFetching ||
      isQuotePriceFetching ||
      isBasePriceError ||
      isQuotePriceError ||
      basePrice === undefined ||
      quotePrice === undefined ||
      quotePrice.toDec().isZero() ||
      basePrice.toDec().quo(quotePrice.toDec()).lt(new Dec(100)));

  return { is18DecimalBase, isBlocked };
}
