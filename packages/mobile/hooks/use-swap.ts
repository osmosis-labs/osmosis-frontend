import {
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
} from "@osmosis-labs/pools";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { ObservableSlippageConfig } from "@osmosis-labs/stores";
import {
  getSwapMessages,
  getSwapTxParameters,
  QuoteDirection,
  SwapTxRouteOutGivenIn,
} from "@osmosis-labs/tx";
import { Currency, MinimalAsset } from "@osmosis-labs/types";
import {
  CoinPretty,
  Dec,
  DecUtils,
  IntPretty,
  PricePretty,
} from "@osmosis-labs/unit";
import {
  getTokenInFeeAmountFiatValue,
  getTokenOutFiatValue,
  isNil,
  mulPrice,
  sum,
  trimPlaceholderZeros,
} from "@osmosis-labs/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAsync from "react-use/lib/useAsync";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { useAmountInput } from "~/hooks/use-amount-input";
import { useDebouncedState } from "~/hooks/use-debounced-state";
import { useDeepMemo } from "~/hooks/use-deep-memo";
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { useOsmosisChain } from "~/hooks/use-osmosis-chain";
import { usePreviousWhen } from "~/hooks/use-previous-when";
import {
  useIsTransactionInProgress,
  useSignAndBroadcast,
} from "~/hooks/use-sign-and-broadcast";
import { useWallets } from "~/hooks/use-wallets";
import { api, RouterInputs } from "~/utils/trpc";

export type SwapState = ReturnType<typeof useSwap>;
export type SwapAsset = ReturnType<typeof useSwapAsset>["asset"];
export type SendTradeTokenInTx = ReturnType<
  typeof useSwap
>["sendTradeTokenInTx"];

const DefaultSlippage = "0.1";

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
  quoteType?: QuoteDirection;
};

// Note: For computing spot price between token in and out, we use this multiplier
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
export function useSwap(
  {
    initialFromDenom = "ATOM",
    initialToDenom = "OSMO",
    useQueryParams = true,
    useOtherCurrencies = true,
    forceSwapInPoolId,
    maxSlippage,
    quoteType = "out-given-in",
  }: SwapOptions = { maxSlippage: undefined }
) {
  const { currentWallet } = useWallets();
  const osmosisChain = useOsmosisChain();
  const signAndBroadcast = useSignAndBroadcast();
  const { isTransactionInProgress } = useIsTransactionInProgress();

  // Memoize options to prevent unnecessary re-renders of child hooks
  const swapAssetsOptions = useMemo(
    () => ({
      initialFromDenom,
      initialToDenom,
      useQueryParams,
      useOtherCurrencies,
      poolId: forceSwapInPoolId,
    }),
    [
      initialFromDenom,
      initialToDenom,
      useQueryParams,
      useOtherCurrencies,
      forceSwapInPoolId,
    ]
  );

  const reverseSwapAssetsOptions = useMemo(
    () => ({
      ...swapAssetsOptions,
      reverse: true,
    }),
    [swapAssetsOptions]
  );

  const swapAssets = useSwapAssets(swapAssetsOptions);
  const reverseSwapAssets = useSwapAssets(reverseSwapAssetsOptions);

  const swapAmountInputOptions = useMemo(
    () => ({
      forceSwapInPoolId,
      maxSlippage,
      swapAssets,
    }),
    [forceSwapInPoolId, maxSlippage, swapAssets]
  );

  const reverseSwapAmountInputOptions = useMemo(
    () => ({
      forceSwapInPoolId,
      maxSlippage,
      swapAssets: reverseSwapAssets,
    }),
    [forceSwapInPoolId, maxSlippage, reverseSwapAssets]
  );

  const inAmountInput = useSwapAmountInput(swapAmountInputOptions);
  const outAmountInput = useSwapAmountInput(reverseSwapAmountInputOptions);

  // load flags
  const isToFromAssets = useMemo(
    () => Boolean(swapAssets.fromAsset) && Boolean(swapAssets.toAsset),
    [swapAssets.fromAsset, swapAssets.toAsset]
  );

  const quoteQueryEnabled = useMemo(
    () =>
      isToFromAssets &&
      Boolean(inAmountInput.debouncedInAmount?.toDec().isPositive()) &&
      // since input is debounced there could be the wrong asset associated
      // with the input amount when switching assets
      inAmountInput.debouncedInAmount?.currency.coinMinimalDenom ===
        swapAssets.fromAsset?.coinMinimalDenom &&
      inAmountInput.amount?.currency.coinMinimalDenom ===
        swapAssets.fromAsset?.coinMinimalDenom &&
      !isTransactionInProgress &&
      quoteType === "out-given-in",
    [
      isToFromAssets,
      inAmountInput.debouncedInAmount,
      inAmountInput.amount,
      swapAssets.fromAsset,
      isTransactionInProgress,
      quoteType,
    ]
  );

  const inGivenOutQuoteEnabled = useMemo(
    () =>
      isToFromAssets &&
      Boolean(outAmountInput.debouncedInAmount?.toDec().isPositive()) &&
      outAmountInput.debouncedInAmount?.currency.coinMinimalDenom ===
        swapAssets.toAsset?.coinMinimalDenom &&
      outAmountInput.amount?.currency.coinMinimalDenom ===
        swapAssets.toAsset?.coinMinimalDenom &&
      !isTransactionInProgress &&
      quoteType === "in-given-out",
    [
      isToFromAssets,
      outAmountInput.debouncedInAmount,
      outAmountInput.amount,
      swapAssets.toAsset,
      isTransactionInProgress,
      quoteType,
    ]
  );

  const outGivenInQuoteParams = useMemo(
    () => ({
      tokenIn: swapAssets.fromAsset,
      tokenOut: swapAssets.toAsset,
      tokenInAmount: inAmountInput.debouncedInAmount?.toCoin().amount ?? "0",
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    }),
    [
      swapAssets.fromAsset,
      swapAssets.toAsset,
      inAmountInput.debouncedInAmount,
      forceSwapInPoolId,
      maxSlippage,
    ]
  );

  const inGivenOutQuoteParams = useMemo(
    () => ({
      tokenIn: swapAssets.fromAsset!,
      tokenOut: swapAssets.toAsset!,
      tokenInAmount: outAmountInput.debouncedInAmount?.toCoin().amount ?? "0",
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    }),
    [
      swapAssets.fromAsset,
      swapAssets.toAsset,
      outAmountInput.debouncedInAmount,
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
    inAmountInputIsTyping: boolean;
    inAmountInputIsEmpty: boolean;
    outAmountInputIsTyping: boolean;
    outAmountInputIsEmpty: boolean;
  } | null>(null);

  useEffect(() => {
    // Create a snapshot of current state
    const currentState = {
      quoteType,
      isQuoteLoading: isQuoteLoading_,
      isInGivenOutQuoteLoading: isInGivenOutQuoteLoading_,
      quoteErrorMsg,
      inGivenOutQuoteError,
      inAmountInputIsTyping: inAmountInput.isTyping,
      inAmountInputIsEmpty: inAmountInput.isEmpty,
      outAmountInputIsTyping: outAmountInput.isTyping,
      outAmountInputIsEmpty: outAmountInput.isEmpty,
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
      !outAmountInput.isTyping
    ) {
      inAmountInput.setAmount(
        inGivenOutQuote && !inGivenOutQuoteError && !outAmountInput.isEmpty
          ? trimPlaceholderZeros(inGivenOutQuote.amount.toDec().toString())
          : ""
      );
    }

    if (
      quoteType === "out-given-in" &&
      !isQuoteLoading_ &&
      !inAmountInput.isTyping
    ) {
      outAmountInput.setAmount(
        quote && !quoteErrorMsg && !inAmountInput.isEmpty
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
    const tokenInDecimals = swapAssets.fromAsset?.coinDecimals ?? 0;
    const tokenInAmount = DecUtils.getTenExponentN(tokenInDecimals)
      .quoRoundUp(spotPriceQuoteMultiplier)
      .truncate()
      .toString();

    return {
      tokenIn: swapAssets.fromAsset!,
      tokenOut: swapAssets.toAsset!,
      tokenInAmount,
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    };
  }, [
    swapAssets.fromAsset,
    swapAssets.toAsset,
    forceSwapInPoolId,
    maxSlippage,
  ]);

  const {
    data: spotPriceQuote,
    isLoading: isSpotPriceQuoteLoading,
    errorMsg: spotPriceQuoteErrorMsg,
  } = useQueryRouterBestQuote(spotPriceQuoteParams, isToFromAssets);

  /** Collate errors coming first from user input and then tRPC and serialize accordingly. */
  const precedentError:
    | (NoRouteError | NotEnoughLiquidityError | Error | undefined)
    | typeof inAmountInput.error = useMemo(() => {
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
    if (!inAmountInput.isEmpty && inAmountInput.error)
      return inAmountInput.error;
  }, [
    quoteErrorMsg,
    quote,
    spotPriceQuoteErrorMsg,
    inAmountInput.error,
    inAmountInput.isEmpty,
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
      inAmountInput.debouncedInAmount !== null &&
      inAmountInput.balance &&
      inAmountInput.amount &&
      inAmountInput.debouncedInAmount
        .toDec()
        .lte(inAmountInput.balance.toDec()) &&
      inAmountInput.amount.toDec().lte(inAmountInput.balance.toDec()) &&
      outAmountInput.debouncedInAmount !== null &&
      Boolean(outAmountInput.amount),
    [
      precedentError,
      isQuoteLoading,
      quoteQueryEnabled,
      inGivenOutQuoteEnabled,
      quote?.messages,
      currentWallet?.address,
      inAmountInput.debouncedInAmount,
      inAmountInput.balance,
      inAmountInput.amount,
      outAmountInput.debouncedInAmount,
      outAmountInput.amount,
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
      !inAmountInput.balance ||
      !inAmountInput.amount ||
      !maxSlippage
    )
      return false;

    const balance = inAmountInput.balance;
    const amountWithSlippage = inAmountInput.amount
      .toDec()
      .mul(new Dec(1).add(maxSlippage));
    return balance.toDec().lt(amountWithSlippage);
  }, [inAmountInput.balance, inAmountInput.amount, maxSlippage, quoteType]);

  /** Send trade token in transaction. */
  const sendTradeTokenInTx = useCallback(
    () =>
      new Promise<"multiroute" | "multihop" | "exact-in">(
        async (resolve, reject) => {
          if (!quote || !quote.messages)
            return reject(new Error("Quote is not specified."));
          if (!maxSlippage)
            return reject(new Error("Max slippage is not defined."));
          if (!inAmountInput.amount || !outAmountInput.amount)
            return reject(new Error("Input amount is not specified."));
          if (!currentWallet)
            return reject(new Error("Account information is missing."));
          if (!swapAssets.fromAsset)
            return reject(new Error("From asset is not specified."));
          if (!swapAssets.toAsset)
            return reject(new Error("To asset is not specified."));

          let txParams: ReturnType<typeof getSwapTxParameters>;
          try {
            txParams = getSwapTxParameters({
              coinAmount:
                quoteType === "out-given-in"
                  ? inAmountInput.amount.toCoin().amount
                  : outAmountInput.amount.toCoin().amount,
              maxSlippage: maxSlippage.toString(),
              tokenInCoinMinimalDenom: swapAssets.fromAsset.coinMinimalDenom,
              tokenOutCoinMinimalDenom: swapAssets.toAsset.coinMinimalDenom,
              tokenOutCoinDecimals: swapAssets.toAsset.coinDecimals,
              tokenInCoinDecimals: swapAssets.fromAsset.coinDecimals,
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
      swapAssets.fromAsset,
      swapAssets.toAsset,
    ]
  );

  const shouldKeepPrevQuote = useCallback(
    () =>
      Boolean(quote?.amount.toDec().isPositive()) &&
      !quoteErrorMsg &&
      !inAmountInput.isEmpty,
    [quote, quoteErrorMsg, inAmountInput.isEmpty]
  );

  const positivePrevQuote = usePreviousWhen(quote, shouldKeepPrevQuote);

  const quoteBaseOutSpotPrice = useMemo(() => {
    // get in/out spot price from quote if user requested a quote
    if (
      inAmountInput.amount &&
      quote &&
      swapAssets.toAsset &&
      quoteType === "out-given-in"
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
    } else if (
      outAmountInput.amount &&
      quote &&
      swapAssets.toAsset &&
      quoteType === "in-given-out"
    ) {
      return new CoinPretty(
        swapAssets.toAsset,
        outAmountInput.amount
          .toDec()
          .quo(quote.amount.toDec())
          .mulTruncate(
            DecUtils.getTenExponentN(swapAssets.toAsset.coinDecimals)
          )
      );
    }
  }, [
    inAmountInput.amount,
    quote,
    swapAssets.toAsset,
    outAmountInput.amount,
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
        swapAssets.fromAsset,
        quote?.tokenInFeeAmount,
        inAmountInput.price
      ),
    [inAmountInput.price, quote?.tokenInFeeAmount, swapAssets.fromAsset]
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
        inAmountInput.fiatValue?.toDec()
      ).sub(tokenInFeeAmountFiatValue);
    } else {
      return (
        outAmountInput.fiatValue ??
        new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))
      );
    }
  }, [
    inAmountInput.fiatValue,
    quote?.priceImpactTokenOut,
    tokenInFeeAmountFiatValue,
    quoteType,
    outAmountInput.fiatValue,
  ]);

  const totalFee = useDeepMemo(
    () =>
      sum([
        tokenInFeeAmountFiatValue,
        networkFee?.gasUsdValueToPay?.toDec() ?? new Dec(0),
      ]),
    [tokenInFeeAmountFiatValue, networkFee?.gasUsdValueToPay]
  );

  // Memoize the final return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      ...swapAssets,
      inAmountInput,
      outAmountInput,
      tokenOutFiatValue,
      tokenInFeeAmountFiatValue,
      quote:
        isQuoteLoading || inAmountInput.isTyping
          ? positivePrevQuote
          : !quoteErrorMsg
          ? quote
          : undefined,
      inBaseOutQuoteSpotPrice,
      totalFee,
      networkFee,
      isLoadingNetworkFee:
        inAmountInput.isLoadingCurrentBalanceNetworkFee || isLoadingNetworkFee,
      networkFeeError,
      error: precedentError,
      spotPriceQuote,
      isSpotPriceQuoteLoading,
      spotPriceQuoteErrorMsg,
      isQuoteLoading,
      sendTradeTokenInTx,
      isSlippageOverBalance,
      quoteType,
    }),
    [
      swapAssets,
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
      isSlippageOverBalance,
      quoteType,
    ]
  );
}

const DefaultDenoms = ["ATOM", "OSMO"];

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
export function determineNextFallbackFromDenom(params: {
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

export function determineNextFallbackToDenom(params: {
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
  reverse = false,
}: {
  initialFromDenom?: string;
  initialToDenom?: string;
  useQueryParams?: boolean;
  useOtherCurrencies?: boolean;
  poolId?: string;
  reverse?: boolean;
} = {}) {
  const { currentWallet } = useWallets();

  const {
    fromAssetDenom,
    toAssetDenom,
    setFromAssetDenom,
    setToAssetDenom,
    switchAssets,
  } = useToFromDenoms({
    initialFromDenom,
    initialToDenom,
    reverse,
  });

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

export type UseSwapAmountInputReturn = ReturnType<typeof useSwapAmountInput>;

function useSwapAmountInput({
  swapAssets,
  forceSwapInPoolId,
  maxSlippage,
}: {
  swapAssets: ReturnType<typeof useSwapAssets>;
  forceSwapInPoolId: string | undefined;
  maxSlippage: Dec | undefined;
}) {
  const osmosisChain = useOsmosisChain();
  const [gasAmount, setGasAmount] = useState<CoinPretty>();
  const { isTransactionInProgress } = useIsTransactionInProgress();

  const inAmountInput = useAmountInput({
    currency: swapAssets.fromAsset,
    gasAmount: gasAmount,
  });

  const balanceQuoteQueryEnabled = useMemo(
    () =>
      !isTransactionInProgress &&
      Boolean(swapAssets.fromAsset) &&
      Boolean(swapAssets.toAsset) &&
      // since the in amount is debounced, the asset could be wrong when switching assets
      inAmountInput.debouncedInAmount?.currency.coinMinimalDenom ===
        swapAssets.fromAsset!.coinMinimalDenom &&
      inAmountInput.amount?.currency.coinMinimalDenom ===
        swapAssets.fromAsset!.coinMinimalDenom &&
      !!inAmountInput.balance &&
      !inAmountInput.balance.toDec().isZero() &&
      inAmountInput.balance.currency.coinMinimalDenom ===
        swapAssets.fromAsset?.coinMinimalDenom,
    [
      isTransactionInProgress,
      swapAssets.fromAsset,
      swapAssets.toAsset,
      inAmountInput.debouncedInAmount,
      inAmountInput.amount,
      inAmountInput.balance,
    ]
  );

  const balanceQuoteParams = useMemo(
    () => ({
      tokenIn: swapAssets.fromAsset!,
      tokenOut: swapAssets.toAsset!,
      tokenInAmount: inAmountInput.balance?.toCoin().amount ?? "",
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    }),
    [
      swapAssets.fromAsset,
      swapAssets.toAsset,
      inAmountInput.balance,
      forceSwapInPoolId,
      maxSlippage,
    ]
  );

  const {
    data: quoteForCurrentBalance,
    isLoading: isQuoteForCurrentBalanceLoading_,
    errorMsg: quoteForCurrentBalanceErrorMsg,
  } = useQueryRouterBestQuote(balanceQuoteParams, balanceQuoteQueryEnabled);

  const isQuoteForCurrentBalanceLoading = useMemo(
    () => isQuoteForCurrentBalanceLoading_ && balanceQuoteQueryEnabled,
    [isQuoteForCurrentBalanceLoading_, balanceQuoteQueryEnabled]
  );

  const networkFeeQueryEnabled = useMemo(
    () =>
      !isQuoteForCurrentBalanceLoading &&
      balanceQuoteQueryEnabled &&
      Boolean(quoteForCurrentBalance),
    [
      isQuoteForCurrentBalanceLoading,
      balanceQuoteQueryEnabled,
      quoteForCurrentBalance,
    ]
  );

  const networkFeeParams = useMemo(
    () => ({
      chainId: osmosisChain.chain_id,
      messages: quoteForCurrentBalance?.messages ?? [],
      enabled: networkFeeQueryEnabled,
    }),
    [
      osmosisChain.chain_id,
      quoteForCurrentBalance?.messages,
      networkFeeQueryEnabled,
    ]
  );

  const {
    data: currentBalanceNetworkFee,
    isLoading: isLoadingCurrentBalanceNetworkFee_,
    error: currentBalanceNetworkFeeError,
  } = useEstimateTxFees(networkFeeParams);

  const isLoadingCurrentBalanceNetworkFee = useMemo(
    () => networkFeeQueryEnabled && isLoadingCurrentBalanceNetworkFee_,
    [networkFeeQueryEnabled, isLoadingCurrentBalanceNetworkFee_]
  );

  const hasErrorWithCurrentBalanceQuote = useMemo(
    () => !!currentBalanceNetworkFeeError || !!quoteForCurrentBalanceErrorMsg,
    [currentBalanceNetworkFeeError, quoteForCurrentBalanceErrorMsg]
  );

  const notEnoughBalanceForMax = useMemo(
    () =>
      currentBalanceNetworkFeeError?.message.includes(
        "min out amount or max in amount should be positive"
      ) ||
      currentBalanceNetworkFeeError?.message.includes(
        "No fee tokens found with sufficient balance on account"
      ) ||
      currentBalanceNetworkFeeError?.message.includes(
        "Insufficient alternative balance for transaction fees"
      ) ||
      quoteForCurrentBalanceErrorMsg?.includes(
        "Not enough quoted. Try increasing amount."
      ),
    [currentBalanceNetworkFeeError?.message, quoteForCurrentBalanceErrorMsg]
  );

  // Use a ref to track the last gas amount to prevent unnecessary updates
  const lastGasAmountRef = useRef<CoinPretty | undefined>();

  useEffect(() => {
    if (isNil(currentBalanceNetworkFee?.gasAmount)) return;

    const newGasAmount = currentBalanceNetworkFee.gasAmount.mul(new Dec(1.02)); // Add 2% buffer

    // Only update if the gas amount has changed significantly
    if (
      !lastGasAmountRef.current ||
      !lastGasAmountRef.current.toDec().equals(newGasAmount.toDec())
    ) {
      lastGasAmountRef.current = newGasAmount;
      setGasAmount(newGasAmount);
    }
  }, [currentBalanceNetworkFee?.gasAmount]);

  // Create the final result object with all the properties
  const result = useMemo(
    () => ({
      ...inAmountInput,
      isLoadingCurrentBalanceNetworkFee,
      hasErrorWithCurrentBalanceQuote,
      notEnoughBalanceForMax,
    }),
    [
      inAmountInput,
      isLoadingCurrentBalanceNetworkFee,
      hasErrorWithCurrentBalanceQuote,
      notEnoughBalanceForMax,
    ]
  );

  // Use deep memo to prevent unnecessary re-renders
  return useDeepMemo(() => result, [result]);
}

interface SwapDenomsState {
  fromAssetDenom?: string;
  toAssetDenom?: string;
  setFromAssetDenom: (denom?: string) => void;
  setToAssetDenom: (denom?: string) => void;
  switchAssets: () => void;
}

const useSwapDenomsStore = create<SwapDenomsState>((set) => ({
  fromAssetDenom: undefined,
  toAssetDenom: undefined,
  setFromAssetDenom: (denom) => set({ fromAssetDenom: denom }),
  setToAssetDenom: (denom) => set({ toAssetDenom: denom }),
  switchAssets: () =>
    set((state) => ({
      fromAssetDenom: state.toAssetDenom,
      toAssetDenom: state.fromAssetDenom,
    })),
}));

/**
 * Switches between using query parameters or React state to store 'from' and 'to' asset denominations.
 * If the user has set preferences via query parameters, the initial denominations will be ignored.
 */
function useToFromDenoms({
  initialFromDenom,
  initialToDenom,
  reverse = false,
}: {
  initialFromDenom?: string;
  initialToDenom?: string;
  reverse?: boolean;
}) {
  const {
    fromAssetDenom,
    toAssetDenom,
    setFromAssetDenom,
    setToAssetDenom,
    switchAssets,
  } = useSwapDenomsStore(
    useShallow((state) => ({
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

  return useMemo(
    () => ({
      fromAssetDenom: reverse ? toAssetDenom : fromAssetDenom,
      toAssetDenom: reverse ? fromAssetDenom : toAssetDenom,
      setFromAssetDenom,
      setToAssetDenom,
      switchAssets,
    }),
    [
      fromAssetDenom,
      toAssetDenom,
      reverse,
      setFromAssetDenom,
      setToAssetDenom,
      switchAssets,
    ]
  );
}

/** Gets recommended assets directly from asset list. */
export function useRecommendedAssets(
  fromCoinMinimalDenom?: string,
  toCoinMinimalDenom?: string
) {
  const { data: recommendedAssets } =
    api.local.assets.getSwapRecommendedAssets.useQuery(undefined, {
      select: useCallback(
        (data: MinimalAsset[]) =>
          data.filter(
            (asset: MinimalAsset) =>
              asset.coinMinimalDenom !== fromCoinMinimalDenom &&
              asset.coinMinimalDenom !== toCoinMinimalDenom
          ),
        [fromCoinMinimalDenom, toCoinMinimalDenom]
      ),
    });
  return recommendedAssets;
}

/** Will query for an individual asset of any type of denom (symbol, min denom)
 *  if it's not already in the list of existing assets. */
export function useSwapAsset<TAsset extends MinimalAsset>({
  minDenomOrSymbol,
  existingAssets = [],
}: {
  minDenomOrSymbol?: string;
  existingAssets: TAsset[] | undefined;
}) {
  const { currentWallet } = useWallets();
  const { data: asset } = api.local.assets.getUserAsset.useQuery(
    {
      findMinDenomOrSymbol: minDenomOrSymbol!,
      userOsmoAddress: currentWallet?.address,
    },
    {
      enabled: !!minDenomOrSymbol,
    }
  );

  /** If `coinDenom` or `coinMinimalDenom` don't yield a result, we
   *  can fall back to the getAssets query which will perform
   *  a more comprehensive search. */
  const existingAsset = useMemo(
    () =>
      existingAssets.find(
        (asset) =>
          asset.coinDenom === minDenomOrSymbol ||
          asset.coinMinimalDenom === minDenomOrSymbol
      ),
    [existingAssets, minDenomOrSymbol]
  );

  const result = useMemo(
    () => ({
      asset: existingAsset ?? (asset as TAsset | undefined),
    }),
    [existingAsset, asset]
  );

  return result;
}

/** Iterates over available and identical routers and sends input to each one individually.
 *  Results are reduced to best result by out amount.
 *  Also returns the number of routers that have fetched and errored. */
function useQueryRouterBestQuote(
  input: Omit<
    RouterInputs["local"]["quoteRouter"]["routeTokenOutGivenIn"],
    "preferredRouter" | "tokenInDenom" | "tokenOutDenom" | "maxSlippage"
  > & {
    tokenIn:
      | (MinimalAsset &
          Partial<{
            amount: CoinPretty;
            usdValue: PricePretty;
          }>)
      | undefined;
    tokenOut:
      | (MinimalAsset &
          Partial<{
            amount: CoinPretty;
            usdValue: PricePretty;
          }>)
      | undefined;
    maxSlippage: Dec | undefined;
  },
  enabled: boolean,
  quoteType: QuoteDirection = "out-given-in"
) {
  const { currentWallet } = useWallets();

  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = useMemo(
    () => ({
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
    }),
    []
  );

  // Memoize in-given-out query parameters
  const inGivenOutParams = useMemo(
    () => ({
      tokenOutAmount: input.tokenInAmount ?? "",
      tokenOutDenom: input.tokenOut?.coinMinimalDenom ?? "",
      tokenInDenom: input.tokenIn?.coinMinimalDenom ?? "",
      forcePoolId: input.forcePoolId,
    }),
    [
      input.tokenInAmount,
      input.tokenOut?.coinMinimalDenom,
      input.tokenIn?.coinMinimalDenom,
      input.forcePoolId,
    ]
  );

  // Memoize in-given-out query options
  const inGivenOutOptions = useMemo(
    () => ({
      ...queryOptions,
      enabled: enabled && quoteType === "in-given-out",

      // Longer refetch and cache times due to query inefficiencies. Can be removed once that is fixed.
      staleTime: 10_000,
      cacheTime: 10_000,
      refetchInterval: 10_000,
    }),
    [queryOptions, enabled, quoteType]
  );

  const inGivenOutQuote = api.local.quoteRouter.routeTokenInGivenOut.useQuery(
    inGivenOutParams,
    inGivenOutOptions
  );

  // Memoize out-given-in query parameters
  const outGivenInParams = useMemo(
    () => ({
      tokenInAmount: input.tokenInAmount,
      tokenInDenom: input.tokenIn?.coinMinimalDenom ?? "",
      tokenOutDenom: input.tokenOut?.coinMinimalDenom ?? "",
      forcePoolId: input.forcePoolId,
    }),
    [
      input.tokenInAmount,
      input.tokenIn?.coinMinimalDenom,
      input.tokenOut?.coinMinimalDenom,
      input.forcePoolId,
    ]
  );

  // Memoize out-given-in query options
  const outGivenInOptions = useMemo(
    () => ({
      ...queryOptions,
      enabled: enabled && quoteType === "out-given-in",
    }),
    [queryOptions, enabled, quoteType]
  );

  const outGivenInQuote = api.local.quoteRouter.routeTokenOutGivenIn.useQuery(
    outGivenInParams,
    outGivenInOptions
  );

  // Select the appropriate quote based on quote type
  const {
    data: quote,
    isSuccess,
    isError,
    error,
  } = useDeepMemo(() => {
    return quoteType === "out-given-in" ? outGivenInQuote : inGivenOutQuote;
  }, [quoteType, outGivenInQuote, inGivenOutQuote]);

  // Process the accepted quote
  const acceptedQuote = useDeepMemo(() => {
    if (
      !quote ||
      !input.tokenIn ||
      !input.tokenOut ||
      quote.amount.toDec().isZero()
    )
      return;
    return {
      ...quote,
      amountIn:
        quoteType === "out-given-in"
          ? new CoinPretty(input.tokenIn, input.tokenInAmount)
          : quote.amount,
      amountOut:
        quoteType === "out-given-in"
          ? quote.amount
          : new CoinPretty(input.tokenOut, input.tokenInAmount),
    };
  }, [quote, quoteType, input.tokenInAmount, input.tokenIn, input.tokenOut]);

  // Memoize the async parameters to prevent unnecessary recalculations
  const asyncParams = useMemo(
    () => ({
      tokenOutCoinDecimals: input.tokenOut?.coinDecimals,
      tokenInCoinMinimalDenom: input.tokenIn?.coinMinimalDenom,
      tokenInCoinDecimals: input.tokenIn?.coinDecimals,
      tokenOutCoinMinimalDenom: input.tokenOut?.coinMinimalDenom,
      address: currentWallet?.address,
      quote,
      maxSlippage: input.maxSlippage?.toString() ?? DefaultSlippage,
      coinAmount: input.tokenInAmount,
      quoteType,
    }),
    [
      input.tokenOut?.coinDecimals,
      input.tokenIn?.coinMinimalDenom,
      input.tokenIn?.coinDecimals,
      input.tokenOut?.coinMinimalDenom,
      currentWallet?.address,
      quote,
      input.maxSlippage,
      input.tokenInAmount,
      quoteType,
    ]
  );

  // Get swap messages
  const { value: messages } = useAsync(async () => {
    const {
      tokenOutCoinDecimals,
      tokenInCoinMinimalDenom,
      tokenInCoinDecimals,
      tokenOutCoinMinimalDenom,
      address,
      quote,
      maxSlippage,
      coinAmount,
      quoteType,
    } = asyncParams;

    if (
      !quote ||
      typeof tokenOutCoinDecimals === "undefined" ||
      !tokenInCoinMinimalDenom ||
      !tokenOutCoinMinimalDenom ||
      typeof tokenInCoinDecimals === "undefined" ||
      !address
    )
      return undefined;

    const messages = await getSwapMessages({
      quote,
      tokenOutCoinMinimalDenom,
      tokenInCoinDecimals: tokenInCoinDecimals!,
      tokenOutCoinDecimals: tokenOutCoinDecimals!,
      tokenInCoinMinimalDenom,
      maxSlippage,
      coinAmount,
      userOsmoAddress: address,
      quoteType,
    });

    return messages;
  }, [asyncParams]);

  // Combine quote data with messages
  const quoteData = useDeepMemo(
    () => (acceptedQuote ? { ...acceptedQuote, messages } : undefined),
    [acceptedQuote, messages]
  );

  // Return the final result
  return useMemo(
    () => ({
      data: quoteData,
      isLoading: !isSuccess,
      errorMsg: error?.message,
      numSucceeded: isSuccess ? 1 : 0,
      numError: isError ? 1 : 0,
    }),
    [quoteData, isSuccess, error?.message, isError]
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

/**
 * Calculates the input or output amount for a swap with slippage applied.
 * For in-given-out this is the max input amount, for out-given-in this is the minimum output amount.
 *
 * @param swapState - The swap state object.
 * @param slippageConfig - The slippage configuration object.
 * @param quoteType - The type of quote to use.
 * @returns The amount with slippage applied in both token and fiat values.
 */
export function useAmountWithSlippage({
  swapState,
  slippageConfig,
  quoteType,
}: {
  swapState: SwapState;
  slippageConfig: ObservableSlippageConfig;
  quoteType: QuoteDirection;
}) {
  const { amountWithSlippage, fiatAmountWithSlippage } = useMemo(() => {
    if (quoteType === "out-given-in") {
      const oneMinusSlippage = new Dec(1).sub(slippageConfig.slippage.toDec());
      const amountWithSlippage = swapState.quote
        ? new IntPretty(swapState.quote.amount.toDec().mul(oneMinusSlippage))
        : undefined;
      const fiatAmountWithSlippage = swapState.tokenOutFiatValue
        ? new PricePretty(
            DEFAULT_VS_CURRENCY,
            swapState.tokenOutFiatValue?.toDec().mul(oneMinusSlippage)
          )
        : undefined;

      return { amountWithSlippage, fiatAmountWithSlippage };
    }

    if (quoteType === "in-given-out") {
      const onePlusSlippage = new Dec(1).add(slippageConfig.slippage.toDec());
      const amountWithSlippage = swapState.quote
        ? new IntPretty(swapState.quote.amount.toDec().mul(onePlusSlippage))
        : new IntPretty(0);
      const balance = new IntPretty(
        swapState.inAmountInput.balance?.toDec() ?? new Dec(0)
      );
      // We want to cap this amount to the user's balance. This should never be visible unless the swap is viable,
      // which implies the user has enough balance.
      const maxAmountWithSlippage =
        amountWithSlippage > balance && !balance.toDec().isZero()
          ? balance
          : amountWithSlippage;

      const fiatAmountWithSlippage = mulPrice(
        new CoinPretty(
          swapState.fromAsset as Currency,
          maxAmountWithSlippage.mul(
            DecUtils.getTenExponentN(swapState.fromAsset?.coinDecimals ?? 0)
          )
        ),
        swapState.inAmountInput.price,
        DEFAULT_VS_CURRENCY
      );
      return {
        amountWithSlippage: maxAmountWithSlippage,
        fiatAmountWithSlippage,
      };
    }

    return {
      amountWithSlippage: undefined,
      fiatAmountWithSlippage: undefined,
    };
  }, [
    slippageConfig.slippage,
    swapState.quote,
    swapState.tokenOutFiatValue,
    quoteType,
    swapState.fromAsset,
    swapState.inAmountInput.price,
    swapState.inAmountInput.balance,
  ]);

  return useMemo(
    () => ({
      amountWithSlippage,
      fiatAmountWithSlippage,
    }),
    [amountWithSlippage, fiatAmountWithSlippage]
  );
}

/** Dynamically adjusts slippage for in-given-out quotes up to a maximum of 5% */
export function useDynamicSlippageConfig({
  slippageConfig,
  feeError,
  quoteType = "out-given-in",
}: {
  slippageConfig: ObservableSlippageConfig;
  feeError?: Error | null;
  quoteType: QuoteDirection;
}) {
  // Cache the error message to prevent unnecessary re-renders
  const errorMessage = useMemo(() => feeError?.message, [feeError?.message]);

  // Extract amounts from error message only when needed
  const errorAmounts = useMemo(() => {
    if (
      errorMessage &&
      (errorMessage.includes("Swap requires") ||
        errorMessage.includes("is greater than max amount")) &&
      quoteType === "in-given-out"
    ) {
      return extractSwapRequiredErrorAmounts(errorMessage);
    }
    return null;
  }, [errorMessage, quoteType]);

  useEffect(() => {
    if (!errorAmounts) return;

    const [required, sent] = errorAmounts;
    if (!required || !sent) return;

    const slippage = new Dec(1).add(slippageConfig.slippage.toDec());
    const amountPreSlippage = new Dec(sent).quo(slippage);
    const slippageRequired = new Dec(required).quo(amountPreSlippage);

    if (slippageRequired.gt(slippage) && slippage.lt(new Dec(1.05))) {
      const [index, amount] = slippageConfig.getSmallestSlippage(
        slippageRequired.sub(new Dec(1))
      );

      slippageConfig.select(index as number);
      slippageConfig.setDefaultSlippage(
        trimPlaceholderZeros(
          (amount as Dec)
            .mul(DecUtils.getTenExponentNInPrecisionRange(2))
            .toString()
        )
      );
    }
  }, [errorAmounts, slippageConfig]);
}

/** Extracts the numerical values from the swap required error
 *
 * e.g. Error: Fetch error. failed to execute message; message index: 0:
 * Swap requires 498419192699272362737ibc/E47F4E97C534C95B942729E1B25DBDE111EA791411CFF100515050BEA0AC0C6B,
 * which is greater than the amount 497246119581463551214: calculated amount is larger than max amount
 *
 * returns ["498419192699272362737", "497246119581463551214"]
 */
function extractSwapRequiredErrorAmounts(str: string) {
  const regex = /^\d+/;
  const split = str
    .split(" ")
    .map((s) => {
      const stripped = s.replace("(", "").replace(")", "");
      if (regex.test(stripped)) {
        return stripped.match(regex)?.[0] ?? undefined;
      }
    })
    .filter(Boolean);

  return [split[1], split[2]];
}
