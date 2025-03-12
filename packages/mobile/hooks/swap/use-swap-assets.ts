import { isNil } from "@osmosis-labs/utils";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useRecommendedAssets } from "~/hooks/swap/use-recommended-assets";
import { useSwapAsset } from "~/hooks/swap/use-swap-asset";
import { useDebouncedState } from "~/hooks/use-debounced-state";
import { useWallets } from "~/hooks/use-wallets";
import { useSwapStore } from "~/stores/swap";
import { api } from "~/utils/trpc";

const DefaultDenoms = ["ATOM", "OSMO"];

export type UseSwapAssetsReturn = ReturnType<typeof useSwapAssets>;

/** Use assets for swapping: the from and to assets, as well as the list of
 *  swappable assets. Sorts by balance if user is signed in.
 *
 *  Features:
 *  * Option to store from and to assets in query params, default = yes
 *  * Paginated swappable assets, with user balances if wallet connected
 *  * Assets search query */
export function useSwapAssets({
  initialFromDenom = DefaultDenoms[0],
  initialToDenom = DefaultDenoms[1],
  useOtherCurrencies = true,
  poolId,
}: {
  initialFromDenom?: string;
  initialToDenom?: string;
  useQueryParams?: boolean;
  useOtherCurrencies?: boolean;
  poolId?: string;
} = {}) {
  const { currentWallet } = useWallets();
  const {
    fromAsset: storeFromAsset,
    toAsset: storeToAsset,
    setFromAsset,
    setToAsset,
    fromAssetDenom,
    toAssetDenom,
    setFromAssetDenom,
    setToAssetDenom,
    switchAssets,
  } = useSwapStore(
    useShallow((state) => ({
      fromAsset: state.fromAsset,
      toAsset: state.toAsset,
      setFromAsset: state.setFromAsset,
      setToAsset: state.setToAsset,
      fromAssetDenom: state.fromAssetDenom,
      toAssetDenom: state.toAssetDenom,
      setFromAssetDenom: state.setFromAssetDenom,
      setToAssetDenom: state.setToAssetDenom,
      switchAssets: state.switchAssets,
    }))
  );

  // Update state when initial values change
  useEffect(() => {
    setFromAssetDenom(initialToDenom);
    setToAssetDenom(initialFromDenom);
  }, [initialFromDenom, initialToDenom, setFromAssetDenom, setToAssetDenom]);

  // generate debounced search from user inputs
  const [assetsQueryInput, setAssetsQueryInput] = useState<string>("");
  const [debouncedSearchInput, setDebouncedSearchInput] =
    useDebouncedState<string>("", 500);

  useEffect(() => {
    setDebouncedSearchInput(assetsQueryInput);
  }, [setDebouncedSearchInput, assetsQueryInput]);

  const queryInput = useMemo(
    () => (debouncedSearchInput ? { query: debouncedSearchInput } : undefined),
    [debouncedSearchInput]
  );

  const canLoadAssets = useMemo(
    () =>
      Boolean(fromAssetDenom) && Boolean(toAssetDenom) && useOtherCurrencies,
    [fromAssetDenom, toAssetDenom, useOtherCurrencies]
  );

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

  const swapAssetParams = useMemo(
    () => ({
      minDenomOrSymbol: fromAssetDenom,
      existingAssets: selectableAssets,
    }),
    [fromAssetDenom, selectableAssets]
  );

  const toSwapAssetParams = useMemo(
    () => ({
      minDenomOrSymbol: toAssetDenom,
      existingAssets: selectableAssets,
    }),
    [toAssetDenom, selectableAssets]
  );

  const { asset: fromAsset } = useSwapAsset(swapAssetParams);
  const { asset: toAsset } = useSwapAsset(toSwapAssetParams);

  // Update the store when assets change
  useEffect(() => {
    // Only update if the assets have changed
    if (fromAsset?.coinMinimalDenom !== storeFromAsset?.coinMinimalDenom) {
      setFromAsset(fromAsset);
    }

    if (toAsset?.coinMinimalDenom !== storeToAsset?.coinMinimalDenom) {
      setToAsset(toAsset);
    }
  }, [
    fromAsset,
    toAsset,
    storeFromAsset,
    storeToAsset,
    setFromAsset,
    setToAsset,
  ]);

  /**
   * This effect handles the scenario where the selected asset denoms do not correspond to any available
   * assets (`fromAsset` or `toAsset` are undefined). It attempts to set a default based on
   *
   * predefined DefaultDenoms or initial denoms.
   * This ensures that the denoms are reset to valid defaults when the currently selected assets are not available.
   */
  useEffect(() => {
    if (!isNil(fromAssetDenom) && !fromAsset) {
      const nextFromDenom = determineNextFallbackFromDenom({
        fromAssetDenom,
        toAssetDenom,
        initialFromDenom,
        initialToDenom,
        DefaultDenoms,
      });

      setFromAssetDenom(nextFromDenom);
    }

    if (!isNil(toAssetDenom) && !toAsset) {
      const nextToDenom = determineNextFallbackToDenom({
        toAssetDenom,
        fromAssetDenom,
        initialToDenom,
        initialFromDenom,
        DefaultDenoms,
      });

      setToAssetDenom(nextToDenom);
    }
  }, [
    fromAsset,
    fromAssetDenom,
    initialFromDenom,
    initialToDenom,
    setFromAssetDenom,
    setToAssetDenom,
    toAsset,
    toAssetDenom,
  ]);

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
      fromAsset,
      toAsset,
      assetsQueryInput,
      selectableAssets,
      isLoadingSelectAssets,
      hasNextPageAssets: hasNextPage,
      isFetchingNextPageAssets: isFetchingNextPage,
      /** Recommended assets, with to and from tokens filtered. */
      recommendedAssets,
      setAssetsQueryInput,
      setFromAssetDenom,
      setToAssetDenom,
      switchAssets,
      fetchNextPageAssets: fetchNextPage,
    }),
    [
      fromAsset,
      toAsset,
      assetsQueryInput,
      selectableAssets,
      isLoadingSelectAssets,
      hasNextPage,
      isFetchingNextPage,
      recommendedAssets,
      setFromAssetDenom,
      setToAssetDenom,
      switchAssets,
      fetchNextPage,
    ]
  );
}

/**
 * Determines the next fallback denom for `fromAssetDenom` based on the
 * current asset denoms and defaults.
 * - If `fromAssetDenom` is the same as `initialFromDenom` and `toAssetDenom` is not the first default,
 *   set `fromAssetDenom` to the first default denom.
 * - If `fromAssetDenom` is the same as `initialFromDenom` and `toAssetDenom` is the first default,
 *   set `fromAssetDenom` to the second default denomination.
 * - If `initialFromDenom` is the same as `toAssetDenom`, set `fromAssetDenom` to `initialToDenom`.
 * - Otherwise, reset `fromAssetDenom` to `initialFromDenom`.
 */
function determineNextFallbackFromDenom(params: {
  fromAssetDenom: string;
  toAssetDenom: string | undefined;
  initialFromDenom: string;
  initialToDenom: string;
  DefaultDenoms: string[];
}): string {
  const {
    fromAssetDenom,
    toAssetDenom,
    initialFromDenom,
    initialToDenom,
    DefaultDenoms,
  } = params;

  if (fromAssetDenom === initialFromDenom) {
    return toAssetDenom === DefaultDenoms[0]
      ? DefaultDenoms[1]
      : DefaultDenoms[0];
  } else if (initialFromDenom === toAssetDenom) {
    return initialToDenom;
  } else {
    return initialFromDenom;
  }
}

/**
 * Determines the next fallback denom for `toAssetDenom` based on the
 * current asset denoms and defaults.
 * - If `toAssetDenom` is the same as `initialToDenom` and `fromAssetDenom` is not the second default,
 *   it sets `toAssetDenom` to the second default denomination.
 * - If `toAssetDenom` is the same as `initialToDenom` and `fromAssetDenom` is the second default,
 *   it sets `toAssetDenom` to the first default denomination.
 * - If the `initialToDenom` is the same as `fromAssetDenom`, it sets `toAssetDenom` to `initialFromDenom`.
 * - Otherwise, it resets `toAssetDenom` to `initialToDenom`.
 */

function determineNextFallbackToDenom(params: {
  toAssetDenom: string;
  fromAssetDenom: string | undefined;
  initialToDenom: string;
  initialFromDenom: string;
  DefaultDenoms: string[];
}): string {
  const {
    toAssetDenom,
    fromAssetDenom,
    initialToDenom,
    initialFromDenom,
    DefaultDenoms,
  } = params;

  if (toAssetDenom === initialToDenom) {
    return fromAssetDenom === DefaultDenoms[1]
      ? DefaultDenoms[0]
      : DefaultDenoms[1];
  } else if (initialToDenom === fromAssetDenom) {
    return initialFromDenom;
  } else {
    return initialToDenom;
  }
}
