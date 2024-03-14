import { SignOptions } from "@cosmos-kit/core";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import {
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
} from "@osmosis-labs/pools";
import {
  makeSplitRoutesSwapExactAmountInMsg,
  makeSwapExactAmountInMsg,
  TxFee,
} from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { isNil, makeMinimalAsset } from "@osmosis-labs/utils";
import { useQueryClient } from "@tanstack/react-query";
import { createTRPCReact, TRPCClientError } from "@trpc/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMemo } from "react";
import { useCallback } from "react";
import { useEffect } from "react";

import { RecommendedSwapDenoms } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import type { RouterKey } from "~/server/api/local-routers/swap-router";
import type { AppRouter } from "~/server/api/root";
import type { Asset } from "~/server/queries/complex/assets";
import { useStore } from "~/stores";
import { sum } from "~/utils/math";
import { api, RouterInputs } from "~/utils/trpc";

import { useAmountInput } from "./input/use-amount-input";
import { useBalances } from "./queries/cosmos/use-balances";
import { useDebouncedState } from "./use-debounced-state";
import { useFeatureFlags } from "./use-feature-flags";
import { usePreviousWhen } from "./use-previous-when";
import { useWalletSelect } from "./wallet-select";
import { useQueryParamState } from "./window/use-query-param-state";

export type SwapState = ReturnType<typeof useSwap>;

type SwapOptions = {
  /** Initial from denom if `useQueryParams` is not `true` and there's no query param. */
  initialFromDenom?: string;
  /** Initial to denom if `useQueryParams` is not `true` and there's no query param. */
  initialToDenom?: string;
  /** Set to true to use query params instead as to from token denom state. */
  useQueryParams?: boolean;
  /** Set to true if users should be able to select other currencies to swap. */
  useOtherCurrencies?: boolean;
  /** Set to the pool ID that the user must swap in. `initialFromDenom` and `initialToDenom`
   *  must be set to the pool's tokens or the quote queries will fail. */
  forceSwapInPoolId?: string;
};

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
  forceSwapInPoolId,
}: SwapOptions = {}) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const queryClient = useQueryClient();
  const featureFlags = useFeatureFlags();

  const swapAssets = useSwapAssets({
    initialFromDenom,
    initialToDenom,
    useQueryParams,
    useOtherCurrencies,
  });

  const inAmountInput = useAmountInput(swapAssets.fromAsset);

  // load flags
  const isToFromAssets =
    Boolean(swapAssets.fromAsset) && Boolean(swapAssets.toAsset);
  const canLoadQuote =
    isToFromAssets &&
    Boolean(inAmountInput.debouncedInAmount?.toDec().isPositive());

  const {
    data: quote,
    isLoading: isQuoteLoading_,
    error: quoteError,
  } = useQueryRouterBestQuote(
    {
      tokenInDenom: swapAssets.fromAsset?.coinMinimalDenom ?? "",
      tokenInAmount: inAmountInput.debouncedInAmount?.toCoin().amount ?? "0",
      tokenOutDenom: swapAssets.toAsset?.coinMinimalDenom ?? "",
      forcePoolId: forceSwapInPoolId,
    },
    canLoadQuote
  );
  /** If a query is not enabled, it is considered loading.
   *  Work around this by checking if the query is enabled and if the query is loading to be considered loading. */
  const isQuoteLoading = isQuoteLoading_ && canLoadQuote;

  const {
    data: spotPriceQuote,
    isLoading: isSpotPriceQuoteLoading,
    error: spotPriceQuoteError,
  } = useQueryRouterBestQuote(
    {
      tokenInDenom: swapAssets.fromAsset?.coinMinimalDenom ?? "",
      tokenInAmount: DecUtils.getTenExponentN(
        swapAssets.fromAsset?.coinDecimals ?? 0
      )
        .truncate()
        .toString(),
      tokenOutDenom: swapAssets.toAsset?.coinMinimalDenom ?? "",
      forcePoolId: forceSwapInPoolId,
    },
    isToFromAssets
  );

  /** Collate errors coming first from user input and then tRPC and serialize accordingly. */
  const precedentError:
    | NoRouteError
    | NotEnoughLiquidityError
    | Error
    | undefined = useMemo(() => {
    let error = quoteError;

    // only show spot price error if there's no quote
    if (quote && !quote.amount.toDec().isPositive() && !error)
      error = spotPriceQuoteError;

    const errorFromTrpc = makeRouterErrorFromTrpcError(error)?.error;
    if (errorFromTrpc) return errorFromTrpc;

    // prioritize router errors over user input errors
    if (!inAmountInput.isEmpty && inAmountInput.error)
      return inAmountInput.error;
  }, [
    quoteError,
    quote,
    spotPriceQuoteError,
    inAmountInput.error,
    inAmountInput.isEmpty,
  ]);

  const getSwapTxParameters = useCallback(
    ({
      coinAmount,
      maxSlippage,
    }: {
      coinAmount: CoinPretty | undefined;
      maxSlippage: Dec;
    }) => {
      if (!quote) {
        throw new Error(
          "User input should be disabled if no route is found or is being generated"
        );
      }

      if (!coinAmount) throw new Error("No input");
      if (!account) throw new Error("No account");
      if (!swapAssets.fromAsset) throw new Error("No from asset");
      if (!swapAssets.toAsset) throw new Error("No to asset");

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
        amount: coinAmount.toCoin().amount,
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

      return {
        routes,
        tokenIn,
        tokenOutMinAmount,
      };
    },
    [quote, account, swapAssets]
  );

  const messages = useMemo(() => {
    if (!account?.address) return undefined;

    let txParams: ReturnType<typeof getSwapTxParameters>;

    try {
      txParams = getSwapTxParameters({
        coinAmount: inAmountInput.amount,
        maxSlippage: new Dec(0.95),
      });
    } catch {
      return undefined;
    }

    const { routes, tokenIn, tokenOutMinAmount } = txParams;

    const { pools } = routes[0];

    if (routes.length < 1) {
      throw new Error("Routes are empty");
    }

    /**
     * Do not send transaction if there is an error since it will fail anyway.
     */
    if (precedentError) {
      return undefined;
    }

    return [
      routes.length === 1
        ? makeSwapExactAmountInMsg({
            pools,
            tokenIn,
            tokenOutMinAmount,
            userOsmoAddress: account.address,
          })
        : makeSplitRoutesSwapExactAmountInMsg({
            routes,
            tokenIn,
            tokenOutMinAmount,
            userOsmoAddress: account.address,
          }),
    ];

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSwapTxParameters, quote, inAmountInput, account, swapAssets]);

  const { data: networkFee, isLoading: isLoadingNetworkFee } =
    useEstimateTxFees({
      chainId: chainStore.osmosis.chainId,
      messages,
      enabled: featureFlags.swapToolSimulateFee,
    });
  const { data: userOsmoCoin } = api.edge.assets.getUserAsset.useQuery(
    { findMinDenomOrSymbol: "OSMO", userOsmoAddress: account?.address },
    { enabled: Boolean(account?.address) && featureFlags.swapToolSimulateFee }
  );

  /** Send trade token in transaction. */
  const sendTradeTokenInTx = useCallback(
    (maxSlippage: Dec) =>
      new Promise<"multiroute" | "multihop" | "exact-in">((resolve, reject) => {
        if (!account) return reject("No account");

        let txParams: ReturnType<typeof getSwapTxParameters>;

        try {
          txParams = getSwapTxParameters({
            coinAmount: inAmountInput.amount,
            maxSlippage,
          });
        } catch (e) {
          const error = e as Error;
          return reject(error.message);
        }

        const { routes, tokenIn, tokenOutMinAmount } = txParams;

        const fee: (SignOptions & { fee: TxFee }) | undefined =
          featureFlags.swapToolSimulateFee &&
          networkFee &&
          // Do not manually set the simulated fee if the user does not have enough OSMO
          // TODO: Support other fee tokens
          userOsmoCoin?.amount?.toDec().gte(networkFee.gasAmount.toDec())
            ? {
                preferNoSetFee: true,
                fee: {
                  gas: networkFee.gasLimit,
                  amount: networkFee.amount,
                },
              }
            : undefined;

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
              fee,
              () => {
                resolve(pools.length === 1 ? "exact-in" : "multihop");
              }
            )
            .catch((reason) => {
              reject(reason);
            })
            .finally(() => {
              inAmountInput.reset();
            });
          return pools.length === 1 ? "exact-in" : "multihop";
        } else if (routes.length > 1) {
          account.osmosis
            .sendSplitRouteSwapExactAmountInMsg(
              routes,
              tokenIn,
              tokenOutMinAmount,
              undefined,
              fee,
              () => {
                resolve("multiroute");
              }
            )
            .catch((reason) => {
              reject(reason);
            })
            .finally(() => {
              inAmountInput.reset();
            });
        } else {
          reject("No routes given");
        }
      }).finally(() => {
        // TODO: Move this logic to osmosis account store
        // But for now we will invalidate query data here.
        if (!account?.address) return;
        useBalances.invalidateQuery({ address: account.address, queryClient });

        inAmountInput.reset();
      }),
    [
      account,
      getSwapTxParameters,
      inAmountInput,
      networkFee,
      queryClient,
      userOsmoCoin?.amount,
    ]
  );

  const positivePrevQuote = usePreviousWhen(
    quote,
    useCallback(
      () => Boolean(quote?.amount.toDec().isPositive()) && !quoteError,
      [quote, quoteError]
    )
  );

  return {
    ...swapAssets,
    inAmountInput,
    quote:
      isQuoteLoading || inAmountInput.isTyping
        ? positivePrevQuote
        : !Boolean(quoteError)
        ? quote
        : undefined,
    totalFee: sum([
      quote?.tokenInFeeAmountFiatValue?.toDec() ?? new Dec(0),
      networkFee?.gasUsdValueToPay?.toDec() ?? new Dec(0),
    ]),
    networkFee,
    isLoadingNetworkFee,
    error: precedentError,
    spotPriceQuote,
    isSpotPriceQuoteLoading,
    spotPriceQuoteError,
    isQuoteLoading,
    /** Spot price or user input quote. */
    isAnyQuoteLoading: isQuoteLoading || isSpotPriceQuoteLoading,
    isLoading: isQuoteLoading || isSpotPriceQuoteLoading,
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

  const {
    fromAssetDenom,
    toAssetDenom,
    setFromAssetDenom,
    setToAssetDenom,
    switchAssets,
  } = useToFromDenoms(useQueryParams, initialFromDenom, initialToDenom);

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

  const { showPreviewAssets } = useShowPreviewAssets();

  const canLoadAssets =
    !isLoadingWallet &&
    Boolean(fromAssetDenom) &&
    Boolean(toAssetDenom) &&
    useOtherCurrencies;
  // use a separate query for search to maintain pagination in other infinite query
  const {
    data: selectableAssetPages,
    isLoading: isLoadingSelectAssets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.edge.assets.getUserAssets.useInfiniteQuery(
    {
      search: queryInput,
      userOsmoAddress: account?.address,
      includePreview: showPreviewAssets,
      limit: 50, // items per page
    },
    {
      enabled: canLoadAssets,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    }
  );

  const allSelectableAssets = useMemo(
    () => selectableAssetPages?.pages.flatMap(({ items }) => items) ?? [],
    [selectableAssetPages?.pages]
  );

  const { asset: fromAsset } = useSwapAsset(
    fromAssetDenom,
    allSelectableAssets
  );
  const { asset: toAsset } = useSwapAsset(toAssetDenom, allSelectableAssets);

  const recommendedAssets = useRecommendedAssets(
    fromAsset?.coinMinimalDenom,
    toAsset?.coinMinimalDenom
  );

  /** Remove to and from assets from assets that can be selected. */
  const filteredSelectableAssets = useMemo(
    () =>
      allSelectableAssets.filter(
        (asset) =>
          asset.coinMinimalDenom !== fromAsset?.coinMinimalDenom &&
          asset.coinMinimalDenom !== toAsset?.coinMinimalDenom
      ) ?? [],
    [allSelectableAssets, fromAsset, toAsset]
  );

  return {
    fromAsset,
    toAsset,
    assetsQueryInput,
    selectableAssets: filteredSelectableAssets,
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
  };
}

/** Switches on query params or react state to store to/from asset denoms.
 *  The initial denoms will be ignored if the user set preferences via query params. */
function useToFromDenoms(
  useQueryParams: boolean,
  initialFromDenom?: string,
  initialToDenom?: string
) {
  const router = useRouter();

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

  useEffect(() => {
    setToAssetState(initialToDenom);
    setFromAssetState(initialFromDenom);
  }, [initialFromDenom, initialToDenom]);

  // if using query params perform one push instead of two as the router
  // doesn't handle two immediate pushes well within `useQueryParamState` hooks
  const switchAssets = () => {
    if (useQueryParams) {
      const existingParams = router.query;
      router.push({
        query: {
          ...existingParams,
          from: toDenomQueryParamStr,
          to: fromDenomQueryParamStr,
        },
      });
      return;
    }

    const temp = fromAssetState;
    setFromAssetState(toAssetState);
    setToAssetState(temp);
  };

  return {
    fromAssetDenom: useQueryParams ? fromDenomQueryParamStr : fromAssetState,
    toAssetDenom: useQueryParams ? toDenomQueryParamStr : toAssetState,
    setFromAssetDenom: useQueryParams
      ? setFromDenomQueryParam
      : setFromAssetState,
    setToAssetDenom: useQueryParams ? setToAssetQueryParam : setToAssetState,
    switchAssets,
  };
}

/** Will query for an individual asset of any type of denom (symbol, min denom)
 *  if it's not already in the list of existing assets. */
function useSwapAsset<TAsset extends Asset>(
  minDenomOrSymbol?: string,
  existingAssets: TAsset[] = []
) {
  /** If `coinDenom` or `coinMinimalDenom` don't yield a result, we
   *  can fall back to the getAssets query which will perform
   *  a more comprehensive search. */
  const existingAsset = existingAssets.find(
    (asset) =>
      asset.coinDenom === minDenomOrSymbol ||
      asset.coinMinimalDenom === minDenomOrSymbol
  );
  !existingAsset;
  const asset = useMemo(() => {
    if (existingAsset) return existingAsset;

    const asset = AssetLists.flatMap(({ assets }) => assets).find(
      (asset) =>
        minDenomOrSymbol &&
        (asset.symbol === minDenomOrSymbol ||
          asset.coinMinimalDenom === minDenomOrSymbol)
    );
    if (!asset) return;

    return makeMinimalAsset(asset);
  }, [minDenomOrSymbol, existingAsset]);

  return {
    asset: existingAsset ?? (asset as TAsset),
  };
}

/** Iterates over available and identical routers and sends input to each one individually.
 *  Results are reduced to best result by out amount.
 *  Also returns the number of routers that have fetched and errored. */
function useQueryRouterBestQuote(
  input: Omit<
    RouterInputs["local"]["quoteRouter"]["routeTokenOutGivenIn"],
    "preferredRouter"
  >,
  enabled: boolean,
  routerKeys = ["legacy", "sidecar", "tfm"] as RouterKey[]
) {
  const featureFlags = useFeatureFlags();
  const availableRouterKeys: RouterKey[] = useMemo(
    () =>
      !featureFlags._isInitialized
        ? []
        : routerKeys.filter((key) => {
            if (!featureFlags.sidecarRouter && key === "sidecar") return false;
            if (!featureFlags.legacyRouter && key === "legacy") return false;
            // TFM doesn't support force swap through pool
            if ((!featureFlags.tfmRouter || input.forcePoolId) && key === "tfm")
              return false;
            return true;
          }),
    [
      featureFlags._isInitialized,
      featureFlags.sidecarRouter,
      featureFlags.legacyRouter,
      featureFlags.tfmRouter,
      routerKeys,
      input.forcePoolId,
    ]
  );

  const trpcReact = createTRPCReact<AppRouter>();
  const routerResults = trpcReact.useQueries((t) =>
    availableRouterKeys.map((key) =>
      t.local.quoteRouter.routeTokenOutGivenIn(
        {
          ...input,
          preferredRouter: key,
        },
        {
          enabled: enabled && Boolean(availableRouterKeys.length),

          // quotes should not be considered fresh for long, otherwise
          // the gas simulation will fail due to slippage and the user would see errors
          staleTime: 5_000,
          cacheTime: 5_000,
          // Disable retries, as useQueries
          // will block successfull quotes from being returned
          // if failed quotes are being returned
          // until retry starts returning false.
          // This causes slow UX even though there's a
          // quote that the user can use.
          retry: false,

          // prevent batching so that fast routers can
          // return requests faster than the slowest router
          trpc: {
            context: {
              skipBatch: true,
            },
          },
        }
      )
    )
  );

  // reduce the results' data to that with the highest out amount
  const bestData = useMemo(() => {
    return (
      routerResults
        // only those that have fetched
        .filter((routerResults) => Boolean(routerResults.isFetched))
        // only those that have returned a result without error
        .map(({ data }) => data)
        // only the best quote data
        .reduce((best, cur) => {
          if (!best) return cur;
          if (cur && best.amount.toDec().lt(cur.amount.toDec())) return cur;
          return best;
        }, undefined)
    );
  }, [routerResults]);

  const numSucceeded = routerResults.filter(
    ({ isSuccess }) => isSuccess
  ).length;
  const isOneSuccessful = Boolean(numSucceeded);
  const numError = routerResults.filter(({ isError }) => isError).length;
  const isOneErrored = Boolean(numError);

  // if none have returned a resulting quote, find some error
  const someError = useMemo(
    () =>
      !isOneSuccessful && isOneErrored
        ? routerResults.find((routerResults) => Boolean(routerResults.error))
            ?.error
        : undefined,
    [isOneSuccessful, isOneErrored, routerResults]
  );

  return {
    data: bestData,
    isLoading: !isOneSuccessful,
    error: someError,
    numSucceeded,
    numError,
    numAvailableRouters: availableRouterKeys.length,
  };
}

/** Various router clients on server should reconcile their error messages
 *  into the following error messages or instances on the server.
 *  Then we can show the user a useful translated error message vs just "Error". */
function makeRouterErrorFromTrpcError(
  error:
    | TRPCClientError<AppRouter["local"]["quoteRouter"]["routeTokenOutGivenIn"]>
    | null
    | undefined
):
  | {
      error:
        | NoRouteError
        | NotEnoughLiquidityError
        | NotEnoughQuotedError
        | Error;
      isUnexpected: boolean;
    }
  | undefined {
  if (isNil(error)) return;
  const tprcShapeMsg = error?.shape?.message;

  if (tprcShapeMsg?.includes(NoRouteError.defaultMessage)) {
    return { error: new NoRouteError(), isUnexpected: false };
  }
  if (tprcShapeMsg?.includes(NotEnoughLiquidityError.defaultMessage)) {
    return { error: new NotEnoughLiquidityError(), isUnexpected: false };
  }
  if (tprcShapeMsg?.includes(NotEnoughQuotedError.defaultMessage)) {
    return { error: new NotEnoughQuotedError(), isUnexpected: false };
  }
  if (error) {
    return {
      error: new Error("Unexpected router error" + (tprcShapeMsg ?? "")),
      isUnexpected: true,
    };
  }
}

/** Gets recommended assets directly from asset list. */
function useRecommendedAssets(
  fromCoinMinimalDenom?: string,
  toCoinMinimalDenom?: string
) {
  return useMemo(
    () =>
      RecommendedSwapDenoms.map((denom) => {
        const asset = AssetLists.flatMap(({ assets }) => assets).find(
          (asset) => asset.symbol === denom
        );
        if (!asset) return;

        return makeMinimalAsset(asset);
      })
        .filter((c): c is NonNullable<typeof c> => !!c)
        .filter(
          (currency) =>
            currency &&
            currency.coinMinimalDenom !== fromCoinMinimalDenom &&
            currency.coinMinimalDenom !== toCoinMinimalDenom
        ),
    [fromCoinMinimalDenom, toCoinMinimalDenom]
  );
}
