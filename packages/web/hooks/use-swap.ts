import { Currency } from "@osmosis-labs/types";
import { useState } from "react";
import { useMemo } from "react";

import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { useWalletSelect } from "./wallet-select";
import { useQueryParamState } from "./window/use-query-param-state";

/** Use swap state for managing user input as well as querying for quotes.
 *
 *  Features:
 *  * Option to store from and to assets in query params, default = yes
 *  * Paginated swappable currencies, with user balances if wallet connected
 *  * Debounced quote fetching from user input */
export function useSwap() {}

/** Use assets for swapping: the from and to assets, as well as the list of
 *  swappable assets. Sorts by balance if user is signed in.
 *
 *  Features:
 *  * Option to store from and to assets in query params, default = yes
 *  * Paginated swappable currencies, with user balances if wallet connected
 *  * Assets search query */
export function useSwapAssets({
  initialFromDenom = "ATOM",
  initialToDenom = "OSMO",
  useQueryParams = true,
}) {
  const { fromAssetDenom, toAssetDenom, setFromAssetDenom, setToAssetDenom } =
    useToFromDenoms(useQueryParams, initialFromDenom, initialToDenom);

  // search with query param string and get first search result as in and out asset
  // we're trusting that the search returns the right asset when given either denom or minimal denom
  // not using denoms may yield unexpected results
  const { data: fromAssets } = api.edge.assets.getAssets.useQuery(
    {
      search: { query: fromAssetDenom! },
    },
    { enabled: Boolean(fromAssetDenom) }
  );
  const fromAsset: Currency | undefined = fromAssets?.items[0];
  const { data: toAssets } = api.edge.assets.getAssets.useQuery(
    {
      search: { query: toAssetDenom! },
    },
    { enabled: Boolean(toAssetDenom) }
  );
  const toAsset: Currency | undefined = toAssets?.items[0];

  // get selectable currencies for trading, including user balances if wallect connected
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();
  const [assetsQueryInput, setAssetsQueryInput] = useState<string>("");
  const search = useMemo(
    () => (assetsQueryInput ? { query: assetsQueryInput } : undefined),
    [assetsQueryInput]
  );
  const { data: selectableCurrencyPages, fetchNextPage } =
    api.edge.assets.getAssets.useInfiniteQuery(
      {
        userOsmoAddress: account?.address,
        search,
      },
      {
        enabled:
          !isLoadingWallet && Boolean(fromAssetDenom) && Boolean(toAssetDenom),
      }
    );

  /** Remove to and from assets from assets that can be selected. */
  const filteredSelectableAssets = selectableCurrencyPages?.pages
    .flatMap(({ items }) => items)
    .filter(
      (asset) =>
        asset.coinMinimalDenom !== fromAsset?.coinMinimalDenom &&
        asset.coinMinimalDenom !== toAsset?.coinMinimalDenom
    );

  return {
    fromAsset,
    toAsset,
    selectableAssets: filteredSelectableAssets,
    assetsQueryInput,
    setAssetsQueryInput,
    setFromAssetDenom,
    setToAssetDenom,
    fetchNextPageAssets: fetchNextPage,
  };
}

/** Switches on query params or react state to store to/from asset denoms.
 *  The initial denoms will be ignored if the user set preferences via query params. */
function useToFromDenoms(
  useQueryParams: boolean,
  initialFromDenom?: string,
  initialToDenom?: string
) {
  // user query params as state source-of-truth
  // ignores initial denoms if there are query params
  const [fromDenomQueryParam, setFromDenomQueryParam] = useQueryParamState(
    "from",
    useQueryParams ? initialFromDenom : undefined
  );
  const fromDenomQueryParamStr =
    typeof fromDenomQueryParam === "string" ? fromDenomQueryParam : undefined;
  const [toAssetQueryParam, setToAssetQueryParam] = useQueryParamState(
    "to",
    useQueryParams ? initialToDenom : undefined
  );
  const toDenomQueryParamStr =
    typeof toAssetQueryParam === "string" ? toAssetQueryParam : undefined;

  // if query params are not used, use react state as source-of-truth
  const [fromAssetState, setFromAssetState] = useState<string | undefined>(
    initialFromDenom
  );
  const [toAssetState, setToAssetState] = useState<string | undefined>(
    initialToDenom
  );

  return {
    fromAssetDenom: useQueryParams ? fromDenomQueryParamStr : fromAssetState,
    toAssetDenom: useQueryParams ? toDenomQueryParamStr : toAssetState,
    setFromAssetDenom: useQueryParams
      ? setFromDenomQueryParam
      : setFromAssetState,
    setToAssetDenom: useQueryParams ? setToAssetQueryParam : setToAssetState,
  };
}
