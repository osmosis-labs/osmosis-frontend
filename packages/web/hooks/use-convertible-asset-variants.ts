import {
  type AssetVariant,
  filterConvertibleAssetVariants,
  getAlloyContractAddresses,
} from "@osmosis-labs/server";
import { useMemo } from "react";

import { api } from "~/utils/trpc";

/**
 * The connected wallet's variants that convert 1:1 into an active alloy. The
 * portfolio supplies the candidates; transmuter statuses are a separate,
 * longer-lived query (also invalidated after every tx), so they never hold up
 * the portfolio and rows that remount (virtualized tables) don't refetch
 * either.
 *
 * `assetVariants` stays undefined until both have loaded. A failed status
 * lookup comes back inactive from the server, so its variants are dropped
 * rather than offered.
 */
export function useConvertibleAssetVariants({
  address,
  enabled = true,
  staleTime = 30_000,
  refetchOnWindowFocus = false,
}: {
  address: string | undefined;
  enabled?: boolean;
  /** For the portfolio query; the status query keeps its own minute. */
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}) {
  const portfolioQuery = api.local.portfolio.getPortfolioAssets.useQuery(
    { address: address ?? "" },
    { enabled: enabled && Boolean(address), staleTime, refetchOnWindowFocus }
  );
  const candidates = portfolioQuery.data?.assetVariantCandidates;

  const contractAddresses = useMemo(
    () => getAlloyContractAddresses(candidates ?? []),
    [candidates]
  );
  const statusQuery = api.local.portfolio.getAlloyStatuses.useQuery(
    { contractAddresses },
    {
      enabled: enabled && contractAddresses.length > 0,
      // A failed lookup comes back inactive, so it must be refetchable: once
      // a minute old, a refocus or remount refreshes it (the server caches
      // failures for 30s, so this can't hammer a struggling node).
      staleTime: 60_000,
    }
  );

  const assetVariants = useMemo((): AssetVariant[] | undefined => {
    if (!candidates) return undefined;
    if (contractAddresses.length === 0) return [];
    if (!statusQuery.data) return undefined;
    return filterConvertibleAssetVariants(candidates, statusQuery.data);
  }, [candidates, contractAddresses, statusQuery.data]);

  const needsStatuses = contractAddresses.length > 0;
  return {
    assetVariants,
    portfolioQuery,
    isLoading:
      portfolioQuery.isLoading || (needsStatuses && statusQuery.isLoading),
    isFetching:
      portfolioQuery.isFetching || (needsStatuses && statusQuery.isFetching),
    isError: portfolioQuery.isError || (needsStatuses && statusQuery.isError),
    error: portfolioQuery.error ?? (needsStatuses ? statusQuery.error : null),
  };
}
