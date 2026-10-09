import { api } from "~/utils/trpc";

/** Fetches fiat prices for a list of denoms in a single request, keyed by
 *  `coinMinimalDenom`. Assets without a price are absent from the map. */
export function useBatchedPrices(
  coinMinimalDenoms: string[],
  options?: { enabled?: boolean }
) {
  // `gamm` shares have no price, same as `usePrice`.
  const denoms = Array.from(
    new Set(coinMinimalDenoms.filter((denom) => !denom.startsWith("gamm")))
  ).sort();

  const { data: prices, ...otherUtils } =
    api.edge.assets.getAssetPrices.useQuery(
      { coinMinimalDenoms: denoms },
      {
        enabled: (options?.enabled ?? true) && denoms.length > 0,
        gcTime: 1000 * 60, // 1 minute
        staleTime: 1000 * 3, // 3 second
      }
    );

  return { prices, ...otherUtils };
}
