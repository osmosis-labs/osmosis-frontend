import { priceToTick } from "@osmosis-labs/math";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import {
  makeExecuteCosmwasmContractMsg,
  QuoteDirection,
} from "@osmosis-labs/tx";
import { CoinPretty, Dec, Int, PricePretty } from "@osmosis-labs/unit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAsync } from "react-use";

import { tError } from "~/components/localization";
import { EventName, EventPage, OUTLIER_USD_VALUE_THRESHOLD } from "~/config";
import {
  isValidNumericalRawInput,
  useAmountInput,
} from "~/hooks/input/use-amount-input";
import { useTranslation } from "~/hooks/language";
import { useOrderbook } from "~/hooks/limit-orders/use-orderbook";
import { onAdd1CTSession } from "~/hooks/mutations/one-click-trading";
import { onEnd1CTSession } from "~/hooks/mutations/one-click-trading/use-remove-one-click-trading-session";
import { use1CTSwapReviewMessages } from "~/hooks/one-click-trading";
import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { useSwap, useSwapAssets } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { countDecimals, trimPlaceholderZeros } from "~/utils/number";
import { api } from "~/utils/trpc";

function getNormalizationFactor(
  baseAssetDecimals: number,
  quoteAssetDecimals: number
) {
  return new Dec(10).pow(new Int(quoteAssetDecimals - baseAssetDecimals));
}

export type OrderDirection = "bid" | "ask";

export const MIN_ORDER_VALUE =
  process.env.NEXT_PUBLIC_LIMIT_ORDER_MIN_AMOUNT ?? "";

interface UsePlaceLimitParams {
  osmosisChainId: string;
  orderDirection: OrderDirection;
  useQueryParams?: boolean;
  useOtherCurrencies?: boolean;
  baseDenom: string;
  quoteDenom: string;
  type: "limit" | "market";
  page: EventPage;
  maxSlippage?: Dec;
  quoteType?: QuoteDirection;
}

export type PlaceLimitState = ReturnType<typeof usePlaceLimit>;

// TODO: adjust as necessary
const CLAIM_BOUNTY = "0.0001";

export const usePlaceLimit = ({
  osmosisChainId,
  quoteDenom,
  baseDenom,
  orderDirection,
  useQueryParams = false,
  useOtherCurrencies = true,
  type,
  page,
  maxSlippage,
  quoteType = "out-given-in",
}: UsePlaceLimitParams) => {
  const apiUtils = api.useUtils();
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();
  const { accountStore } = useStore();
  const {
    makerFee,
    isMakerFeeLoading,
    contractAddress: orderbookContractAddress,
    error: orderbookError,
  } = useOrderbook({
    quoteDenom,
    baseDenom,
  });

  const isMarket = useMemo(
    () => type === "market",
    //|| priceState.isBeyondOppositePrice
    // Disabled auto market placing but can be readded with the above conditional
    [type]
  );

  const swapAssets = useSwapAssets({
    initialFromDenom: baseDenom,
    initialToDenom: quoteDenom,
    useQueryParams,
    useOtherCurrencies,
  });

  const inAmountInput = useAmountInput({
    currency: swapAssets.fromAsset,
  });

  const marketState = useSwap({
    initialFromDenom: orderDirection === "ask" ? baseDenom : quoteDenom,
    initialToDenom: orderDirection === "ask" ? quoteDenom : baseDenom,
    useQueryParams: false,
    useOtherCurrencies,
    maxSlippage,
    quoteType: type !== "market" ? "out-given-in" : quoteType,
  });

  const quoteAsset = swapAssets.toAsset;
  const baseAsset = swapAssets.fromAsset;

  const account = accountStore.getWallet(osmosisChainId);

  // TODO: Readd this once orderbooks support non-stablecoin pairs
  // const { price: quoteAssetPrice } = usePrice({
  //   coinMinimalDenom: quoteAsset?.coinMinimalDenom ?? "",
  // });
  const quoteAssetPrice = useMemo(
    () => new PricePretty(DEFAULT_VS_CURRENCY, new Dec(1)),
    []
  );

  const { price: baseAssetPrice } = usePrice({
    coinMinimalDenom: baseAsset?.coinMinimalDenom ?? "",
  });

  /**
   * Calculates the amount of tokens to be sent with the order.
   * In the case of an Ask order the amount sent is the amount of tokens defined by the user in terms of the base asset.
   * In the case of a Bid order the amount sent is the requested fiat amount divided by the current quote asset price.
   * The amount is then multiplied by the number of decimal places the quote asset has.
   *
   * @returns The amount of tokens to be sent with the order in base asset amounts for an Ask and quote asset amounts for a Bid.
   */
  const paymentTokenValue = useMemo(() => {
    if (!quoteAsset || !baseAsset) return;

    if (isMarket)
      return (
        marketState.inAmountInput.amount ??
        new CoinPretty(
          orderDirection === "ask" ? baseAsset : quoteAsset,
          new Dec(0)
        )
      );
    // The amount of tokens the user wishes to buy/sell
    const baseTokenAmount =
      inAmountInput.amount ?? new CoinPretty(baseAsset, new Dec(0));
    if (orderDirection === "ask") {
      // In the case of an Ask we just return the amount requested to sell
      return baseTokenAmount;
    }

    // Determine the outgoing fiat amount the user wants to buy
    const outgoingFiatValue =
      marketState.inAmountInput.amount?.toDec() ?? new Dec(0);

    // Determine the amount of quote asset tokens to send by dividing the outgoing fiat amount by the current quote asset price
    // Multiply by 10^n where n is the amount of decimals for the quote asset
    const quoteTokenAmount = outgoingFiatValue!
      .quo(quoteAssetPrice.toDec() ?? new Dec(1))
      .mul(new Dec(Math.pow(10, quoteAsset!.coinDecimals)));
    return new CoinPretty(quoteAsset!, quoteTokenAmount);
  }, [
    quoteAssetPrice,
    baseAsset,
    orderDirection,
    inAmountInput.amount,
    quoteAsset,
    isMarket,
    marketState.inAmountInput.amount,
  ]);

  const normalizationFactor = useMemo(() => {
    if (!baseAsset || !quoteAsset) return new Dec(1);
    return getNormalizationFactor(
      baseAsset.coinDecimals,
      quoteAsset!.coinDecimals
    );
  }, [baseAsset, quoteAsset]);

  const priceState = useLimitPrice({
    orderDirection,
    baseDenom: baseAsset?.coinMinimalDenom,
    normalizationFactor,
  });

  /**
   * Determines the fiat amount the user will pay for their order.
   * In the case of an Ask the fiat amount is the amount of tokens the user will sell multiplied by the currently selected price.
   * In the case of a Bid the fiat amount is the amount of quote asset tokens the user will send multiplied by the current price of the quote asset.
   */
  const paymentFiatValue = useMemo(() => {
    if (isMarket)
      return (
        marketState.inAmountInput.fiatValue ??
        new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))
      );
    return orderDirection === "ask"
      ? mulPrice(
          paymentTokenValue,
          new PricePretty(DEFAULT_VS_CURRENCY, priceState.price),
          DEFAULT_VS_CURRENCY
        )
      : mulPrice(paymentTokenValue, quoteAssetPrice, DEFAULT_VS_CURRENCY);
  }, [
    paymentTokenValue,
    orderDirection,
    quoteAssetPrice,
    priceState,
    isMarket,
    marketState.inAmountInput.fiatValue,
  ]);

  const feeUsdValue = useMemo(() => {
    return (
      paymentFiatValue?.mul(makerFee) ??
      new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))
    );
  }, [paymentFiatValue, makerFee]);

  const placeLimitMsg = useMemo(() => {
    if (isMarket || !priceState.isValidPrice) return;

    const quantity = paymentTokenValue?.toCoin().amount ?? "0";

    if (quantity === "0") {
      return;
    }

    try {
      // The requested price must account for the ratio between the quote and base asset as the base asset may not be a stablecoin.
      // To account for this we divide by the quote asset price.
      const tickId = priceToTick(
        priceState.price.quo(quoteAssetPrice.toDec()).mul(normalizationFactor)
      );
      const msg = {
        place_limit: {
          tick_id: parseInt(tickId.toString()),
          order_direction: orderDirection,
          quantity,
          claim_bounty: CLAIM_BOUNTY,
        },
      };

      return msg;
    } catch (error) {
      console.error("Error attempting to place limit order", error);
      return;
    }
  }, [
    orderDirection,
    priceState.price,
    quoteAssetPrice,
    normalizationFactor,
    paymentTokenValue,
    priceState.isValidPrice,
    isMarket,
  ]);

  const { value: encodedMsg } = useAsync(async () => {
    if (!placeLimitMsg) return;

    return await makeExecuteCosmwasmContractMsg({
      contract: orderbookContractAddress,
      sender: account?.address ?? "",
      msg: placeLimitMsg,
      funds: [
        {
          denom: paymentTokenValue?.toCoin().denom ?? "",
          amount: paymentTokenValue?.toCoin().amount ?? "0",
        },
      ],
    });
  }, [
    account?.address,
    orderbookContractAddress,
    paymentTokenValue,
    placeLimitMsg,
  ]);

  const { oneClickMessages, isLoadingOneClickMessages, shouldSend1CTTx } =
    use1CTSwapReviewMessages();

  /**
   * Default isLedger to true, just in case the wallet does
   * not return the correct value
   */
  const { value: isLedger } = useAsync(async () => {
    const result = await account?.client?.getAccount?.(
      accountStore.osmosisChainId
    );
    return result?.isNanoLedger ?? true;
    // Disable deps to include account address in order to recompute the value as the others are memoized mobx values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, account?.address, accountStore.osmosisChainId]);

  const limitMessages = useMemo(() => {
    if (isLedger) {
      return encodedMsg && !isMarket ? [encodedMsg] : [];
    }

    return encodedMsg && !isMarket
      ? [encodedMsg, ...(oneClickMessages?.msgs ?? [])]
      : [];
  }, [encodedMsg, isLedger, isMarket, oneClickMessages?.msgs]);

  const placeLimit = useCallback(async () => {
    const quantity = paymentTokenValue?.toCoin().amount ?? "0";
    if (quantity === "0") {
      return;
    }

    if (isMarket) {
      let valueUsd = Number(
        marketState.inAmountInput.fiatValue?.toDec().toString() ?? "0"
      );

      // Protect our data from outliers
      // Perhaps from upstream issues with price data providers
      if (isNaN(valueUsd) || valueUsd > OUTLIER_USD_VALUE_THRESHOLD) {
        valueUsd = 0;
      }

      const baseEvent = {
        fromToken: marketState.fromAsset?.coinDenom,
        tokenAmount: Number(
          marketState.inAmountInput.amount?.toDec().toString() ?? "0"
        ),
        toToken: marketState.toAsset?.coinDenom,
        isOnHome: page === "Swap Page",
        isMultiHop: marketState.quote?.split.some(
          ({ pools }) => pools.length !== 1
        ),
        isMultiRoute: (marketState.quote?.split.length ?? 0) > 1,
        valueUsd,
        feeValueUsd: Number(marketState.totalFee?.toString() ?? "0"),
        page,
        quoteTimeMilliseconds: marketState.quote?.timeMs,
        swapSource: "market" as "swap" | "market",
      };
      try {
        logEvent([EventName.Swap.swapStarted, baseEvent]);
        const result = await marketState.sendTradeTokenInTx();
        logEvent([
          EventName.Swap.swapCompleted,
          {
            ...baseEvent,
            isMultiHop: result === "multihop",
          },
        ]);
      } catch (error) {
        console.error("swap failed", error);
        if (error instanceof Error && error.message === "Request rejected") {
          // don't log when the user rejects in wallet
          return;
        }
        logEvent([EventName.Swap.swapFailed, baseEvent]);
      } finally {
        return;
      }
    }

    if (!limitMessages || limitMessages.length === 0) return;

    const paymentDenom = paymentTokenValue?.toCoin().denom ?? "";

    let valueUsd = Number(paymentFiatValue?.toDec().toString() ?? "0");
    // Protect our data from outliers
    // Perhaps from upstream issues with price data providers
    if (isNaN(valueUsd) || valueUsd > OUTLIER_USD_VALUE_THRESHOLD) {
      valueUsd = 0;
    }

    const baseEvent = {
      type: orderDirection === "bid" ? "buy" : "sell",
      fromToken: paymentDenom,
      toToken:
        orderDirection === "bid" ? baseAsset?.coinDenom : quoteAsset?.coinDenom,
      valueUsd,
      tokenAmount: Number(quantity),
      page,
      isOnHomePage: page === "Swap Page",
      feeUsdValue,
    };

    try {
      logEvent([EventName.LimitOrder.placeOrderStarted, baseEvent]);
      /**
       * If it's ledger and we have one-click messages, we need to add a 1CT session
       * before broadcasting the transaction as there is a payload limit on ledger
       */
      if (
        isLedger &&
        oneClickMessages &&
        oneClickMessages.msgs &&
        shouldSend1CTTx
      ) {
        await accountStore.signAndBroadcast(
          accountStore.osmosisChainId,
          "Add 1CT session",
          oneClickMessages.msgs,
          undefined,
          undefined,
          undefined,
          async (tx) => {
            const { code } = tx;
            if (code) {
              throw new Error("Failed to send swap exact amount in message");
            } else {
              if (
                oneClickMessages &&
                oneClickMessages.type === "create-1ct-session"
              ) {
                await onAdd1CTSession({
                  privateKey: oneClickMessages.key,
                  tx,
                  userOsmoAddress: account?.address ?? "",
                  fallbackGetAuthenticatorId:
                    apiUtils.local.oneClickTrading.getSessionAuthenticator
                      .fetch,
                  accountStore,
                  allowedMessages: oneClickMessages.allowedMessages,
                  sessionPeriod: oneClickMessages.sessionPeriod,
                  spendLimitTokenDecimals:
                    oneClickMessages.spendLimitTokenDecimals,
                  transaction1CTParams: oneClickMessages.transaction1CTParams,
                  allowedAmount: oneClickMessages.allowedAmount,
                  t,
                  logEvent,
                });
              } else if (
                shouldSend1CTTx &&
                oneClickMessages &&
                oneClickMessages.type === "remove-1ct-session"
              ) {
                await onEnd1CTSession({
                  accountStore,
                  authenticatorId: oneClickMessages.authenticatorId,
                  logEvent,
                });
              }
            }
          }
        );

        await accountStore.signAndBroadcast(
          accountStore.osmosisChainId,
          "executeWasm",
          limitMessages
        );
      } else {
        await accountStore.signAndBroadcast(
          accountStore.osmosisChainId,
          "executeWasm",
          limitMessages,
          "",
          undefined,
          undefined,
          (tx) => {
            if (!tx.code) {
              if (
                shouldSend1CTTx &&
                oneClickMessages &&
                oneClickMessages.type === "create-1ct-session"
              ) {
                onAdd1CTSession({
                  privateKey: oneClickMessages.key,
                  tx,
                  userOsmoAddress: account?.address ?? "",
                  fallbackGetAuthenticatorId:
                    apiUtils.local.oneClickTrading.getSessionAuthenticator
                      .fetch,
                  accountStore,
                  allowedMessages: oneClickMessages.allowedMessages,
                  sessionPeriod: oneClickMessages.sessionPeriod,
                  spendLimitTokenDecimals:
                    oneClickMessages.spendLimitTokenDecimals,
                  transaction1CTParams: oneClickMessages.transaction1CTParams,
                  allowedAmount: oneClickMessages.allowedAmount,
                  t,
                  logEvent,
                });
              } else if (
                shouldSend1CTTx &&
                oneClickMessages &&
                oneClickMessages.type === "remove-1ct-session"
              ) {
                onEnd1CTSession({
                  accountStore,
                  authenticatorId: oneClickMessages.authenticatorId,
                  logEvent,
                });
              }
            }
          }
        );
      }
      logEvent([EventName.LimitOrder.placeOrderCompleted, baseEvent]);
    } catch (error) {
      console.error("Error attempting to broadcast place limit tx", error);
      if (error instanceof Error && error.message === "Request rejected") {
        // don't log when the user rejects in wallet
        return;
      }
      const { message } = error as Error;
      logEvent([
        EventName.LimitOrder.placeOrderFailed,
        { ...baseEvent, errorMessage: message },
      ]);
    }
  }, [
    paymentTokenValue,
    isMarket,
    limitMessages,
    paymentFiatValue,
    orderDirection,
    baseAsset?.coinDenom,
    quoteAsset?.coinDenom,
    page,
    feeUsdValue,
    marketState,
    logEvent,
    isLedger,
    oneClickMessages,
    shouldSend1CTTx,
    accountStore,
    account?.address,
    apiUtils.local.oneClickTrading.getSessionAuthenticator.fetch,
    t,
  ]);

  const { data, isLoading: isBalancesLoading } =
    api.edge.assets.getUserAssets.useQuery(
      {
        userOsmoAddress: account?.address ?? "",
      },
      {
        enabled: !!account?.address,
        select: ({ items }) =>
          items.filter(
            ({ coinMinimalDenom }) =>
              coinMinimalDenom.toLowerCase() ===
                baseAsset?.coinMinimalDenom?.toLowerCase() ||
              coinMinimalDenom.toLowerCase() ===
                quoteAsset?.coinMinimalDenom?.toLowerCase()
          ),
      }
    );

  const baseTokenBalance = useMemo(
    () =>
      data?.find(
        ({ coinMinimalDenom }) =>
          coinMinimalDenom.toLowerCase() ===
          baseAsset?.coinMinimalDenom.toLowerCase()
      )?.amount,
    [data, baseAsset]
  );
  const quoteTokenBalance = useMemo(
    () =>
      data?.find(
        ({ coinMinimalDenom }) =>
          coinMinimalDenom.toLowerCase() ===
          quoteAsset?.coinMinimalDenom?.toLowerCase()
      )?.amount,
    [data, quoteAsset]
  );

  const insufficientFunds = useMemo(() => {
    return orderDirection === "bid"
      ? (quoteTokenBalance?.toDec() ?? new Dec(0)).lt(
          paymentTokenValue?.toDec() ?? new Dec(0)
        )
      : (baseTokenBalance?.toDec() ?? new Dec(0)).lt(
          paymentTokenValue?.toDec() ?? new Dec(0)
        );
  }, [orderDirection, paymentTokenValue, baseTokenBalance, quoteTokenBalance]);

  const expectedTokenAmountOut = useMemo(() => {
    if (!baseAsset || !quoteAsset) return;

    if (isMarket) {
      return quoteType === "out-given-in"
        ? marketState.quote?.amount ??
            new CoinPretty(
              orderDirection === "ask" ? quoteAsset! : baseAsset!,
              new Dec(0)
            )
        : marketState.outAmountInput.amount ??
            new CoinPretty(
              orderDirection === "ask" ? baseAsset! : quoteAsset!,
              new Dec(0)
            );
    }
    const preFeeAmount =
      orderDirection === "ask"
        ? new CoinPretty(
            quoteAsset!,
            paymentFiatValue?.quo(quoteAssetPrice?.toDec() ?? new Dec(1)) ??
              new Dec(1)
          ).mul(new Dec(Math.pow(10, quoteAsset!.coinDecimals)))
        : inAmountInput.amount ?? new CoinPretty(baseAsset!, new Dec(0));
    return preFeeAmount.mul(new Dec(1).sub(makerFee));
  }, [
    inAmountInput.amount,
    marketState.outAmountInput.amount,
    baseAsset,
    quoteAsset,
    orderDirection,
    makerFee,
    quoteAssetPrice,
    paymentFiatValue,
    isMarket,
    marketState.quote?.amount,
    quoteType,
  ]);

  const expectedFiatAmountOut = useMemo(() => {
    if (isMarket) {
      return marketState.tokenOutFiatValue;
    }
    return orderDirection === "ask"
      ? new PricePretty(
          DEFAULT_VS_CURRENCY,
          quoteAssetPrice?.mul(expectedTokenAmountOut?.toDec() ?? new Dec(0)) ??
            new Dec(0)
        )
      : new PricePretty(
          DEFAULT_VS_CURRENCY,
          priceState.price?.mul(
            expectedTokenAmountOut?.toDec() ?? new Dec(0)
          ) ?? new Dec(0)
        );
  }, [
    priceState.price,
    expectedTokenAmountOut,
    orderDirection,
    quoteAssetPrice,
    isMarket,
    marketState.tokenOutFiatValue,
  ]);

  const reset = useCallback(() => {
    inAmountInput.reset();
    priceState.reset();
    marketState.inAmountInput.reset();
    marketState.outAmountInput.reset();
  }, [inAmountInput, priceState, marketState]);

  const error = useMemo(() => {
    if (!isMarket && orderbookError) {
      return orderbookError;
    }

    if (insufficientFunds) {
      return "limitOrders.insufficientFunds";
    }

    if (isMarket && marketState.error) {
      return tError(marketState.error)[0];
    }

    const quantity = paymentTokenValue?.toCoin().amount ?? "0";
    if (quantity === "0") {
      return "errors.zeroAmount";
    }

    if (!isMarket && priceState.priceError) {
      return priceState.priceError;
    }

    if (
      !isMarket &&
      !!MIN_ORDER_VALUE &&
      isValidNumericalRawInput(MIN_ORDER_VALUE) &&
      !!paymentFiatValue &&
      paymentFiatValue?.toDec().lt(new Dec(MIN_ORDER_VALUE))
    ) {
      return "limitOrders.belowMinimumAmount";
    }

    return;
  }, [
    insufficientFunds,
    isMarket,
    marketState.error,
    paymentTokenValue,
    orderbookError,
    priceState.priceError,
    paymentFiatValue,
  ]);

  const shouldEstimateLimitGas = useMemo(() => {
    return (
      !isMarket &&
      !!encodedMsg &&
      !!account?.address &&
      !insufficientFunds &&
      !inAmountInput.isTyping &&
      !marketState.inAmountInput.isTyping
    );
  }, [
    isMarket,
    encodedMsg,
    account?.address,
    insufficientFunds,
    inAmountInput.isTyping,
    marketState.inAmountInput.isTyping,
  ]);

  const {
    data: gasEstimate,
    isLoading: gasFeeLoading,
    error: limitGasError,
  } = useEstimateTxFees({
    chainId: accountStore.osmosisChainId,
    messages: limitMessages,
    enabled: shouldEstimateLimitGas,
  });

  const gasAmountFiat = useMemo(() => {
    if (isMarket) {
      return marketState.networkFee?.gasUsdValueToPay;
    }
    return gasEstimate?.gasUsdValueToPay;
  }, [
    isMarket,
    marketState.networkFee?.gasUsdValueToPay,
    gasEstimate?.gasUsdValueToPay,
  ]);

  const isGasLoading = useMemo(() => {
    if (isMarket) {
      return marketState.isLoadingNetworkFee;
    }
    return gasFeeLoading && shouldEstimateLimitGas;
  }, [
    isMarket,
    marketState.isLoadingNetworkFee,
    gasFeeLoading,
    shouldEstimateLimitGas,
  ]);

  const gasError = useMemo(() => {
    if (isMarket) {
      return marketState.networkFeeError;
    }
    return limitGasError;
  }, [isMarket, marketState.networkFeeError, limitGasError]);

  return {
    baseAsset,
    quoteAsset,
    priceState,
    inAmountInput,
    placeLimit,
    baseTokenBalance,
    quoteTokenBalance,
    isBalancesFetched: !isBalancesLoading,
    insufficientFunds,
    paymentFiatValue,
    paymentTokenValue,
    makerFee,
    isMakerFeeLoading,
    expectedTokenAmountOut,
    expectedFiatAmountOut,
    marketState,
    isMarket,
    quoteAssetPrice,
    baseAssetPrice,
    reset,
    error,
    feeUsdValue,
    isLoadingOneClickMessages,
    gas: {
      gasAmountFiat,
      isLoading: isGasLoading,
      error: gasError,
    },
  };
};

const DEFAULT_PERCENT_ADJUSTMENT = "0";

const MAX_TICK_PRICE = 340282300000000000000;
const MIN_TICK_PRICE = 0.000000000001;

/**
 * Handles the logic for the limit price selector.
 * Allows the user to input either a set fiat price or a percentage related to the current spot price.
 * Also returns relevant spot price for each direction.
 */
const useLimitPrice = ({
  orderDirection,
  baseDenom,
  normalizationFactor,
}: {
  orderDirection: OrderDirection;
  baseDenom?: string;
  normalizationFactor?: Dec;
}) => {
  const [priceLocked, setPriceLock] = useState(false);

  const {
    data: assetPrice,
    isLoading: loadingSpotPrice,
    isRefetching: isSpotPriceRefetching,
  } = api.edge.assets.getAssetPrice.useQuery(
    {
      coinMinimalDenom: baseDenom ?? "",
    },
    { refetchInterval: 5000, enabled: !!baseDenom && !priceLocked }
  );

  const [orderPrice, setOrderPrice] = useState("0");
  const [manualPercentAdjusted, setManualPercentAdjusted] = useState("0");

  const minPrice = useMemo(() => {
    return new Dec(MIN_TICK_PRICE).quo(normalizationFactor ?? new Dec(1));
  }, [normalizationFactor]);

  const maxPrice = useMemo(() => {
    return new Dec(MAX_TICK_PRICE).quo(normalizationFactor ?? new Dec(1));
  }, [normalizationFactor]);

  // Decimal version of the spot price, defaults to 1
  const spotPrice = useMemo(() => {
    return assetPrice
      ? new Dec(
          formatPretty(
            assetPrice.toDec(),
            getPriceExtendedFormatOptions(assetPrice.toDec())
          ).replace(/,/g, "")
        )
      : new Dec(1);
  }, [assetPrice]);

  const setPriceAsPercentageOfSpotPrice = useCallback(
    (percent: Dec, lockPrice = true, format = true) => {
      const percentAdjusted =
        orderDirection === "bid"
          ? // Adjust negatively for bid orders
            new Dec(1).sub(percent)
          : // Adjust positively for ask orders
            new Dec(1).add(percent);
      const newPrice = spotPrice.mul(percentAdjusted);

      setOrderPrice(
        format
          ? formatPretty(
              newPrice,
              getPriceExtendedFormatOptions(newPrice)
            ).replace(/,/g, "")
          : trimPlaceholderZeros(newPrice.toString())
      );
      setPriceLock(lockPrice);
    },
    [setOrderPrice, orderDirection, spotPrice]
  );

  // Sets a user based order price, if nothing is input it resets the form (including percentage adjustments)
  const setManualOrderPrice = useCallback(
    (price: string) => {
      if (countDecimals(price) > 12) {
        return;
      }

      if (!isValidNumericalRawInput(price)) return;

      const newPrice = new Dec(price.length > 0 ? price : "0");

      const percentAdjusted = newPrice
        .quo(spotPrice)
        .sub(new Dec(1))
        .mul(new Dec(100));

      const isPercentAdjustedTooLarge =
        percentAdjusted.toString().split(".")[0].length > 9;

      if (isPercentAdjustedTooLarge) return;

      setPriceLock(true);
      setOrderPrice(price);

      if (price.length === 0 || newPrice.isZero()) {
        setManualPercentAdjusted("");
        return;
      }

      setManualPercentAdjusted(
        percentAdjusted.isZero() || newPrice.isZero()
          ? "0"
          : trimPlaceholderZeros(
              formatPretty(percentAdjusted.abs(), {
                maxDecimals: 3,
              })
                .toString()
                .replace(/,/g, "")
            )
      );
    },
    [setOrderPrice, spotPrice]
  );

  // Adjusts the percentage for placing the order.
  // Adjusting the precentage also resets a user based input in order to maintain
  // a percentage related to the current spot price.
  const setManualPercentAdjustedSafe = useCallback(
    (percentAdjusted: string) => {
      if (percentAdjusted.startsWith(".")) {
        percentAdjusted = "0" + percentAdjusted;
      }

      if (
        percentAdjusted.length > 0 &&
        !isValidNumericalRawInput(percentAdjusted)
      )
        return;

      if (countDecimals(percentAdjusted) > 3) {
        // percentAdjusted = parseFloat(percentAdjusted).toFixed(10).toString();
        return;
      }

      const split = percentAdjusted.split(".");
      if (split[0].length > 9) {
        return;
      }

      // Do not allow the user to input 100% below current price
      if (
        orderDirection === "bid" &&
        percentAdjusted.length > 0 &&
        new Dec(percentAdjusted).gte(new Dec(100))
      ) {
        return;
      }

      setManualPercentAdjusted(percentAdjusted);

      if (!percentAdjusted) {
        setPriceAsPercentageOfSpotPrice(new Dec(0), false);
        return;
      }

      setPriceAsPercentageOfSpotPrice(
        new Dec(percentAdjusted).quo(new Dec(100)),
        false,
        false
      );
    },
    [setManualPercentAdjusted, orderDirection, setPriceAsPercentageOfSpotPrice]
  );
  // Whether the user's manual order price is a valid price
  const isValidInputPrice =
    Boolean(orderPrice) &&
    orderPrice.length > 0 &&
    !new Dec(orderPrice).isZero() &&
    new Dec(orderPrice).isPositive() &&
    new Dec(orderPrice).gte(minPrice) &&
    new Dec(orderPrice).lte(maxPrice);
  // The current price. If the user has input a manual order price then that is used, otherwise we look at the percentage adjusted.
  // If the user has a percentage adjusted input we calculate the price relative to the spot price
  // given the current direction of the order.
  // If the form is empty we default to a percentage relative to the spot price.
  const price = useMemo(() => {
    if (isValidInputPrice) {
      return new Dec(orderPrice);
    }

    const percent =
      manualPercentAdjusted.length > 0
        ? manualPercentAdjusted
        : DEFAULT_PERCENT_ADJUSTMENT;
    const percentAdjusted =
      orderDirection === "bid"
        ? // Adjust negatively for bid orders
          new Dec(1).sub(new Dec(percent).quo(new Dec(100)))
        : // Adjust positively for ask orders
          new Dec(1).add(new Dec(percent).quo(new Dec(100)));

    return spotPrice.mul(percentAdjusted);
  }, [
    orderPrice,
    spotPrice,
    manualPercentAdjusted,
    orderDirection,
    isValidInputPrice,
  ]);

  // The raw percentage adjusted based on the current order price state
  const percentAdjusted = useMemo(
    () =>
      !!manualPercentAdjusted
        ? new Dec(manualPercentAdjusted).quo(new Dec(100))
        : price.quo(spotPrice).sub(new Dec(1)),
    [price, spotPrice, manualPercentAdjusted]
  );

  // If the user is inputting a price that crosses over the spot price
  const isBeyondOppositePrice =
    orderDirection === "ask" ? spotPrice.gt(price) : spotPrice.lt(price);

  const priceFiat = useMemo(() => {
    return new PricePretty(DEFAULT_VS_CURRENCY, price);
  }, [price]);

  const reset = useCallback(() => {
    setManualPercentAdjusted("0");
    setOrderPrice("");
    setPriceLock(false);
  }, []);

  useEffect(() => {
    reset();
  }, [orderDirection, reset, baseDenom]);

  const isValidPrice =
    isValidInputPrice ||
    ((!orderPrice || new Dec(orderPrice).isZero()) && Boolean(spotPrice));

  const priceError = useMemo(() => {
    if (price.lt(minPrice)) {
      return "limitOrders.priceTooLow";
    }

    if (price.gt(maxPrice)) {
      return "limitOrders.priceTooHigh";
    }

    if (
      !(
        isValidInputPrice ||
        ((!orderPrice || new Dec(orderPrice).isZero()) && Boolean(spotPrice))
      )
    ) {
      return "limitOrders.invalidPrice";
    }
  }, [price, minPrice, maxPrice, isValidInputPrice, orderPrice, spotPrice]);

  return {
    spotPrice,
    orderPrice,
    price,
    priceFiat,
    manualPercentAdjusted,
    setPercentAdjusted: setManualPercentAdjustedSafe,
    _setPercentAdjustedUnsafe: setManualPercentAdjusted,
    percentAdjusted,
    isLoading: loadingSpotPrice,
    reset,
    setPrice: setManualOrderPrice,
    _setPriceUnsafe: setOrderPrice,
    isValidPrice,
    isBeyondOppositePrice,
    isSpotPriceRefetching,
    setPriceLock,
    priceLocked,
    setPriceAsPercentageOfSpotPrice,
    priceError,
  };
};
