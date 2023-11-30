import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { NoRouteError, NotEnoughLiquidityError } from "@osmosis-labs/pools";
import { Currency } from "@osmosis-labs/types";
import { useState } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import { useCallback } from "react";

import { MaybeUserAsset } from "~/server/api/edge-routers/assets";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { useAmountInput } from "./input/use-amount-input";
import { useDebouncedState } from "./use-debounced-state";
import { useFeatureFlags } from "./use-feature-flags";
import { useWalletSelect } from "./wallet-select";
import { useQueryParamState } from "./window/use-query-param-state";

export type SwapState = ReturnType<typeof useSwap>;

/** Use swap state for managing user input, selecting currencies, as well as querying for quotes.
 *
 *  Features:
 *  * Input amount of from asset
 *  * Option to store from and to assets in query params, default = yes
 *  * Paginated swappable assets, with user balances if wallet connected
 *  * Assets search query
 *  * Debounced quote fetching from user input */
export function useSwap({
  initialFromDenom = "ATOM",
  initialToDenom = "OSMO",
  useQueryParams = true,
  useOtherCurrencies = true,
} = {}) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const featureFlags = useFeatureFlags();

  const disabledRouters: ("sidecar" | "tfm" | "web")[] | undefined =
    useMemo(() => {
      if (featureFlags._isInitialized && !featureFlags.sidecarRouter) {
        return ["sidecar"];
      }
    }, [featureFlags._isInitialized, featureFlags.sidecarRouter]);

  const swapAssets = useSwapAssets({
    initialFromDenom,
    initialToDenom,
    useQueryParams,
    useOtherCurrencies,
  });

  const inAmountInput = useAmountInput(swapAssets.fromAsset);

  // generate debounced quote from user inputs
  const [debouncedInAmount, setDebounceInAmount] =
    useDebouncedState<CoinPretty | null>(null, 500);
  useEffect(() => {
    setDebounceInAmount(inAmountInput.amount ?? null);
  }, [setDebounceInAmount, inAmountInput.amount]);

  // load flags
  const isToFromAssets =
    Boolean(swapAssets.fromAsset) &&
    Boolean(swapAssets.toAsset) &&
    featureFlags._isInitialized;
  const canLoadQuote =
    isToFromAssets &&
    Boolean(debouncedInAmount?.toDec().isPositive()) &&
    featureFlags._isInitialized;

  const {
    data: quote,
    isLoading: isQuoteLoading_,
    error: quoteError,
  } = api.edge.quoteRouter.routeTokenOutGivenIn.useQuery(
    {
      tokenInDenom: swapAssets.fromAsset?.coinMinimalDenom ?? "",
      tokenInAmount: debouncedInAmount?.toCoin().amount ?? "0",
      tokenOutDenom: swapAssets.toAsset?.coinMinimalDenom ?? "",
      disabledRouterKeys: disabledRouters,
    },
    {
      enabled: canLoadQuote,
      retry: false, // don't retry spot price quote, just display the issue
    }
  );
  /** If a query is not enabled, it is considered loading.
   *  Work around this by checking if the query is enabled and if the query is loading to be considered loading. */
  const isQuoteLoading = isQuoteLoading_ && canLoadQuote;

  const {
    data: spotPriceQuote,
    isLoading: isSpotPriceQuoteLoading,
    error: spotPriceQuoteError,
  } = api.edge.quoteRouter.routeTokenOutGivenIn.useQuery(
    {
      tokenInDenom: swapAssets.fromAsset?.coinMinimalDenom ?? "",
      tokenInAmount: DecUtils.getTenExponentN(
        swapAssets.fromAsset?.coinDecimals ?? 0
      )
        .truncate()
        .toString(),
      tokenOutDenom: swapAssets.toAsset?.coinMinimalDenom ?? "",
      disabledRouterKeys: disabledRouters,
    },
    {
      enabled: isToFromAssets,
      retry: false, // don't retry spot price quote, just display the issue
    }
  );

  /** Collate errors coming first from user input and then tRPC and serialize accordingly. */
  const precedentError:
    | NoRouteError
    | NotEnoughLiquidityError
    | Error
    | undefined = useMemo(() => {
    // prioritize user input errors
    if (inAmountInput.error) return inAmountInput.error;

    const error = quoteError ?? spotPriceQuoteError;

    if (error?.shape?.message.includes("No route found")) {
      return new NoRouteError();
    } else if (error?.shape?.message.includes("Not enough liquidity")) {
      return new NotEnoughLiquidityError();
    } else if (error) {
      return new Error(
        "Unexpected router error" + (error?.shape?.message ?? "")
      );
    }
  }, [quoteError, spotPriceQuoteError, inAmountInput.error]);

  /** Send trade token in transaction. */
  const sendTradeTokenInTx = useCallback(
    (maxSlippage: Dec) =>
      new Promise<"multiroute" | "multihop" | "exact-in">((resolve, reject) => {
        if (!quote) {
          return reject(
            "User input should be disabled if no route is found or is being generated"
          );
        }

        if (!inAmountInput.amount) return reject("No input");
        if (!account) return reject("No account");
        if (!swapAssets.fromAsset) return reject("No from asset");
        if (!swapAssets.toAsset) return reject("No to asset");

        /**
         * Prepare swap data
         */

        type Pool = {
          id: string;
          tokenOutDenom: string;
        };
        type Route = {
          pools: Pool[];
          tokenInAmount: string;
        };

        const routes: Route[] = [];

        for (const route of quote.split) {
          const pools: Pool[] = [];

          for (let i = 0; i < route.pools.length; i++) {
            const pool = route.pools[i];

            pools.push({
              id: pool.id,
              tokenOutDenom: route.tokenOutDenoms[i],
            });
          }

          routes.push({
            pools: pools,
            tokenInAmount: route.initialAmount.toString(),
          });
        }

        /** In amount converted to integer (remove decimals) */
        const tokenIn = {
          currency: swapAssets.fromAsset as Currency,
          amount: inAmountInput.amount.toCoin().amount,
        };

        /** Out amount with slippage included */
        const tokenOutMinAmount = quote.amount
          .toDec()
          .mul(
            DecUtils.getTenExponentNInPrecisionRange(
              swapAssets.toAsset.coinDecimals
            )
          )
          .mul(new Dec(1).sub(maxSlippage))
          .truncate()
          .toString();

        /**
         * Send messages to account
         */
        if (routes.length === 1) {
          const { pools } = routes[0];
          account.osmosis
            .sendSwapExactAmountInMsg(
              pools,
              tokenIn,
              tokenOutMinAmount,
              undefined,
              undefined,
              () => {
                resolve(pools.length === 1 ? "exact-in" : "multihop");
              }
            )
            .catch((reason) => {
              reject(reason);
            })
            .finally(() => {
              inAmountInput.setAmount("");
            });
          return pools.length === 1 ? "exact-in" : "multihop";
        } else if (routes.length > 1) {
          account.osmosis
            .sendSplitRouteSwapExactAmountInMsg(
              routes,
              tokenIn,
              tokenOutMinAmount,
              undefined,
              undefined,
              () => {
                resolve("multiroute");
              }
            )
            .catch((reason) => {
              reject(reason);
            })
            .finally(() => {
              inAmountInput.setAmount("");
            });
        } else {
          reject("No routes given");
        }
      }),
    [quote, inAmountInput, account, swapAssets.fromAsset, swapAssets.toAsset]
  );

  return {
    ...swapAssets,
    inAmountInput,
    quote,
    error: precedentError,
    spotPriceQuote,
    isSpotPriceQuoteLoading,
    spotPriceQuoteError,
    isQuoteLoading,
    /** Spot price or user input quote. */
    isAnyQuoteLoading: isQuoteLoading || isSpotPriceQuoteLoading,
    isLoading:
      swapAssets.isLoadingFromAsset ||
      swapAssets.isLoadingToAsset ||
      isQuoteLoading ||
      isSpotPriceQuoteLoading,
    sendTradeTokenInTx,
  };
}

/** Use assets for swapping: the from and to assets, as well as the list of
 *  swappable assets. Sorts by balance if user is signed in.
 *
 *  Features:
 *  * Option to store from and to assets in query params, default = yes
 *  * Paginated swappable assets, with user balances if wallet connected
 *  * Assets search query */
export function useSwapAssets({
  initialFromDenom = "ATOM",
  initialToDenom = "OSMO",
  useQueryParams = true,
  useOtherCurrencies = true,
} = {}) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  const { fromAssetDenom, toAssetDenom, setFromAssetDenom, setToAssetDenom } =
    useToFromDenoms(useQueryParams, initialFromDenom, initialToDenom);

  const switchAssets = useCallback(() => {
    const temp = fromAssetDenom;
    setFromAssetDenom(toAssetDenom);
    setToAssetDenom(temp);
  }, [fromAssetDenom, toAssetDenom, setFromAssetDenom, setToAssetDenom]);

  // get selectable currencies for trading, including user balances if wallect connected
  const [assetsQueryInput, setAssetsQueryInput] = useState<string>("");

  // generate debounced search from user inputs
  const [debouncedSearchInput, setDebouncedSearchInput] =
    useDebouncedState<string>("", 500);
  useEffect(() => {
    setDebouncedSearchInput(assetsQueryInput);
  }, [setDebouncedSearchInput, assetsQueryInput]);

  const inputSearch = useMemo(
    () => (debouncedSearchInput ? { query: debouncedSearchInput } : undefined),
    [debouncedSearchInput]
  );

  const canLoadAssets =
    !isLoadingWallet &&
    Boolean(fromAssetDenom) &&
    Boolean(toAssetDenom) &&
    useOtherCurrencies;
  // use a separate query for search to maintain pagination in other infinite query
  const { data: searchAssets, isLoading: isLoadingSearchAssets } =
    api.edge.assets.getAssets.useQuery(
      {
        search: inputSearch,
        userOsmoAddress: account?.address,
      },
      {
        enabled: canLoadAssets && Boolean(inputSearch),
      }
    );
  const {
    data: selectableAssetPages,
    isLoading: isLoadingInfiniteAssets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.edge.assets.getAssets.useInfiniteQuery(
    {
      userOsmoAddress: account?.address,
      limit: 50, // items per page
    },
    {
      enabled: canLoadAssets,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    }
  );
  const isLoadingSelectAssets = Boolean(inputSearch)
    ? isLoadingSearchAssets
    : isLoadingInfiniteAssets;

  const allSelectableAssets = useMemo(
    () =>
      inputSearch
        ? searchAssets?.items
        : selectableAssetPages?.pages.flatMap(({ items }) => items),
    [selectableAssetPages?.pages, inputSearch, searchAssets]
  );

  const { asset: fromAsset, isLoading: isLoadingFromAsset } = useSwapAsset(
    fromAssetDenom,
    allSelectableAssets
  );
  const { asset: toAsset, isLoading: isLoadingToAsset } = useSwapAsset(
    toAssetDenom,
    allSelectableAssets
  );

  /** Remove to and from assets from assets that can be selected. */
  const filteredSelectableAssets =
    allSelectableAssets?.filter(
      (asset) =>
        asset.coinMinimalDenom !== fromAsset?.coinMinimalDenom &&
        asset.coinMinimalDenom !== toAsset?.coinMinimalDenom
    ) ?? [];

  return {
    fromAsset,
    toAsset,
    assetsQueryInput,
    selectableAssets: filteredSelectableAssets,
    isLoadingSelectAssets,
    isLoadingFromAsset,
    isLoadingToAsset,
    hasNextPageAssets: hasNextPage,
    isFetchingNextPageAssets: isFetchingNextPage,
    setAssetsQueryInput,
    setFromAssetDenom,
    setToAssetDenom,
    switchAssets,
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

/** Will query for an individual asset of any type of denom (symbol, min denom)
 *  if it's not already in the list of existing assets. */
function useSwapAsset(
  anyDenom?: string,
  existingAssets: MaybeUserAsset[] = []
) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  /** If `coinDenom` or `coinMinimalDenom` don't yield a result, we
   *  can fall back to the getAssets query which will perform
   *  a more comprehensive search. */
  const existingAsset = existingAssets.find(
    (asset) =>
      asset.coinDenom === anyDenom || asset.coinMinimalDenom === anyDenom
  );
  const queryEnabled = Boolean(anyDenom) && !isLoadingWallet && !existingAsset;
  const { data: asset, isLoading } = api.edge.assets.getAssets.useQuery(
    {
      matchDenom: anyDenom,
      userOsmoAddress: account?.address,
    },
    { enabled: queryEnabled }
  );

  return {
    asset: existingAsset ?? asset?.items[0],
    isLoading: isLoading && !existingAsset,
  };
}
