import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import {
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
} from "@osmosis-labs/pools";
import type { Asset, RouterKey } from "@osmosis-labs/server";
import {
  makeSplitRoutesSwapExactAmountInMsg,
  makeSwapExactAmountInMsg,
  SignOptions,
  TxFee,
} from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { isNil, makeMinimalAsset } from "@osmosis-labs/utils";
import { sum } from "@osmosis-labs/utils";
import { useQueryClient } from "@tanstack/react-query";
import { createTRPCReact, TRPCClientError } from "@trpc/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMemo } from "react";
import { useCallback } from "react";
import { useEffect } from "react";

import { isOverspendErrorMessage } from "~/components/alert/prettify";
import { RecommendedSwapDenoms } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { useOneClickTradingSession } from "~/hooks/one-click-trading";
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import { AppRouter } from "~/server/api/root-router";
import { useStore } from "~/stores";
import { api, RouterInputs, RouterOutputs } from "~/utils/trpc";

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
  maxSlippage: Dec | undefined;
};

/** Use swap state for managing user input, selecting currencies, as well as querying for quotes.
 *
 *  Features:
 *  * Input amount of from asset
 *  * Option to store from and to assets in query params, default = yes
 *  * Paginated swappable assets, with user balances if wallet connected
 *  * Assets search query
 *  * Debounced quote fetching from user input */
export function useSwap(
  {
    initialFromDenom = "ATOM",
    initialToDenom = "OSMO",
    useQueryParams = true,
    useOtherCurrencies = true,
    forceSwapInPoolId,
    maxSlippage,
  }: SwapOptions = { maxSlippage: undefined }
) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const queryClient = useQueryClient();
  const featureFlags = useFeatureFlags();
  const { isOneClickTradingEnabled, oneClickTradingInfo } =
    useOneClickTradingSession();

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
      tokenIn: swapAssets.fromAsset,
      tokenOut: swapAssets.toAsset,
      tokenInAmount: inAmountInput.debouncedInAmount?.toCoin().amount ?? "0",
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
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
      tokenIn: swapAssets.fromAsset,
      tokenInAmount: DecUtils.getTenExponentN(
        swapAssets.fromAsset?.coinDecimals ?? 0
      )
        .truncate()
        .toString(),
      tokenOut: swapAssets.toAsset,
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
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
    if (
      (quote && !quote.amount.toDec().isPositive() && !error) ||
      (!quote && spotPriceQuoteError)
    )
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

  // TODO: Handle Simulate Errors in 1CT
  const {
    data: networkFee,
    error: estimateTxError,
    isLoading: isLoadingNetworkFee,
  } = useEstimateTxFees({
    chainId: chainStore.osmosis.chainId,
    messages: quote?.messages,
    enabled:
      !inAmountInput.isEmpty &&
      !precedentError &&
      featureFlags.swapToolSimulateFee,
    signOptions: {
      useOneClickTrading: isOneClickTradingEnabled,
    },
  });

  const hasExceededOneClickTradingGasLimit = useMemo(() => {
    if (
      !isOneClickTradingEnabled ||
      !oneClickTradingInfo ||
      inAmountInput.isEmpty
    ) {
      return false;
    }

    const networkFeeLimit = new CoinPretty(
      oneClickTradingInfo.networkFeeLimit,
      oneClickTradingInfo.networkFeeLimit.amount
    );

    if (
      networkFee?.gasAmount.denom === networkFeeLimit.denom &&
      networkFee?.gasAmount.toDec().gt(networkFeeLimit.toDec())
    ) {
      return true;
    }

    return false;
  }, [
    inAmountInput.isEmpty,
    isOneClickTradingEnabled,
    networkFee,
    oneClickTradingInfo,
  ]);

  const hasOverSpendLimitError = useMemo(() => {
    if (
      !estimateTxError?.message ||
      !isOneClickTradingEnabled ||
      inAmountInput.isEmpty ||
      inAmountInput.inputAmount == "0" ||
      !isOverspendErrorMessage({ message: estimateTxError?.message })
    ) {
      return false;
    }

    return true;
  }, [
    estimateTxError,
    inAmountInput.inputAmount,
    inAmountInput.isEmpty,
    isOneClickTradingEnabled,
  ]);

  /** Send trade token in transaction. */
  const sendTradeTokenInTx = useCallback(
    () =>
      new Promise<"multiroute" | "multihop" | "exact-in">(
        async (resolve, reject) => {
          if (!maxSlippage) return reject("No max slippage");
          if (!inAmountInput.amount) return reject("No input amount");
          if (!account) return reject("No account");

          let txParams: ReturnType<typeof getSwapTxParameters>;

          try {
            txParams = getSwapTxParameters({
              coinAmount: inAmountInput.amount.toCoin().amount,
              maxSlippage,
              fromAsset: swapAssets.fromAsset,
              toAsset: swapAssets.toAsset,
              quote,
            });
          } catch (e) {
            const error = e as Error;
            return reject(error.message);
          }

          const { routes, tokenIn, tokenOutMinAmount } = txParams;

          const shouldBeSignedWithOneClickTrading = !isNil(quote?.messages)
            ? isOneClickTradingEnabled &&
              (await accountStore.shouldBeSignedWithOneClickTrading({
                messages: quote.messages,
              })) &&
              !hasOverSpendLimitError &&
              !hasExceededOneClickTradingGasLimit
            : false;
          const signOptions: (SignOptions & { fee?: TxFee }) | undefined = {
            useOneClickTrading: shouldBeSignedWithOneClickTrading,
            ...(featureFlags.swapToolSimulateFee && networkFee
              ? {
                  preferNoSetFee: true,
                  fee: {
                    gas: networkFee.gasLimit,
                    amount: networkFee.amount,
                  },
                }
              : {}),
          };

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
                signOptions,
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
                signOptions,
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
        }
      ).finally(() => {
        // TODO: Move this logic to osmosis account store
        // But for now we will invalidate query data here.
        if (!account?.address) return;
        useBalances.invalidateQuery({ address: account.address, queryClient });

        inAmountInput.reset();
      }),
    [
      maxSlippage,
      inAmountInput,
      account,
      swapAssets.fromAsset,
      swapAssets.toAsset,
      quote,
      isOneClickTradingEnabled,
      accountStore,
      hasOverSpendLimitError,
      hasExceededOneClickTradingGasLimit,
      featureFlags.swapToolSimulateFee,
      networkFee,
      queryClient,
    ]
  );

  const positivePrevQuote = usePreviousWhen(
    quote,
    useCallback(
      () => Boolean(quote?.amount.toDec().isPositive()) && !quoteError,
      [quote, quoteError]
    )
  );

  /** Spot price, current or effective, of the currently selected tokens. */
  const inBaseOutQuoteSpotPrice = useMemo(() => {
    // get in/out spot price from quote if user requested a quote
    if (
      inAmountInput.amount &&
      quote &&
      swapAssets.toAsset &&
      !inAmountInput.isTyping
    ) {
      return new CoinPretty(
        swapAssets.toAsset,
        quote.amount
          .toDec()
          .quo(inAmountInput.amount.toDec())
          .mulTruncate(
            DecUtils.getTenExponentN(swapAssets.toAsset.coinDecimals)
          )
      );
    }
    return spotPriceQuote?.amount;
  }, [
    spotPriceQuote,
    swapAssets.toAsset,
    inAmountInput.amount,
    inAmountInput.isTyping,
    quote,
  ]);

  return {
    ...swapAssets,
    inAmountInput,
    quote:
      isQuoteLoading || inAmountInput.isTyping
        ? positivePrevQuote
        : !Boolean(quoteError)
        ? quote
        : undefined,
    inBaseOutQuoteSpotPrice,
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
    sendTradeTokenInTx,
    hasOverSpendLimitError,
    hasExceededOneClickTradingGasLimit,
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

function getSwapTxParameters({
  coinAmount,
  maxSlippage,
  quote,
  fromAsset,
  toAsset,
}: {
  coinAmount: string;
  maxSlippage: Dec;
  quote:
    | RouterOutputs["local"]["quoteRouter"]["routeTokenOutGivenIn"]
    | undefined;
  fromAsset: Asset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  toAsset: Asset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
}) {
  if (!quote) {
    throw new Error(
      "User input should be disabled if no route is found or is being generated"
    );
  }
  if (!coinAmount) throw new Error("No input");
  if (!fromAsset) throw new Error("No from asset");
  if (!toAsset) throw new Error("No to asset");

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
    currency: fromAsset as Currency,
    amount: coinAmount,
  };

  /** Out amount with slippage included */
  const tokenOutMinAmount = quote.amount
    .toDec()
    .mul(DecUtils.getTenExponentNInPrecisionRange(toAsset.coinDecimals))
    .mul(new Dec(1).sub(maxSlippage))
    .truncate()
    .toString();

  return {
    routes,
    tokenIn,
    tokenOutMinAmount,
  };
}

function getSwapMessages({
  coinAmount,
  maxSlippage,
  quote,
  fromAsset,
  toAsset,
  userOsmoAddress,
}: {
  coinAmount: string;
  maxSlippage: Dec | undefined;
  quote:
    | RouterOutputs["local"]["quoteRouter"]["routeTokenOutGivenIn"]
    | undefined;
  fromAsset: Asset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  toAsset: Asset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  userOsmoAddress: string | undefined;
}) {
  if (!userOsmoAddress || !quote || !maxSlippage) return undefined;

  let txParams: ReturnType<typeof getSwapTxParameters>;

  try {
    txParams = getSwapTxParameters({
      coinAmount,
      maxSlippage,
      fromAsset,
      toAsset,
      quote,
    });
  } catch {
    return undefined;
  }

  const { routes, tokenIn, tokenOutMinAmount } = txParams;

  const { pools } = routes[0];

  if (routes.length < 1) {
    throw new Error("Routes are empty");
  }

  return [
    routes.length === 1
      ? makeSwapExactAmountInMsg({
          pools,
          tokenIn,
          tokenOutMinAmount,
          userOsmoAddress,
        })
      : makeSplitRoutesSwapExactAmountInMsg({
          routes,
          tokenIn,
          tokenOutMinAmount,
          userOsmoAddress,
        }),
  ];
}

/** Iterates over available and identical routers and sends input to each one individually.
 *  Results are reduced to best result by out amount.
 *  Also returns the number of routers that have fetched and errored. */
function useQueryRouterBestQuote(
  input: Omit<
    RouterInputs["local"]["quoteRouter"]["routeTokenOutGivenIn"],
    "preferredRouter" | "tokenInDenom" | "tokenOutDenom"
  > & {
    tokenIn: Asset &
      Partial<{
        amount: CoinPretty;
        usdValue: PricePretty;
      }>;
    tokenOut: Asset &
      Partial<{
        amount: CoinPretty;
        usdValue: PricePretty;
      }>;
    maxSlippage: Dec | undefined;
  },
  enabled: boolean,
  routerKeys = ["legacy", "sidecar", "tfm"] as RouterKey[]
) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
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
          tokenInAmount: input.tokenInAmount,
          tokenInDenom: input.tokenIn?.coinMinimalDenom ?? "",
          tokenOutDenom: input.tokenOut?.coinMinimalDenom ?? "",
          forcePoolId: input.forcePoolId,
          preferredRouter: key,
        },
        {
          enabled: enabled && Boolean(availableRouterKeys.length),

          select: (quote) => {
            return {
              ...quote,
              messages: getSwapMessages({
                quote,
                toAsset: input.tokenOut,
                fromAsset: input.tokenIn,
                maxSlippage: input.maxSlippage,
                coinAmount: input.tokenInAmount,
                userOsmoAddress: account?.address,
              }),
            };
          },

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
  const tprcShapeMsg = error?.message;

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
