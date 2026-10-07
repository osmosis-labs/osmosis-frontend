import { Dec, Int } from "@osmosis-labs/unit";

import { api } from "~/utils/trpc";

/**
 * Lowest price per minimal unit (quote minimal units per base minimal unit) a
 * creatable orderbook may have: 100x headroom over the contract's MIN_TICK
 * price floor of 1e-12, below which orders on the book cannot be priced.
 */
const MIN_PRICE_PER_MINIMAL_UNIT = new Dec("0.0000000001");

/**
 * Price-ratio guard for orderbook creation when the base has more decimals
 * than the quote. The book prices in minimal units, so a display price P
 * becomes P × 10^(quoteDecimals − baseDecimals); with a large decimals gap
 * (e.g. an 18-decimal base against a 6- or 8-decimal quote) a modestly priced
 * base falls under the tick floor and the book cannot price orders. For 18/6
 * this is the base being worth at least 100 quote units.
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
  // With equal or fewer base decimals the minimal-unit price is at least the
  // display price, so only a base with more decimals can fall under the floor.
  const needsRatioCheck =
    baseDecimals !== undefined &&
    quoteDecimals !== undefined &&
    baseDecimals > quoteDecimals;

  const {
    data: basePrice,
    isLoading: isBasePriceLoading,
    isFetching: isBasePriceFetching,
    isError: isBasePriceError,
  } = api.edge.assets.getAssetPrice.useQuery(
    { coinMinimalDenom: baseDenom },
    { enabled: needsRatioCheck && !!baseDenom }
  );
  const {
    data: quotePrice,
    isLoading: isQuotePriceLoading,
    isFetching: isQuotePriceFetching,
    isError: isQuotePriceError,
  } = api.edge.assets.getAssetPrice.useQuery(
    { coinMinimalDenom: quoteDenom },
    { enabled: needsRatioCheck && !!quoteDenom }
  );

  const isSettled =
    !isBasePriceLoading &&
    !isQuotePriceLoading &&
    !isBasePriceFetching &&
    !isQuotePriceFetching &&
    !isBasePriceError &&
    !isQuotePriceError &&
    basePrice !== undefined &&
    quotePrice !== undefined;

  /** Settled prices put the book under the tick floor (or quote price is 0). */
  const isRatioTooLow =
    needsRatioCheck &&
    isSettled &&
    (quotePrice.toDec().isZero() ||
      basePrice
        .toDec()
        .quo(quotePrice.toDec())
        .mul(new Dec(10).pow(new Int(quoteDecimals - baseDecimals)))
        .lt(MIN_PRICE_PER_MINIMAL_UNIT));

  const isBlocked = needsRatioCheck && (!isSettled || isRatioTooLow);

  return { needsRatioCheck, isBlocked, isRatioTooLow };
}
