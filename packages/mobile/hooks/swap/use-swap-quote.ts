import {
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
} from "@osmosis-labs/pools";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import {
  getSwapTxParameters,
  QuoteDirection,
  SwapTxRouteOutGivenIn,
} from "@osmosis-labs/tx";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@osmosis-labs/unit";
import {
  getParametersFromOverspendErrorMessage,
  getTokenInFeeAmountFiatValue,
  getTokenOutFiatValue,
  isNil,
  isOverspendErrorMessage,
  sum,
  trimPlaceholderZeros,
} from "@osmosis-labs/utils";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useQueryRouterBestQuote } from "~/hooks/swap/use-query-best-quote";
import { useSwapAsset } from "~/hooks/swap/use-swap-asset";
import { useDeepMemo } from "~/hooks/use-deep-memo";
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { useOsmosisChain } from "~/hooks/use-osmosis-chain";
import { usePreviousWhen } from "~/hooks/use-previous-when";
import {
  useIsTransactionInProgress,
  useSignAndBroadcast,
} from "~/hooks/use-sign-and-broadcast";
import { useWallets } from "~/hooks/use-wallets";
import { useSwapStore } from "~/stores/swap";

export type SwapState = ReturnType<typeof useSwapQuote>;
export type SwapAsset = ReturnType<typeof useSwapAsset>["asset"];
export type SendTradeTokenInTx = ReturnType<
  typeof useSwapQuote
>["sendTradeTokenInTx"];

type SwapOptions = {
  /** Set to the pool ID that the user must swap in. `initialFromDenom` and `initialToDenom`
   *  must be set to the pool's tokens or the quote queries will fail. */
  forceSwapInPoolId?: string;
};

// Note: For computing spot price between    token in and out, we use this multiplier
// for dividing 1 unit of amount in and then multiplying output amount.
// The reason is that high-value tokens such as WBTC cause price impact and
// spot price to be very off when swapping 1 unit of token in.
// This is a temporary hack to bypass the issue with high-value tokens.
// Long-term, we should allow custom quotes in SQS /tokens/prices query.
// Memoize this value to prevent recreation on each render
const spotPriceQuoteMultiplier = new Dec(10);

/** Use swap state for managing user input, selecting currencies, as well as querying for quotes.
 *
 *  Features:
 *  * Input amount of from asset
 *  * Option to store from and to assets in query params, default = yes
 *  * Paginated swappable assets, with user balances if wallet connected
 *  * Assets search query
 *  * Debounced quote fetching from user input */
export function useSwapQuote({ forceSwapInPoolId }: SwapOptions = {}) {
  const { currentWallet } = useWallets();
  const osmosisChain = useOsmosisChain();
  const signAndBroadcast = useSignAndBroadcast();
  const { isTransactionInProgress } = useIsTransactionInProgress();
  const {
    fromAsset,
    toAsset,
    maxSlippage,
    quoteType,
    inAmountInput,
    outAmountInput,
  } = useSwapStore(
    useShallow((state) => ({
      fromAsset: state.fromAsset,
      toAsset: state.toAsset,
      maxSlippage: state.maxSlippage,
      quoteType: state.quoteType,
      inAmountInput: state.inAmountInput,
      outAmountInput: state.outAmountInput,
    }))
  );

  // load flags
  const isToFromAssets = useMemo(
    () => Boolean(fromAsset) && Boolean(toAsset),
    [fromAsset, toAsset]
  );

  const quoteQueryEnabled = useMemo(
    () =>
      isToFromAssets &&
      Boolean(inAmountInput?.debouncedInAmount?.toDec().isPositive()) &&
      // since input is debounced there could be the wrong asset associated
      // with the input amount when switching assets
      inAmountInput?.debouncedInAmount?.currency.coinMinimalDenom ===
        fromAsset?.coinMinimalDenom &&
      inAmountInput?.amount?.currency.coinMinimalDenom ===
        fromAsset?.coinMinimalDenom &&
      !isTransactionInProgress &&
      quoteType === "out-given-in",
    [
      isToFromAssets,
      inAmountInput?.debouncedInAmount,
      inAmountInput?.amount,
      fromAsset,
      isTransactionInProgress,
      quoteType,
    ]
  );

  const inGivenOutQuoteEnabled = useMemo(
    () =>
      isToFromAssets &&
      Boolean(outAmountInput?.debouncedInAmount?.toDec().isPositive()) &&
      outAmountInput?.debouncedInAmount?.currency.coinMinimalDenom ===
        toAsset?.coinMinimalDenom &&
      outAmountInput?.amount?.currency.coinMinimalDenom ===
        toAsset?.coinMinimalDenom &&
      !isTransactionInProgress &&
      quoteType === "in-given-out",
    [
      isToFromAssets,
      outAmountInput?.debouncedInAmount,
      outAmountInput?.amount,
      toAsset,
      isTransactionInProgress,
      quoteType,
    ]
  );

  const outGivenInQuoteParams = useMemo(
    () => ({
      tokenIn: fromAsset,
      tokenOut: toAsset,
      tokenInAmount: inAmountInput?.debouncedInAmount?.toCoin().amount ?? "0",
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    }),
    [
      fromAsset,
      toAsset,
      inAmountInput?.debouncedInAmount,
      forceSwapInPoolId,
      maxSlippage,
    ]
  );

  const inGivenOutQuoteParams = useMemo(
    () => ({
      tokenIn: fromAsset!,
      tokenOut: toAsset!,
      tokenInAmount: outAmountInput?.debouncedInAmount?.toCoin().amount ?? "0",
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    }),
    [
      fromAsset,
      toAsset,
      outAmountInput?.debouncedInAmount,
      forceSwapInPoolId,
      maxSlippage,
    ]
  );

  const {
    data: outGivenInQuote,
    isLoading: isQuoteLoading_,
    errorMsg: quoteErrorMsg,
  } = useQueryRouterBestQuote(
    outGivenInQuoteParams,
    quoteQueryEnabled,
    "out-given-in"
  );

  const {
    data: inGivenOutQuote,
    isLoading: isInGivenOutQuoteLoading_,
    errorMsg: inGivenOutQuoteError,
  } = useQueryRouterBestQuote(
    inGivenOutQuoteParams,
    inGivenOutQuoteEnabled,
    "in-given-out"
  );

  const quote = useMemo(
    () => (quoteType === "in-given-out" ? inGivenOutQuote : outGivenInQuote),
    [quoteType, inGivenOutQuote, outGivenInQuote]
  );

  // Use a ref to track the last update to prevent infinite loops
  const lastUpdateRef = useRef<{
    quoteType: QuoteDirection;
    isQuoteLoading: boolean;
    isInGivenOutQuoteLoading: boolean;
    quoteErrorMsg?: string;
    inGivenOutQuoteError?: string;
    inAmountInputIsTyping: boolean | undefined;
    inAmountInputIsEmpty: boolean | undefined;
    outAmountInputIsTyping: boolean | undefined;
    outAmountInputIsEmpty: boolean | undefined;
  } | null>(null);

  useEffect(() => {
    // Create a snapshot of current state
    const currentState = {
      quoteType,
      isQuoteLoading: isQuoteLoading_,
      isInGivenOutQuoteLoading: isInGivenOutQuoteLoading_,
      quoteErrorMsg,
      inGivenOutQuoteError,
      inAmountInputIsTyping: inAmountInput?.isTyping,
      inAmountInputIsEmpty: inAmountInput?.isEmpty,
      outAmountInputIsTyping: outAmountInput?.isTyping,
      outAmountInputIsEmpty: outAmountInput?.isEmpty,
    };

    // Compare with last state to prevent unnecessary updates
    const lastState = lastUpdateRef.current;
    if (
      lastState &&
      lastState.quoteType === currentState.quoteType &&
      lastState.isQuoteLoading === currentState.isQuoteLoading &&
      lastState.isInGivenOutQuoteLoading ===
        currentState.isInGivenOutQuoteLoading &&
      lastState.quoteErrorMsg === currentState.quoteErrorMsg &&
      lastState.inGivenOutQuoteError === currentState.inGivenOutQuoteError &&
      lastState.inAmountInputIsTyping === currentState.inAmountInputIsTyping &&
      lastState.inAmountInputIsEmpty === currentState.inAmountInputIsEmpty &&
      lastState.outAmountInputIsTyping ===
        currentState.outAmountInputIsTyping &&
      lastState.outAmountInputIsEmpty === currentState.outAmountInputIsEmpty
    ) {
      return;
    }

    // Update ref with current state
    lastUpdateRef.current = currentState;

    if (
      quoteType === "in-given-out" &&
      !isInGivenOutQuoteLoading_ &&
      !outAmountInput?.isTyping
    ) {
      inAmountInput?.setAmount(
        inGivenOutQuote && !inGivenOutQuoteError && !outAmountInput?.isEmpty
          ? trimPlaceholderZeros(inGivenOutQuote.amount.toDec().toString())
          : ""
      );
    }

    if (
      quoteType === "out-given-in" &&
      !isQuoteLoading_ &&
      !inAmountInput?.isTyping
    ) {
      outAmountInput?.setAmount(
        quote && !quoteErrorMsg && !inAmountInput?.isEmpty
          ? trimPlaceholderZeros(quote.amount.toDec().toString())
          : ""
      );
    }
  }, [
    quoteType,
    inGivenOutQuote,
    quote,
    isQuoteLoading_,
    isInGivenOutQuoteLoading_,
    quoteErrorMsg,
    inGivenOutQuoteError,
    inAmountInput,
    outAmountInput,
  ]);

  /** If a query is not enabled, it is considered loading.
   *  Work around this by checking if the query is enabled and if the query is loading to be considered loading. */
  const isQuoteLoading = useMemo(
    () =>
      (isQuoteLoading_ && quoteQueryEnabled) ||
      (isInGivenOutQuoteLoading_ && inGivenOutQuoteEnabled),
    [
      isQuoteLoading_,
      quoteQueryEnabled,
      isInGivenOutQuoteLoading_,
      inGivenOutQuoteEnabled,
    ]
  );

  const spotPriceQuoteParams = useMemo(() => {
    const tokenInDecimals = fromAsset?.coinDecimals ?? 0;
    const tokenInAmount = DecUtils.getTenExponentN(tokenInDecimals)
      .quoRoundUp(spotPriceQuoteMultiplier)
      .truncate()
      .toString();

    return {
      tokenIn: fromAsset!,
      tokenOut: toAsset!,
      tokenInAmount,
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    };
  }, [fromAsset, toAsset, forceSwapInPoolId, maxSlippage]);

  const {
    data: spotPriceQuote,
    isLoading: isSpotPriceQuoteLoading,
    errorMsg: spotPriceQuoteErrorMsg,
  } = useQueryRouterBestQuote(spotPriceQuoteParams, isToFromAssets);

  /** Collate errors coming first from user input and then tRPC and serialize accordingly. */
  const precedentError:
    | (NoRouteError | NotEnoughLiquidityError | Error | undefined)
    | Error = useMemo(() => {
    let error =
      quoteType === "out-given-in" ? inGivenOutQuoteError : quoteErrorMsg;

    // only show spot price error if there's no quote
    if (
      (quote && !quote.amount.toDec().isPositive() && !error) ||
      (!quote && spotPriceQuoteErrorMsg)
    )
      error = spotPriceQuoteErrorMsg;

    const errorFromTrpc = makeRouterErrorFromTrpcError(error)?.error;
    if (errorFromTrpc) return errorFromTrpc;

    // prioritize router errors over user input errors
    if (!inAmountInput?.isEmpty && inAmountInput?.error)
      return inAmountInput.error;
  }, [
    quoteErrorMsg,
    quote,
    spotPriceQuoteErrorMsg,
    inAmountInput?.error,
    inAmountInput?.isEmpty,
    inGivenOutQuoteError,
    quoteType,
  ]);

  const networkFeeQueryEnabled = useMemo(
    () =>
      !precedentError &&
      !isQuoteLoading &&
      (quoteQueryEnabled || inGivenOutQuoteEnabled) &&
      Boolean(quote?.messages) &&
      Boolean(currentWallet?.address) &&
      inAmountInput?.debouncedInAmount !== null &&
      inAmountInput?.balance &&
      inAmountInput?.amount &&
      inAmountInput?.debouncedInAmount
        .toDec()
        .lte(inAmountInput?.balance?.toDec()) &&
      inAmountInput?.amount?.toDec().lte(inAmountInput?.balance?.toDec()) &&
      outAmountInput?.debouncedInAmount !== null &&
      Boolean(outAmountInput?.amount),
    [
      precedentError,
      isQuoteLoading,
      quoteQueryEnabled,
      inGivenOutQuoteEnabled,
      quote?.messages,
      currentWallet?.address,
      inAmountInput?.debouncedInAmount,
      inAmountInput?.balance,
      inAmountInput?.amount,
      outAmountInput?.debouncedInAmount,
      outAmountInput?.amount,
    ]
  );

  const networkFeeParams = useMemo(
    () => ({
      chainId: osmosisChain.chain_id,
      messages: quote?.messages ?? [],
    }),
    [osmosisChain.chain_id, quote?.messages]
  );

  const {
    data: networkFee,
    error: networkFeeError,
    isLoading: isLoadingNetworkFee_,
  } = useEstimateTxFees({
    ...networkFeeParams,
    enabled: networkFeeQueryEnabled,
  });

  const isLoadingNetworkFee = useMemo(
    () => isLoadingNetworkFee_ && networkFeeQueryEnabled,
    [isLoadingNetworkFee_, networkFeeQueryEnabled]
  );

  const isSlippageOverBalance = useMemo(() => {
    if (
      quoteType === "out-given-in" ||
      !inAmountInput?.balance ||
      !inAmountInput?.amount ||
      !maxSlippage
    )
      return false;

    const balance = inAmountInput.balance;
    const amountWithSlippage = inAmountInput.amount
      .toDec()
      .mul(new Dec(1).add(maxSlippage));
    return balance.toDec().lt(amountWithSlippage);
  }, [inAmountInput?.balance, inAmountInput?.amount, maxSlippage, quoteType]);

  /** Send trade token in transaction. */
  const sendTradeTokenInTx = useCallback(
    () =>
      new Promise<"multiroute" | "multihop" | "exact-in">(
        async (resolve, reject) => {
          if (!quote || !quote.messages)
            return reject(new Error("Quote is not specified."));
          if (!maxSlippage)
            return reject(new Error("Max slippage is not defined."));
          if (!inAmountInput?.amount || !outAmountInput?.amount)
            return reject(new Error("Input amount is not specified."));
          if (!currentWallet)
            return reject(new Error("Account information is missing."));
          if (!fromAsset)
            return reject(new Error("From asset is not specified."));
          if (!toAsset) return reject(new Error("To asset is not specified."));

          let txParams: ReturnType<typeof getSwapTxParameters>;
          try {
            txParams = getSwapTxParameters({
              coinAmount:
                quoteType === "out-given-in"
                  ? inAmountInput.amount.toCoin().amount
                  : outAmountInput.amount.toCoin().amount,
              maxSlippage: maxSlippage.toString(),
              tokenInCoinMinimalDenom: fromAsset.coinMinimalDenom,
              tokenOutCoinMinimalDenom: toAsset.coinMinimalDenom,
              tokenOutCoinDecimals: toAsset.coinDecimals,
              tokenInCoinDecimals: fromAsset.coinDecimals,
              quote,
              quoteType,
            });
          } catch (e) {
            const error = e as Error;
            return reject(
              new Error(`Transaction preparation failed: ${error.message}`)
            );
          }

          const { routes } = txParams;
          const typedRoutes = routes as SwapTxRouteOutGivenIn[];

          try {
            const { tx } = await signAndBroadcast.mutateAsync({
              type:
                quoteType === "out-given-in"
                  ? routes.length === 1
                    ? "swapExactAmountIn"
                    : "splitRouteSwapExactAmountIn"
                  : routes.length === 1
                  ? "swapExactAmountOut"
                  : "splitRouteSwapExactAmountOut",
              chainId: osmosisChain.chain_id,
              memo: "Osmosis Mobile Swap",
              messages: quote.messages,
              fee: networkFee
                ? {
                    gas: networkFee.gasLimit,
                    amount: networkFee.amount,
                  }
                : undefined,
            });

            const { code } = tx;
            if (code) {
              reject(new Error("Failed to send swap exact amount in message"));
            } else {
              resolve(
                routes.length === 1
                  ? typedRoutes[0].pools.length === 1
                    ? "exact-in"
                    : "multihop"
                  : "multiroute"
              );
            }
          } catch (e) {
            reject(e);
          }
        }
      ),
    [
      currentWallet,
      inAmountInput,
      maxSlippage,
      networkFee,
      osmosisChain.chain_id,
      outAmountInput,
      quote,
      quoteType,
      signAndBroadcast,
      fromAsset,
      toAsset,
    ]
  );

  const shouldKeepPrevQuote = useCallback(
    () =>
      Boolean(quote?.amount.toDec().isPositive()) &&
      !quoteErrorMsg &&
      !inAmountInput?.isEmpty,
    [quote, quoteErrorMsg, inAmountInput?.isEmpty]
  );

  const positivePrevQuote = usePreviousWhen(quote, shouldKeepPrevQuote);

  const quoteBaseOutSpotPrice = useMemo(() => {
    // get in/out spot price from quote if user requested a quote
    if (
      inAmountInput?.amount &&
      quote &&
      toAsset &&
      quoteType === "out-given-in"
    ) {
      return new CoinPretty(
        toAsset,
        quote.amount
          .toDec()
          .quo(inAmountInput?.amount?.toDec())
          .mulTruncate(DecUtils.getTenExponentN(toAsset.coinDecimals))
      );
    } else if (
      outAmountInput?.amount &&
      quote &&
      toAsset &&
      quoteType === "in-given-out"
    ) {
      return new CoinPretty(
        toAsset,
        outAmountInput.amount
          .toDec()
          .quo(quote.amount.toDec())
          .mulTruncate(DecUtils.getTenExponentN(toAsset.coinDecimals))
      );
    }
  }, [
    inAmountInput?.amount,
    quote,
    toAsset,
    outAmountInput?.amount,
    quoteType,
  ]);

  /** Spot price, current or effective, of the currently selected tokens. */
  const inBaseOutQuoteSpotPrice = useMemo(() => {
    return (
      quoteBaseOutSpotPrice ??
      spotPriceQuote?.amount.mul(spotPriceQuoteMultiplier)
    );
  }, [quoteBaseOutSpotPrice, spotPriceQuote?.amount]);

  // Calculate token in fee amount fiat value from token in fee amount returned by quote and token in price
  // queried above from the same source.
  // By inversally using the token in price, we ensure that the token in fee amount fiat value is consistent
  // relative to the token in and token out fiat value
  const tokenInFeeAmountFiatValue = useMemo(
    () =>
      getTokenInFeeAmountFiatValue(
        fromAsset,
        quote?.tokenInFeeAmount,
        inAmountInput?.price
      ),
    [inAmountInput?.price, quote?.tokenInFeeAmount, fromAsset]
  );

  // Calculate token out fiat value from price impact and token in fiat value.
  //
  // This helps to mitigate the impact of various levels of caches. Here, we are guaranteed that to use
  // the same fiat spot price used for both token in and token out amounts.
  //
  // The price impact is computed directly from quote, ensuring most up-to-date state.
  // This guarantees consistency between token in and token out fiat values.
  const tokenOutFiatValue = useMemo(() => {
    if (quoteType === "out-given-in") {
      return getTokenOutFiatValue(
        quote?.priceImpactTokenOut?.toDec(),
        inAmountInput?.fiatValue?.toDec()
      ).sub(tokenInFeeAmountFiatValue);
    } else {
      return (
        outAmountInput?.fiatValue ??
        new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))
      );
    }
  }, [
    inAmountInput?.fiatValue,
    quote?.priceImpactTokenOut,
    tokenInFeeAmountFiatValue,
    quoteType,
    outAmountInput?.fiatValue,
  ]);

  const totalFee = useDeepMemo(
    () =>
      sum([
        tokenInFeeAmountFiatValue,
        networkFee?.gasUsdValueToPay?.toDec() ?? new Dec(0),
      ]),
    [tokenInFeeAmountFiatValue, networkFee?.gasUsdValueToPay]
  );

  const hasOverSpendLimitError = useMemo(() => {
    if (
      currentWallet?.type !== "smart-account" ||
      !networkFeeError?.message ||
      inAmountInput?.isEmpty ||
      inAmountInput?.inputAmount == "0" ||
      !isOverspendErrorMessage({ message: networkFeeError?.message })
    ) {
      return false;
    }

    return true;
  }, [
    currentWallet?.type,
    networkFeeError?.message,
    inAmountInput?.isEmpty,
    inAmountInput?.inputAmount,
  ]);

  const overspendErrorParams = useMemo(() => {
    if (!hasOverSpendLimitError) return;
    return getParametersFromOverspendErrorMessage(networkFeeError?.message);
  }, [networkFeeError?.message, hasOverSpendLimitError]);

  // Memoize the final return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      inAmountInput,
      outAmountInput,
      tokenOutFiatValue,
      tokenInFeeAmountFiatValue,
      quote:
        isQuoteLoading || inAmountInput?.isTyping
          ? positivePrevQuote
          : !quoteErrorMsg
          ? quote
          : undefined,
      inBaseOutQuoteSpotPrice,
      totalFee,
      networkFee,
      isLoadingNetworkFee,
      networkFeeError,
      error: precedentError,
      spotPriceQuote,
      isSpotPriceQuoteLoading,
      spotPriceQuoteErrorMsg,
      isQuoteLoading,
      sendTradeTokenInTx,
      hasOverSpendLimitError,
      isSlippageOverBalance,
      quoteType,
      overspendErrorParams,
    }),
    [
      inAmountInput,
      outAmountInput,
      tokenOutFiatValue,
      tokenInFeeAmountFiatValue,
      isQuoteLoading,
      positivePrevQuote,
      quoteErrorMsg,
      quote,
      inBaseOutQuoteSpotPrice,
      totalFee,
      networkFee,
      isLoadingNetworkFee,
      networkFeeError,
      precedentError,
      spotPriceQuote,
      isSpotPriceQuoteLoading,
      spotPriceQuoteErrorMsg,
      sendTradeTokenInTx,
      hasOverSpendLimitError,
      isSlippageOverBalance,
      quoteType,
      overspendErrorParams,
    ]
  );
}

/** Various router clients on server should reconcile their error messages
 *  into the following error messages or instances on the server.
 *  Then we can show the user a useful translated error message vs just "Error". */
function makeRouterErrorFromTrpcError(errorMsg: string | null | undefined):
  | {
      error:
        | NoRouteError
        | NotEnoughLiquidityError
        | NotEnoughQuotedError
        | Error;
      isUnexpected: boolean;
    }
  | undefined {
  if (isNil(errorMsg)) return;

  if (errorMsg?.includes(NoRouteError.defaultMessage)) {
    return { error: new NoRouteError(), isUnexpected: false };
  }
  if (errorMsg?.includes(NotEnoughLiquidityError.defaultMessage)) {
    return { error: new NotEnoughLiquidityError(), isUnexpected: false };
  }
  if (errorMsg?.includes(NotEnoughQuotedError.defaultMessage)) {
    return { error: new NotEnoughQuotedError(), isUnexpected: false };
  }
  if (errorMsg) {
    return {
      error: new Error("Unexpected router error" + (errorMsg ?? "")),
      isUnexpected: true,
    };
  }
}
