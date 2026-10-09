import type { PricePretty } from "@osmosis-labs/unit";

import { api } from "~/utils/trpc";

/** Matches the `getAssetPrices` input limit. */
const MAX_DENOMS_PER_REQUEST = 100;

/** Merges the batches' price maps. Module-level so React Query only reruns it
 *  when a batch's result changes. */
function combinePriceBatches(
  results: { data?: Record<string, PricePretty>; isLoading: boolean }[]
) {
  const loaded = results.flatMap(({ data }) => (data ? [data] : []));
  return {
    prices:
      loaded.length > 0
        ? Object.assign({} as Record<string, PricePretty>, ...loaded)
        : undefined,
    isLoading: results.some(({ isLoading }) => isLoading),
  };
}

/** Fetches fiat prices for a list of denoms, keyed by `coinMinimalDenom`.
 *  Lists longer than the procedure's limit are split across requests.
 *  Assets without a price are absent from the map. */
export function useBatchedPrices(
  coinMinimalDenoms: string[],
  options?: { enabled?: boolean }
) {
  // `gamm` shares have no price, same as `usePrice`.
  const denoms = Array.from(
    new Set(coinMinimalDenoms.filter((denom) => !denom.startsWith("gamm")))
  ).sort();

  const batches: string[][] = [];
  for (let i = 0; i < denoms.length; i += MAX_DENOMS_PER_REQUEST) {
    batches.push(denoms.slice(i, i + MAX_DENOMS_PER_REQUEST));
  }

  const enabled = options?.enabled ?? true;
  return api.useQueries(
    (t) =>
      batches.map((batch) =>
        t.edge.assets.getAssetPrices(
          { coinMinimalDenoms: batch },
          {
            enabled,
            gcTime: 1000 * 60, // 1 minute
            staleTime: 1000 * 3, // 3 second
          }
        )
      ),
    { combine: combinePriceBatches }
  );
}
