import { StdFee } from "@cosmjs/amino";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import {
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
} from "@osmosis-labs/pools";
import type { RouterKey } from "@osmosis-labs/server";
import {
  makeSplitRoutesSwapExactAmountInMsg,
  makeSplitRoutesSwapExactAmountOutMsg,
  makeSwapExactAmountInMsg,
  makeSwapExactAmountOutMsg,
  SignOptions,
} from "@osmosis-labs/stores";
import { Currency, MinimalAsset } from "@osmosis-labs/types";
import {
  getAssetFromAssetList,
  isNil,
  makeMinimalAsset,
  sum,
} from "@osmosis-labs/utils";
import { createTRPCReact, TRPCClientError } from "@trpc/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

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
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import { AppRouter } from "~/server/api/root-router";
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api, RouterInputs, RouterOutputs } from "~/utils/trpc";

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
  quoteType?: QuoteType;
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
    quoteType,
  });

  const outAmountInput = useSwapAmountInput({
    forceSwapInPoolId,
    maxSlippage,
    swapAssets: reverseSwapAssets,
    quoteType,
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
    error: quoteError,
  } = useQueryRouterBestQuote(
    {
      tokenIn: swapAssets.fromAsset!,
      tokenOut: swapAssets.toAsset!,
      tokenInAmount: inAmountInput.debouncedInAmount?.toCoin().amount ?? "0",
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    },
    quoteQueryEnabled
  );

  const {
    data: inGivenOutQuote,
    isLoading: isInGivenOutQuoteLoading_,
    error: inGivenOutQuoteError,
  } = useQueryRouterBestQuote(
    {
      tokenIn: swapAssets.fromAsset!,
      tokenOut: swapAssets.toAsset!,
      tokenInAmount: outAmountInput.debouncedInAmount?.toCoin().amount ?? "0",
      forcePoolId: forceSwapInPoolId,
      maxSlippage,
    },
    inGivenOutQuoteEnabled,
    ["sidecar"],
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
        inGivenOutQuote && !inGivenOutQuoteError && !!outAmountInput.inputAmount
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
        quote && !quoteError && !!inAmountInput.inputAmount
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
    quoteError,
    inGivenOutQuoteError,
    inAmountInput.isTyping,
    outAmountInput.isTyping,
  ]);

  /** If a query is not enabled, it is considered loading.
   *  Work around this by checking if the query is enabled and if the query is loading to be considered loading. */
  const isQuoteLoading =
    (isQuoteLoading_ && quoteQueryEnabled) ||
    (isInGivenOutQuoteLoading_ && inGivenOutQuoteEnabled);

  const {
    data: spotPriceQuote,
    isLoading: isSpotPriceQuoteLoading,
    error: spotPriceQuoteError,
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
      quoteType === "out-given-in" ? inGivenOutQuoteError : quoteError;

    // only show spot price error if there's no quote
    if (
      (quote && !quote.amount.toDec().isPositive() && !error) ||
      (!quote && spotPriceQuoteError)
    )
      error = spotPriceQuoteError;

    const errorFromTrpc = makeRouterErrorFromTrpcError(error as any)?.error;
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
    inGivenOutQuoteError,
    quoteType,
  ]);

  const networkFeeQueryEnabled =
    featureFlags.swapToolSimulateFee &&
    !Boolean(precedentError) &&
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
    enabled: networkFeeQueryEnabled,
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
              maxSlippage,
              fromAsset: swapAssets.fromAsset,
              toAsset: swapAssets.toAsset,
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
                    currency: tokenOut!.currency,
                    amount: new Dec(tokenOut!.amount ?? "0")
                      .quo(
                        DecUtils.getTenExponentNInPrecisionRange(
                          tokenOut!.currency.coinDecimals
                        )
                      )
                      .toString(),
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
      ).finally(() => inAmountInput.reset()),
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
        Boolean(quote?.amountOut?.toDec().isPositive()) &&
        !quoteError &&
        !inAmountInput.isEmpty,
      [quote, quoteError, inAmountInput.isEmpty]
    )
  );

  const quoteBaseOutSpotPrice = useMemo(() => {
    // get in/out spot price from quote if user requested a quote
    if (inAmountInput.amount && quote && swapAssets.toAsset) {
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
  }, [inAmountInput.amount, quote, swapAssets.toAsset]);

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
    return getTokenOutFiatValue(
      quote?.priceImpactTokenOut?.toDec(),
      inAmountInput.fiatValue?.toDec()
    ).sub(tokenInFeeAmountFiatValue);
  }, [
    inAmountInput.fiatValue,
    quote?.priceImpactTokenOut,
    tokenInFeeAmountFiatValue,
  ]);

  return {
    ...swapAssets,
    inAmountInput,
    outAmountInput,
    tokenOutFiatValue,
    tokenInFeeAmountFiatValue,
    quote:
      isQuoteLoading || inAmountInput.isTyping
        ? positivePrevQuote
        : !Boolean(quoteError)
        ? quote
        : undefined,
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
    spotPriceQuoteError,
    isQuoteLoading,
    sendTradeTokenInTx,
    hasOverSpendLimitError,
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

export function useSwapAmountInput({
  swapAssets,
  forceSwapInPoolId,
  maxSlippage,
  quoteType = "out-given-in",
}: {
  swapAssets: ReturnType<typeof useSwapAssets>;
  forceSwapInPoolId: string | undefined;
  maxSlippage: Dec | undefined;
  quoteType?: QuoteType;
}) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  const featureFlags = useFeatureFlags();

  const [gasAmount, setGasAmount] = useState<CoinPretty>();

  const inAmountInput = useAmountInput({
    currency: swapAssets.fromAsset,
    gasAmount: gasAmount,
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
    error: quoteForCurrentBalanceError,
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
    Boolean(quoteForCurrentBalance) &&
    quoteType === "out-given-in";
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
    return !!currentBalanceNetworkFeeError || !!quoteForCurrentBalanceError;
  }, [currentBalanceNetworkFeeError, quoteForCurrentBalanceError]);

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
      quoteForCurrentBalanceError?.message.includes(
        "Not enough quoted. Try increasing amount."
      ),
    [
      currentBalanceNetworkFeeError?.message,
      quoteForCurrentBalanceError?.message,
    ]
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
export function useToFromDenoms({
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

type QuoteOutGivenIn =
  RouterOutputs["local"]["quoteRouter"]["routeTokenOutGivenIn"];
type QuoteInGivenOut =
  RouterOutputs["local"]["quoteRouter"]["routeTokenInGivenOut"];

type RouteOutGivenIn = QuoteOutGivenIn["split"][number];
type RouteInGivenOut = QuoteInGivenOut["split"][number];

type SwapTxPoolOutGivenIn = {
  id: string;
  tokenOutDenom: string;
};
type SwapTxRouteOutGivenIn = {
  pools: SwapTxPoolOutGivenIn[];
  tokenInAmount: string;
};

type SwapTxPoolInGivenOut = {
  id: string;
  tokenInDenom: string;
};
type SwapTxRouteInGivenOut = {
  pools: SwapTxPoolInGivenOut[];
  tokenOutAmount: string;
};

function getSwapTxParameters({
  coinAmount,
  maxSlippage,
  quote,
  fromAsset,
  toAsset,
  quoteType = "out-given-in",
}: {
  coinAmount: string;
  maxSlippage: Dec;
  quote: QuoteOutGivenIn | QuoteInGivenOut | undefined;
  fromAsset: MinimalAsset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  toAsset: MinimalAsset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  quoteType?: QuoteType;
}) {
  if (!quote) {
    throw new Error(
      "User input should be disabled if no route is found or is being generated"
    );
  }
  if (!coinAmount) throw new Error("No input");
  if (!fromAsset) throw new Error("No from asset");
  if (!toAsset) throw new Error("No to asset");

  if (quoteType === "out-given-in") {
    const routes: SwapTxRouteOutGivenIn[] = [];

    for (const route of quote.split) {
      const pools: SwapTxPoolOutGivenIn[] = [];
      const typedRoute = route as RouteOutGivenIn;
      for (let i = 0; i < route.pools.length; i++) {
        const pool = route.pools[i];

        pools.push({
          id: pool.id,
          tokenOutDenom: typedRoute.tokenOutDenoms[i],
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
  } else {
    const routes: SwapTxRouteInGivenOut[] = [];

    for (const route of quote.split) {
      const pools: SwapTxPoolInGivenOut[] = [];
      const typedRoute = route as RouteInGivenOut;

      for (let i = 0; i < route.pools.length; i++) {
        const pool = route.pools[i];
        pools.push({
          id: pool.id,
          tokenInDenom: typedRoute.tokenInDenoms[i],
        });
      }

      routes.push({
        pools: pools,
        tokenOutAmount: route.initialAmount.toString(),
      });
    }

    /** In amount converted to integer (remove decimals) */
    const tokenOut = {
      currency: toAsset as Currency,
      amount: coinAmount,
    };

    /** Out amount with slippage included */
    const tokenInMaxAmount = quote.amount
      .toDec()
      .mul(DecUtils.getTenExponentNInPrecisionRange(fromAsset.coinDecimals))
      .mul(new Dec(1).add(maxSlippage))
      .truncate()
      .toString();

    return {
      routes,
      tokenOut,
      tokenInMaxAmount,
    };
  }
}

function getSwapMessages({
  coinAmount,
  maxSlippage,
  quote,
  fromAsset,
  toAsset,
  userOsmoAddress,
  quoteType = "out-given-in",
}: {
  coinAmount: string;
  maxSlippage: Dec | undefined;
  quote: QuoteOutGivenIn | QuoteInGivenOut | undefined;
  fromAsset: MinimalAsset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  toAsset: MinimalAsset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  userOsmoAddress: string | undefined;
  quoteType?: QuoteType;
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
      quoteType,
    });
  } catch {
    return undefined;
  }

  if (quoteType === "out-given-in") {
    const { routes, tokenIn, tokenOutMinAmount } = txParams;

    const typedRoutes = routes as SwapTxRouteOutGivenIn[];
    const { pools } = typedRoutes[0];

    if (routes.length < 1) {
      throw new Error("Routes are empty");
    }

    return [
      routes.length === 1
        ? makeSwapExactAmountInMsg({
            pools,
            tokenIn: tokenIn!,
            tokenOutMinAmount: tokenOutMinAmount!,
            userOsmoAddress,
          })
        : makeSplitRoutesSwapExactAmountInMsg({
            routes: typedRoutes,
            tokenIn: tokenIn!,
            tokenOutMinAmount: tokenOutMinAmount!,
            userOsmoAddress,
          }),
    ];
  }

  if (quoteType === "in-given-out") {
    const { routes, tokenOut, tokenInMaxAmount } = txParams;

    const typedRoutes = routes as SwapTxRouteInGivenOut[];
    const { pools } = typedRoutes[0];

    if (routes.length < 1) {
      throw new Error("Routes are empty");
    }

    return [
      routes.length === 1
        ? makeSwapExactAmountOutMsg({
            pools,
            tokenOut: tokenOut!,
            tokenInMaxAmount: tokenInMaxAmount!,
            userOsmoAddress,
          })
        : makeSplitRoutesSwapExactAmountOutMsg({
            routes: typedRoutes,
            tokenOut: tokenOut!,
            tokenInMaxAmount: tokenInMaxAmount!,
            userOsmoAddress,
          }),
    ];
  }

  throw new Error(`Unsupported quote type ${quoteType}`);
}

export type QuoteType = "out-given-in" | "in-given-out";

/** Iterates over available and identical routers and sends input to each one individually.
 *  Results are reduced to best result by out amount.
 *  Also returns the number of routers that have fetched and errored. */
function useQueryRouterBestQuote(
  input: Omit<
    RouterInputs["local"]["quoteRouter"]["routeTokenOutGivenIn"],
    "preferredRouter" | "tokenInDenom" | "tokenOutDenom"
  > & {
    tokenIn: MinimalAsset &
      Partial<{
        amount: CoinPretty;
        usdValue: PricePretty;
      }>;
    tokenOut: MinimalAsset &
      Partial<{
        amount: CoinPretty;
        usdValue: PricePretty;
      }>;
    maxSlippage: Dec | undefined;
  },
  enabled: boolean,
  routerKeys = ["legacy", "sidecar", "tfm"] as RouterKey[],
  quoteType: QuoteType = "out-given-in"
) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const featureFlags = useFeatureFlags();

  if (
    quoteType === "in-given-out" &&
    (routerKeys.includes("legacy") || routerKeys.includes("tfm"))
  ) {
    throw new Error("In given out not implemented for legacy or tfm router");
  }

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

  const routerResults =
    quoteType === "out-given-in"
      ? trpcReact.useQueries((t) =>
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
              }
            )
          )
        )
      : trpcReact.useQueries((t) => [
          t.local.quoteRouter.routeTokenInGivenOut(
            {
              tokenOutAmount: input.tokenInAmount ?? "",
              tokenOutDenom: input.tokenOut?.coinMinimalDenom ?? "",
              tokenInDenom: input.tokenIn?.coinMinimalDenom ?? "",
              forcePoolId: input.forcePoolId,
              preferredRouter: "sidecar",
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
                    quoteType: "in-given-out",
                  }),
                };
              },

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
            }
          ),
        ]);

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

  const acceptedQuote = useMemo(() => {
    if (!bestData) return;
    return {
      ...bestData,
      amountIn:
        quoteType === "out-given-in"
          ? new CoinPretty(input.tokenIn, input.tokenInAmount)
          : bestData.amount,
      amountOut:
        quoteType === "out-given-in"
          ? bestData.amount
          : new CoinPretty(input.tokenOut, input.tokenInAmount),
    };
  }, [bestData, quoteType, input.tokenInAmount, input.tokenIn, input.tokenOut]);

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
    data: acceptedQuote,
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
