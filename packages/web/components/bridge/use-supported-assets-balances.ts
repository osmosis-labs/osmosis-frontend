import { useCallback, useMemo } from "react";

import {
  chunkBridgeBalanceSource,
  MAX_BRIDGE_BALANCE_BATCH_SIZE,
  selectDisplayableBalances,
} from "~/components/bridge/bridge-balance-batching";
import { api, type RouterInputs, type RouterOutputs } from "~/utils/trpc";

export type BridgeBalanceSource =
  RouterInputs["local"]["bridgeTransfer"]["getSupportedAssetsBalances"]["source"];
export type BridgeAssetBalance =
  RouterOutputs["local"]["bridgeTransfer"]["getSupportedAssetsBalances"][number];

/**
 * Fetches source-chain bridge asset balances in bounded batches of at most
 * `MAX_BRIDGE_BALANCE_BATCH_SIZE` assets and merges the results into a single
 * list. Uses `api.useQueries` so React Query caching, `trpc-persist`
 * exclusions, and `getSupportedAssetsBalances.invalidate()` work identically
 * across every batch.
 */
export function useSupportedAssetsBalances({
  source,
  enabled,
}: {
  source: BridgeBalanceSource | undefined;
  enabled: boolean;
}) {
  const batches = useMemo(
    () =>
      enabled
        ? chunkBridgeBalanceSource(source, MAX_BRIDGE_BALANCE_BATCH_SIZE)
        : [],
    [enabled, source]
  );

  const queries = api.useQueries((t) =>
    batches.map((batch) =>
      t.local.bridgeTransfer.getSupportedAssetsBalances(
        { source: batch },
        { enabled }
      )
    )
  );

  const isLoading = enabled && queries.some((q) => q.isLoading);
  const isFetching = enabled && queries.some((q) => q.isFetching);
  const isError = enabled && queries.some((q) => q.isError);

  const allBalances = useMemo<BridgeAssetBalance[] | undefined>(() => {
    if (!enabled || queries.length === 0 || isError) return undefined;
    if (!queries.every((q) => q.data !== undefined)) return undefined;
    return queries.flatMap((q) => q.data ?? []);
  }, [enabled, isError, queries]);

  const data = useMemo(
    () => (allBalances ? selectDisplayableBalances(allBalances) : undefined),
    [allBalances]
  );

  const refetch = useCallback(
    () => Promise.all(queries.map((q) => q.refetch())),
    [queries]
  );

  return {
    data,
    allBalances,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
