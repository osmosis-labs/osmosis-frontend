import type { StdFee } from "@cosmjs/amino";
import {
  CoinPretty,
  Dec,
  DecUtils,
  IntPretty,
  PricePretty,
} from "@keplr-wallet/unit";
import {
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
} from "@osmosis-labs/pools";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { ObservableSlippageConfig, SignOptions } from "@osmosis-labs/stores";
import {
  getSwapMessages,
  getSwapTxParameters,
  QuoteDirection,
  SwapTxRouteInGivenOut,
  SwapTxRouteOutGivenIn,
} from "@osmosis-labs/tx";
import { Currency, MinimalAsset } from "@osmosis-labs/types";
import {
  getAssetFromAssetList,
  isNil,
  makeMinimalAsset,
  sum,
} from "@osmosis-labs/utils";
import { createTRPCReact } from "@trpc/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAsync } from "react-use";

import { displayToast, ToastType } from "~/components/alert";
import { isOverspendErrorMessage } from "~/components/alert/prettify";
import { Button } from "~/components/ui/button";
import { RecommendedSwapDenoms } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import {
  getTokenInFeeAmountFiatValue,
  getTokenOutFiatValue,
} from "~/hooks/fiat-getters";
import { useTranslation } from "~/hooks/language";
import { useOneClickTradingSession } from "~/hooks/one-click-trading";
import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import { AppRouter } from "~/server/api/root-router";
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api, RouterInputs } from "~/utils/trpc";

import { useAmountInput } from "./input/use-amount-input";
import { useDebouncedState } from "./use-debounced-state";
import { useFeatureFlags } from "./use-feature-flags";
import { usePreviousWhen } from "./use-previous-when";
import { useWalletSelect } from "./use-wallet-select";

export type SwapState = ReturnType<typeof useSwap>;
export type SwapAsset = ReturnType<typeof useSwapAsset>["asset"];

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
  /** Set to the number of milliseconds to debounce the input amount for both input and output.
   *  Defaults to 200ms. */
  inputDebounceMs?: number;
};

// Note: For computing spot price between token in and out, we use this multiplier
// for dividing 1 unit of amount in and then multiplying output amount.
// The reason is that high-value tokens such as WBTC cause price impact and
// spot price to be very off when swapping 1 unit of token in.
// This is a temporary hack to bypass the issue with high-value tokens.
// Long-term, we should allow custom quotes in SQS /tokens/prices query.
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
    inputDebounceMs,
  }: SwapOptions = { maxSlippage: undefined }
) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const featureFlags = useFeatureFlags();
  const { isOneClickTradingEnabled } = useOneClickTradingSession();
  const { t } = useTranslation();
  const { isLoading: isWalletLoading } = useWalletSelect();

  const swapAssets = useSwapAssets({
    initialFromDenom,
    initialToDenom,
    useQueryParams,
    useOtherCurrencies,
    poolId: forceSwapInPoolId,
  });

  const reverseSwapAssets = useSwapAssets({
    initialFromDenom,
    initialToDenom,
    useQueryParams,
    useOtherCurrencies,
    poolId: forceSwapInPoolId,
    reverse: true,
  });

  const inAmountInput = useSwapAmountInput({
    forceSwapInPoolId,
    maxSlippage,
    swapAssets,
    inputDebounceMs,
  });

  const outAmountInput = useSwapAmountInput({
    forceSwapInPoolId,
    maxSlippage,
    swapAssets: reverseSwapAssets,
    inputDebounceMs,
  });

  // load flags
  const isToFromAssets =
    Boolean(swapAssets.fromAsset) && Boolean(swapAssets.toAsset);

  const quoteQueryEnabled =
    isToFromAssets &&
    Boolean(inAmountInput.debouncedInAmount?.toDec().isPositive()) &&
    // since input is debounced there could be the wrong asset associated
    // with the input amount when switching assets
    inAmountInput.debouncedInAmount?.currency.coinMinimalDenom ===
      swapAssets.fromAsset?.coinMinimalDenom &&
    inAmountInput.amount?.currency.coinMinimalDenom ===
      swapAssets.fromAsset?.coinMinimalDenom &&
    !account?.txTypeInProgress &&
    !isWalletLoading &&
    quoteType === "out-given-in";

  const inGivenOutQuoteEnabled =
    isToFromAssets &&
    Boolean(outAmountInput.debouncedInAmount?.toDec().isPositive()) &&
    outAmountInput.debouncedInAmount?.currency.coinMinimalDenom ===
      swapAssets.toAsset?.coinMinimalDenom &&
    outAmountInput.amount?.currency.coinMinimalDenom ===
      swapAssets.toAsset?.coinMinimalDenom &&
    !account?.txTypeInProgress &&
    !isWalletLoading &&
    quoteType === "in-given-out";

  const {
    data: outGivenInQuote,
    isLoading: isQuoteLoading_,
    errorMsg: quoteErrorMsg,
  } = useQueryRouterBestQuote(
    {
      tokenIn: swapAssets.fromAsset,
      tokenOut: swapAssets.toAsset,
      tokenInAmount: inAmountInput.debouncedInAmount?.toCoin().amount ?? "0",
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    },
    quoteQueryEnabled
  );

  const {
    data: inGivenOutQuote,
    isLoading: isInGivenOutQuoteLoading_,
    errorMsg: inGivenOutQuoteError,
  } = useQueryRouterBestQuote(
    {
      tokenIn: swapAssets.fromAsset!,
      tokenOut: swapAssets.toAsset!,
      tokenInAmount: outAmountInput.debouncedInAmount?.toCoin().amount ?? "0",
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    },
    inGivenOutQuoteEnabled,
    "in-given-out"
  );

  const quote =
    quoteType === "in-given-out" ? inGivenOutQuote : outGivenInQuote;

  useEffect(() => {
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

    /**
     * We disable dependencies here to stop an infinite loop
     * from the inAmount/outAmount input states
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quoteType,
    inGivenOutQuote,
    quote,
    isQuoteLoading_,
    isInGivenOutQuoteLoading_,
    quoteErrorMsg,
    inGivenOutQuoteError,
    inAmountInput.isTyping,
    outAmountInput.isTyping,
    inAmountInput.isEmpty,
    outAmountInput.isEmpty,
  ]);

  /** If a query is not enabled, it is considered loading.
   *  Work around this by checking if the query is enabled and if the query is loading to be considered loading. */
  const isQuoteLoading =
    (isQuoteLoading_ && quoteQueryEnabled) ||
    (isInGivenOutQuoteLoading_ && inGivenOutQuoteEnabled);

  const {
    data: spotPriceQuote,
    isLoading: isSpotPriceQuoteLoading,
    errorMsg: spotPriceQuoteErrorMsg,
  } = useQueryRouterBestQuote(
    {
      tokenIn: swapAssets.fromAsset!,
      tokenOut: swapAssets.toAsset!,
      tokenInAmount: DecUtils.getTenExponentN(
        swapAssets.fromAsset?.coinDecimals ?? 0
      )
        .quoRoundUp(spotPriceQuoteMultiplier)
        .truncate()
        .toString(),
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    },
    isToFromAssets
  );

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

  const networkFeeQueryEnabled =
    featureFlags.swapToolSimulateFee &&
    !precedentError &&
    !isQuoteLoading &&
    (quoteQueryEnabled || inGivenOutQuoteEnabled) &&
    Boolean(quote?.messages) &&
    Boolean(account?.address) &&
    inAmountInput.debouncedInAmount !== null &&
    inAmountInput.balance &&
    inAmountInput.amount &&
    inAmountInput.debouncedInAmount
      .toDec()
      .lte(inAmountInput.balance.toDec()) &&
    inAmountInput.amount.toDec().lte(inAmountInput.balance.toDec()) &&
    outAmountInput.debouncedInAmount !== null &&
    Boolean(outAmountInput.amount);

  const {
    data: networkFee,
    error: networkFeeError,
    isLoading: isLoadingNetworkFee_,
  } = useEstimateTxFees({
    chainId: chainStore.osmosis.chainId,
    messages: quote?.messages,
    enabled: true,
    signOptions: {
      useOneClickTrading: isOneClickTradingEnabled,
    },
  });

  const isLoadingNetworkFee = isLoadingNetworkFee_ && networkFeeQueryEnabled;

  const hasOverSpendLimitError = useMemo(() => {
    if (
      !networkFeeError?.message ||
      !isOneClickTradingEnabled ||
      inAmountInput.isEmpty ||
      inAmountInput.inputAmount == "0" ||
      !isOverspendErrorMessage({ message: networkFeeError?.message })
    ) {
      return false;
    }

    return true;
  }, [
    networkFeeError,
    inAmountInput.inputAmount,
    inAmountInput.isEmpty,
    isOneClickTradingEnabled,
  ]);

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
          if (!maxSlippage)
            return reject(new Error("Max slippage is not defined."));
          if (!inAmountInput.amount || !outAmountInput.amount)
            return reject(new Error("Input amount is not specified."));
          if (!account)
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

          const messageCanBeSignedWithOneClickTrading = !isNil(quote?.messages)
            ? isOneClickTradingEnabled &&
              (await accountStore.shouldBeSignedWithOneClickTrading({
                messages: quote.messages,
              }))
            : false;

          let shouldBeSignedWithOneClickTrading =
            messageCanBeSignedWithOneClickTrading &&
            !hasOverSpendLimitError &&
            !networkFeeError;

          if (
            messageCanBeSignedWithOneClickTrading &&
            !hasOverSpendLimitError &&
            (networkFeeError ||
              networkFee?.amount.some(({ denom }) => denom !== "uosmo"))
          ) {
            try {
              const TOAST_ID = networkFeeError
                ? "ONE_CLICK_UNAVAILABLE"
                : "ONE_CLICK_INSUFFICIENT_OSMO";
              const titleTranslationKey = networkFeeError
                ? "oneClickTrading.toast.currentlyUnavailable"
                : "oneClickTrading.toast.insufficientFunds";
              const buttonText = networkFeeError
                ? "oneClickTrading.toast.approveManually"
                : "oneClickTrading.toast.continueWithoutOneClickTrading";

              await new Promise((continueTx, reject) => {
                displayToast(
                  {
                    titleTranslationKey,
                    captionElement: (
                      <Button
                        variant="link"
                        className="!h-auto self-start !px-0 !py-0  text-wosmongton-300"
                        onClick={() => {
                          toast.dismiss(TOAST_ID);
                          shouldBeSignedWithOneClickTrading = false;
                          continueTx(void 0);
                        }}
                      >
                        {t(buttonText, {
                          walletName: account.walletInfo?.prettyName ?? "",
                        })}
                      </Button>
                    ),
                  },
                  ToastType.ONE_CLICK_TRADING,
                  {
                    toastId: TOAST_ID,
                    onClose: () => {
                      reject();
                    },
                    autoClose: false,
                  }
                );
              });
            } catch (e) {
              return reject(new Error("Rejected manual approval"));
            }
          }

          const signOptions: (SignOptions & { fee?: StdFee }) | undefined = {
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
          if (quoteType === "out-given-in") {
            const { routes, tokenIn, tokenOutMinAmount } = txParams;
            const typedRoutes = routes as SwapTxRouteOutGivenIn[];
            if (routes.length === 1) {
              const { pools } = typedRoutes[0];
              account.osmosis
                .sendSwapExactAmountInMsg(
                  pools,
                  tokenIn!,
                  tokenOutMinAmount!,
                  undefined,
                  signOptions,
                  ({ code }) => {
                    if (code)
                      reject(
                        new Error("Failed to send swap exact amount in message")
                      );
                    else resolve(pools.length === 1 ? "exact-in" : "multihop");
                  }
                )
                .catch(reject);
            } else if (routes.length > 1) {
              account.osmosis
                .sendSplitRouteSwapExactAmountInMsg(
                  typedRoutes,
                  tokenIn!,
                  tokenOutMinAmount!,
                  undefined,
                  signOptions,
                  ({ code }) => {
                    if (code)
                      reject(
                        new Error(
                          "Failed to send split route swap exact amount in message"
                        )
                      );
                    else resolve("multiroute");
                  }
                )
                .catch(reject);
            } else {
              // should not be possible because button should be disabled
              reject(new Error("No routes given"));
            }
          } else {
            const { routes, tokenOut, tokenInMaxAmount } = txParams;
            const typedRoutes = routes as SwapTxRouteInGivenOut[];
            if (routes.length === 1) {
              const { pools } = typedRoutes[0];
              account.osmosis
                .sendSwapExactAmountOutMsg(
                  pools,
                  {
                    coinMinimalDenom: tokenOut!.coinMinimalDenom,
                    amount: tokenOut!.amount,
                  },
                  tokenInMaxAmount!,
                  undefined,
                  signOptions,
                  ({ code }) => {
                    if (code)
                      reject(
                        new Error("Failed to send swap exact amount in message")
                      );
                    else resolve(pools.length === 1 ? "exact-in" : "multihop");
                  }
                )
                .catch(reject);
            } else if (routes.length > 1) {
              account.osmosis
                .sendSplitRouteSwapExactAmountOutMsg(
                  typedRoutes,
                  tokenOut!,
                  tokenInMaxAmount!,
                  undefined,
                  signOptions,
                  ({ code }) => {
                    if (code)
                      reject(
                        new Error(
                          "Failed to send split route swap exact amount in message"
                        )
                      );
                    else resolve("multiroute");
                  }
                )
                .catch(reject);
            } else {
              // should not be possible because button should be disabled
              reject(new Error("No routes given"));
            }
          }
        }
      ).finally(() => {
        inAmountInput.reset();
        outAmountInput.reset();
      }),
    [
      maxSlippage,
      inAmountInput,
      account,
      quote,
      isOneClickTradingEnabled,
      accountStore,
      hasOverSpendLimitError,
      networkFeeError,
      featureFlags.swapToolSimulateFee,
      networkFee,
      swapAssets.fromAsset,
      swapAssets.toAsset,
      t,
      quoteType,
      outAmountInput,
    ]
  );

  const positivePrevQuote = usePreviousWhen(
    quote,
    useCallback(
      () =>
        Boolean(quote?.amount.toDec().isPositive()) &&
        !quoteErrorMsg &&
        !inAmountInput.isEmpty,
      [quote, quoteErrorMsg, inAmountInput.isEmpty]
    )
  );

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
  const tokenInFeeAmountFiatValue: PricePretty = useMemo(
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
  const tokenOutFiatValue: PricePretty = useMemo(() => {
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

  const quoteToReturn =
    isQuoteLoading || inAmountInput.isTyping
      ? positivePrevQuote
      : !quoteErrorMsg
      ? quote
      : undefined;

  const inAmount = inAmountInput.amount?.toDec();
  const inDebouncedAmount = inAmountInput.debouncedInAmount?.toDec();
  const outAmount = outAmountInput.amount?.toDec();
  const outDebouncedAmount = outAmountInput.debouncedInAmount?.toDec();

  const isReadyToSwap =
    maxSlippage?.isPositive() &&
    account &&
    swapAssets.fromAsset &&
    swapAssets.toAsset &&
    inAmount?.isPositive() &&
    inDebouncedAmount?.isPositive() &&
    inAmount?.equals(inDebouncedAmount) &&
    outAmount?.isPositive() &&
    outDebouncedAmount?.isPositive() &&
    outAmount?.equals(outDebouncedAmount) &&
    quoteToReturn &&
    !precedentError &&
    !hasOverSpendLimitError &&
    !isSlippageOverBalance;

  return {
    ...swapAssets,
    inAmountInput,
    outAmountInput,
    tokenOutFiatValue,
    tokenInFeeAmountFiatValue,
    quote: quoteToReturn,
    inBaseOutQuoteSpotPrice,
    totalFee: sum([
      tokenInFeeAmountFiatValue,
      networkFee?.gasUsdValueToPay?.toDec() ?? new Dec(0),
    ]),
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
    hasOverSpendLimitError,
    isSlippageOverBalance,
    quoteType,
    isReadyToSwap,
  };
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
  useQueryParams = true,
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
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  const {
    fromAssetDenom,
    toAssetDenom,
    setFromAssetDenom,
    setToAssetDenom,
    switchAssets,
  } = useToFromDenoms({
    useQueryParams,
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

  const { showPreviewAssets } = useShowPreviewAssets();

  const canLoadAssets =
    !isLoadingWallet &&
    Boolean(fromAssetDenom) &&
    Boolean(toAssetDenom) &&
    useOtherCurrencies;

  const {
    data: selectableAssetPages,
    isLoading: isLoadingSelectAssets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.edge.assets.getUserAssets.useInfiniteQuery(
    {
      poolId,
      search: queryInput,
      userOsmoAddress: account?.address,
      includePreview: showPreviewAssets,
      limit: 50, // items per page
    },
    {
      enabled: canLoadAssets,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,

      // avoid blocking
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const selectableAssets = useMemo(
    () =>
      useOtherCurrencies
        ? selectableAssetPages?.pages.flatMap(({ items }) => items) ?? []
        : [],
    [selectableAssetPages?.pages, useOtherCurrencies]
  );

  const { asset: fromAsset } = useSwapAsset({
    minDenomOrSymbol: fromAssetDenom,
    existingAssets: selectableAssets,
  });

  const { asset: toAsset } = useSwapAsset({
    minDenomOrSymbol: toAssetDenom,
    existingAssets: selectableAssets,
  });

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

  const recommendedAssets = useRecommendedAssets(
    fromAsset?.coinMinimalDenom,
    toAsset?.coinMinimalDenom
  );

  return {
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
  };
}

function useSwapAmountInput({
  swapAssets,
  forceSwapInPoolId,
  maxSlippage,
  inputDebounceMs = 200,
}: {
  swapAssets: ReturnType<typeof useSwapAssets>;
  forceSwapInPoolId: string | undefined;
  maxSlippage: Dec | undefined;
  inputDebounceMs?: number;
}) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  const featureFlags = useFeatureFlags();

  const [gasAmount, setGasAmount] = useState<CoinPretty>();

  const inAmountInput = useAmountInput({
    currency: swapAssets.fromAsset,
    gasAmount: gasAmount,
    inputDebounceMs,
  });

  const balanceQuoteQueryEnabled =
    featureFlags.swapToolSimulateFee &&
    !isLoadingWallet &&
    !account?.txTypeInProgress &&
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
      swapAssets.fromAsset?.coinMinimalDenom;
  const {
    data: quoteForCurrentBalance,
    isLoading: isQuoteForCurrentBalanceLoading_,
    errorMsg: quoteForCurrentBalanceErrorMsg,
  } = useQueryRouterBestQuote(
    {
      tokenIn: swapAssets.fromAsset!,
      tokenOut: swapAssets.toAsset!,
      tokenInAmount: inAmountInput.balance?.toCoin().amount!,
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    },
    balanceQuoteQueryEnabled
  );
  const isQuoteForCurrentBalanceLoading =
    isQuoteForCurrentBalanceLoading_ && balanceQuoteQueryEnabled;

  const { isOneClickTradingEnabled } = useOneClickTradingSession();

  const networkFeeQueryEnabled =
    !isQuoteForCurrentBalanceLoading &&
    balanceQuoteQueryEnabled &&
    Boolean(quoteForCurrentBalance);
  const {
    data: currentBalanceNetworkFee,
    isLoading: isLoadingCurrentBalanceNetworkFee_,
    error: currentBalanceNetworkFeeError,
  } = useEstimateTxFees({
    chainId: chainStore.osmosis.chainId,
    messages: quoteForCurrentBalance?.messages,
    enabled: networkFeeQueryEnabled,
    signOptions: {
      useOneClickTrading: isOneClickTradingEnabled,
    },
  });
  const isLoadingCurrentBalanceNetworkFee =
    networkFeeQueryEnabled && isLoadingCurrentBalanceNetworkFee_;

  const hasErrorWithCurrentBalanceQuote = useMemo(() => {
    return !!currentBalanceNetworkFeeError || !!quoteForCurrentBalanceErrorMsg;
  }, [currentBalanceNetworkFeeError, quoteForCurrentBalanceErrorMsg]);

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

  useEffect(() => {
    if (isNil(currentBalanceNetworkFee?.gasAmount)) return;

    setGasAmount(
      currentBalanceNetworkFee.gasAmount.mul(new Dec(1.02)) // Add 2% buffer
    );
  }, [currentBalanceNetworkFee?.gasAmount]);

  return {
    ...inAmountInput,
    isLoadingCurrentBalanceNetworkFee,
    hasErrorWithCurrentBalanceQuote,
    notEnoughBalanceForMax,
  };
}

/**
 * Switches between using query parameters or React state to store 'from' and 'to' asset denominations.
 * If the user has set preferences via query parameters, the initial denominations will be ignored.
 */
function useToFromDenoms({
  useQueryParams,
  initialFromDenom,
  initialToDenom,
  reverse = false,
}: {
  useQueryParams: boolean;
  initialFromDenom?: string;
  initialToDenom?: string;
  reverse?: boolean;
}) {
  /**
   * user query params as state source-of-truth
   * ignores initial denoms if there are query params
   */
  const [fromDenomQueryParam, setFromDenomQueryParam] = useQueryState(
    "from",
    parseAsString.withDefault(initialFromDenom ?? "ATOM")
  );
  const fromDenomQueryParamStr =
    typeof fromDenomQueryParam === "string" ? fromDenomQueryParam : undefined;
  const [toAssetQueryParam, setToAssetQueryParam] = useQueryState(
    "to",
    parseAsString.withDefault(initialToDenom ?? "OSMO")
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
      const temp = fromDenomQueryParam;
      setFromDenomQueryParam(toAssetQueryParam);
      setToAssetQueryParam(temp);
      return;
    }

    const temp = fromAssetState;
    setFromAssetState(toAssetState);
    setToAssetState(temp);
  };

  const fromAssetDenom = useQueryParams
    ? fromDenomQueryParamStr
    : fromAssetState;
  const toAssetDenom = useQueryParams ? toDenomQueryParamStr : toAssetState;

  return {
    fromAssetDenom: reverse ? toAssetDenom : fromAssetDenom,
    toAssetDenom: reverse ? fromAssetDenom : toAssetDenom,
    setFromAssetDenom: useQueryParams
      ? setFromDenomQueryParam
      : setFromAssetState,
    setToAssetDenom: useQueryParams ? setToAssetQueryParam : setToAssetState,
    switchAssets,
  };
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
  /** If `coinDenom` or `coinMinimalDenom` don't yield a result, we
   *  can fall back to the getAssets query which will perform
   *  a more comprehensive search. */
  const existingAsset = existingAssets.find(
    (asset) =>
      asset.coinDenom === minDenomOrSymbol ||
      asset.coinMinimalDenom === minDenomOrSymbol
  );

  const asset = useMemo(() => {
    if (existingAsset) return existingAsset;

    const asset = getAssetFromAssetList({
      assetLists: AssetLists,
      coinMinimalDenom: minDenomOrSymbol,
      symbol: minDenomOrSymbol,
    });

    if (!asset) return;

    return makeMinimalAsset(asset.rawAsset);
  }, [minDenomOrSymbol, existingAsset]);

  return {
    asset: existingAsset ?? (asset as TAsset | undefined),
  };
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
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const trpcReact = createTRPCReact<AppRouter>();

  const queryOptions = {
    // quotes should not be considered fresh for long, otherwise
    // the gas simulation will fail due to slippage and the user would see errors
    staleTime: 5_000,
    cacheTime: 5_000,
    refetchInterval: 5_000,

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
  };

  const inGivenOutQuote =
    trpcReact.local.quoteRouter.routeTokenInGivenOut.useQuery(
      {
        tokenOutAmount: input.tokenInAmount ?? "",
        tokenOutDenom: input.tokenOut?.coinMinimalDenom ?? "",
        tokenInDenom: input.tokenIn?.coinMinimalDenom ?? "",
        forcePoolId: input.forcePoolId,
      },
      {
        ...queryOptions,
        enabled: enabled && quoteType === "in-given-out",

        // Longer refetch and cache times due to query inefficiencies. Can be removed once that is fixed.
        staleTime: 10_000,
        cacheTime: 10_000,
        refetchInterval: 10_000,
      }
    );

  const outGivenInQuote =
    trpcReact.local.quoteRouter.routeTokenOutGivenIn.useQuery(
      {
        tokenInAmount: input.tokenInAmount,
        tokenInDenom: input.tokenIn?.coinMinimalDenom ?? "",
        tokenOutDenom: input.tokenOut?.coinMinimalDenom ?? "",
        forcePoolId: input.forcePoolId,
      },
      {
        ...queryOptions,
        enabled: enabled && quoteType === "out-given-in",
      }
    );

  const quoteResult =
    quoteType === "out-given-in" ? outGivenInQuote : inGivenOutQuote;
  const {
    data: quote,
    isSuccess,
    isError,
    error,
  } = useMemo(() => {
    return quoteResult;
  }, [quoteResult]);

  const acceptedQuote = useMemo(() => {
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

  const { value: messages } = useAsync(async () => {
    const tokenOutCoinDecimals = input.tokenOut?.coinDecimals;
    const tokenInCoinMinimalDenom = input.tokenIn?.coinMinimalDenom;
    const tokenInCoinDecimals = input.tokenIn?.coinDecimals;
    const tokenOutCoinMinimalDenom = input.tokenOut?.coinMinimalDenom;
    if (
      !quote ||
      typeof tokenOutCoinDecimals === "undefined" ||
      !tokenInCoinMinimalDenom ||
      !tokenOutCoinMinimalDenom ||
      typeof tokenInCoinDecimals === "undefined"
    )
      return undefined;
    const messages = await getSwapMessages({
      quote: quote,
      tokenOutCoinMinimalDenom,
      tokenInCoinDecimals: tokenInCoinDecimals!,
      tokenOutCoinDecimals: tokenOutCoinDecimals!,
      tokenInCoinMinimalDenom,
      maxSlippage: input.maxSlippage?.toString(),
      coinAmount: input.tokenInAmount,
      userOsmoAddress: account?.address,
      quoteType,
    });

    return messages;
  }, [
    account?.address,
    quote,
    input.maxSlippage,
    input.tokenIn?.coinMinimalDenom,
    input.tokenInAmount,
    input.tokenOut?.coinDecimals,
    input.tokenOut?.coinMinimalDenom,
    input.tokenIn?.coinDecimals,
    quoteType,
  ]);

  return {
    data: acceptedQuote ? { ...acceptedQuote, messages } : undefined,
    isLoading: !isSuccess,
    errorMsg: error?.message,
    numSucceeded: isSuccess ? 1 : 0,
    numError: isError ? 1 : 0,
  };
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

/** Gets recommended assets directly from asset list. */
export function useRecommendedAssets(
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

  return {
    amountWithSlippage,
    fiatAmountWithSlippage,
  };
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
  useEffect(() => {
    if (feeError) {
      if (
        (feeError.message.includes("Swap requires") ||
          feeError.message.includes("is greater than max amount")) &&
        quoteType === "in-given-out"
      ) {
        const amounts = extractSwapRequiredErrorAmounts(feeError.message);

        if (amounts) {
          const [required, sent] = amounts;
          const slippage = new Dec(1).add(slippageConfig.slippage.toDec());

          if (!required || !sent) return;

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
        } else {
          console.log("No amounts found");
        }
      }
    }
  }, [feeError, slippageConfig, quoteType]);
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
