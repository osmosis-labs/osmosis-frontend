import { Dec, DecUtils } from "@keplr-wallet/unit";
import {
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
} from "@osmosis-labs/pools";
import { isNil } from "@osmosis-labs/utils";
import { sum } from "@osmosis-labs/utils";
import { TRPCClientError } from "@trpc/react-query";
import { useCallback, useMemo } from "react";

import { useAmountInput } from "~/hooks/input/use-amount-input";
import { useEstimateSwapTxFees } from "~/hooks/swap/use-estimate-swap-tx-fees";
import { useSwapAssets } from "~/hooks/swap/use-swap-assets";
import { useQueryRouterBestQuote } from "~/hooks/swap/use-swap-query-router-best-quote";
import { useSwapTxParameters } from "~/hooks/swap/use-swap-tx-parameters";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { usePreviousWhen } from "~/hooks/use-previous-when";
import { AppRouter } from "~/server/api/root-router";
import { useStore } from "~/stores";

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
    isToFromAssets && !Boolean(quote?.inOutSpotPrice)
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
      (quote &&
        !quote.inOutSpotPrice &&
        !quote.amount.toDec().isPositive() &&
        !error) ||
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

  const swapTxParameters = useSwapTxParameters(
    quote,
    swapAssets,
    !precedentError,
    account?.address,
    inAmountInput.amount
  );

  const {
    runEstimateTxFeesOnce,
    query: { data: networkFee, isLoading: isLoadingNetworkFee },
  } = useEstimateSwapTxFees({
    chainId: chainStore.osmosis.chainId,
    messages: swapTxParameters?.messages,
    enabled: featureFlags.swapToolSimulateFee,
  });

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
    swapTxParameters,
    runEstimateTxFeesOnce,
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
