import { MutableRefObject, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useRecommendedAssets } from "~/hooks/swap/use-recommended-assets";
import { useDebouncedState } from "~/hooks/use-debounced-state";
import { useWallets } from "~/hooks/use-wallets";
import { useSwapStore } from "~/stores/swap";
import { api, RouterOutputs } from "~/utils/trpc";

export type UseSwapAssetsReturn = ReturnType<typeof useSwapAssets>;

/** Use assets for swapping: the from and to assets, as well as the list of
 *  swappable assets. Sorts by balance if user is signed in.
 *
 *  Features:
 *  * Option to store from and to assets in query params, default = yes
 *  * Paginated swappable assets, with user balances if wallet connected
 *  * Assets search query */
export function useSwapAssets({
  useOtherCurrencies = true,
  poolId,
  existingAssetsRef,
}: {
  useOtherCurrencies?: boolean;
  poolId?: string;
  // Keep a ref with the existing assets to avoid layout jumps while changing tokens.
  existingAssetsRef?: MutableRefObject<
    RouterOutputs["local"]["assets"]["getUserAsset"][]
  >;
} = {}) {
  const { currentWallet } = useWallets();
  const { switchAssets, fromAsset, toAsset } = useSwapStore(
    useShallow((state) => ({
      fromAsset: state.fromAsset,
      toAsset: state.toAsset,
      switchAssets: state.switchAssets,
    }))
  );

  // generate debounced search from user inputs
  const assetSearchInput = useSwapStore((state) => state.assetSearchInput);
  const [debouncedSearchInput, setDebouncedSearchInput] =
    useDebouncedState<string>("", 500);

  useEffect(() => {
    setDebouncedSearchInput(assetSearchInput);
  }, [setDebouncedSearchInput, assetSearchInput]);

  const queryInput = useMemo(
    () => (debouncedSearchInput ? { query: debouncedSearchInput } : undefined),
    [debouncedSearchInput]
  );

  const canLoadAssets = useOtherCurrencies;

  const queryParams = useMemo(
    () => ({
      poolId,
      search: queryInput,
      userOsmoAddress: currentWallet?.address,
      limit: 50, // items per page
    }),
    [poolId, queryInput, currentWallet?.address]
  );

  const queryOptions = useMemo(
    () => ({
      enabled: canLoadAssets,
      getNextPageParam: (lastPage: any) => lastPage.nextCursor,
      initialCursor: 0,

      // avoid blocking
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }),
    [canLoadAssets]
  );

  const {
    data: selectableAssetPages,
    isLoading: isLoadingSelectAssets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.local.assets.getUserAssets.useInfiniteQuery(
    queryParams,
    queryOptions
  );

  const selectableAssets = useMemo(
    () =>
      useOtherCurrencies
        ? selectableAssetPages?.pages.flatMap(({ items }) => items) ?? []
        : [],
    [selectableAssetPages?.pages, useOtherCurrencies]
  );

  if (existingAssetsRef) {
    existingAssetsRef.current = selectableAssets;
  }

  const recommendedAssetsParams = useMemo(
    () => ({
      fromCoinMinimalDenom: fromAsset?.coinMinimalDenom,
      toCoinMinimalDenom: toAsset?.coinMinimalDenom,
    }),
    [fromAsset?.coinMinimalDenom, toAsset?.coinMinimalDenom]
  );

  const recommendedAssets = useRecommendedAssets(
    recommendedAssetsParams.fromCoinMinimalDenom,
    recommendedAssetsParams.toCoinMinimalDenom
  );

  return useMemo(
    () => ({
      selectableAssets,
      isLoadingSelectAssets,
      hasNextPageAssets: hasNextPage,
      isFetchingNextPageAssets: isFetchingNextPage,
      /** Recommended assets, with to and from tokens filtered. */
      recommendedAssets,
      switchAssets,
      fetchNextPageAssets: fetchNextPage,
    }),
    [
      selectableAssets,
      isLoadingSelectAssets,
      hasNextPage,
      isFetchingNextPage,
      recommendedAssets,
      switchAssets,
      fetchNextPage,
    ]
  );
}
