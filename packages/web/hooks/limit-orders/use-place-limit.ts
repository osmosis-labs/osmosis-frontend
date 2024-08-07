import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { priceToTick } from "@osmosis-labs/math";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { cosmwasmMsgOpts } from "@osmosis-labs/stores";
import { useCallback, useEffect, useMemo, useState } from "react";

import { tError } from "~/components/localization";
import { EventName, EventPage } from "~/config";
import {
  isValidNumericalRawInput,
  useAmountInput,
} from "~/hooks/input/use-amount-input";
import { useOrderbook } from "~/hooks/limit-orders/use-orderbook";
import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
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

export interface UsePlaceLimitParams {
  osmosisChainId: string;
  orderDirection: OrderDirection;
  useQueryParams?: boolean;
  useOtherCurrencies?: boolean;
  baseDenom: string;
  quoteDenom: string;
  type: "limit" | "market";
  page: EventPage;
  maxSlippage?: Dec;
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
}: UsePlaceLimitParams) => {
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
  });

  const quoteAsset = swapAssets.toAsset;
  const baseAsset = swapAssets.fromAsset;

  const priceState = useLimitPrice({
    orderDirection,
    baseDenom: baseAsset?.coinMinimalDenom,
  });

  const isMarket = useMemo(
    () => type === "market",
    //|| priceState.isBeyondOppositePrice
    // Disabled auto market placing but can be readded with the above conditional
    [type]
  );

  const account = accountStore.getWallet(osmosisChainId);

  // TODO: Readd this once orderbooks support non-stablecoin pairs
  // const { price: quoteAssetPrice } = usePrice({
  //   coinMinimalDenom: quoteAsset?.coinMinimalDenom ?? "",
  // });
  const quoteAssetPrice = useMemo(
    () => new PricePretty(DEFAULT_VS_CURRENCY, new Dec(1)),
    []
  );

  /**
   * Calculates the amount of tokens to be sent with the order.
   * In the case of an Ask order the amount sent is the amount of tokens defined by the user in terms of the base asset.
   * In the case of a Bid order the amount sent is the requested fiat amount divided by the current quote asset price.
   * The amount is then multiplied by the number of decimal places the quote asset has.
   *
   * @returns The amount of tokens to be sent with the order in base asset amounts for an Ask and quote asset amounts for a Bid.
   */
  const paymentTokenValue = useMemo(() => {
    if (isMarket)
      return (
        marketState.inAmountInput.amount ??
        new CoinPretty(
          orderDirection === "ask" ? baseAsset! : quoteAsset!,
          new Dec(0)
        )
      );
    // The amount of tokens the user wishes to buy/sell
    const baseTokenAmount =
      inAmountInput.amount ?? new CoinPretty(baseAsset!, new Dec(0));
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

  /**
   * When creating a market order we want to update the market state with the input amount
   * with the amount of base tokens.
   *
   * Only runs on an ASK order. A BID order is handled by the input directly.
   */
  useEffect(() => {
    if (orderDirection === "bid") return;

    const normalizedAmount = inAmountInput.amount?.toDec().toString() ?? "0";
    marketState.inAmountInput.setAmount(normalizedAmount);
  }, [inAmountInput.amount, orderDirection, marketState.inAmountInput]);

  const normalizationFactor = useMemo(() => {
    return getNormalizationFactor(
      baseAsset!.coinDecimals,
      quoteAsset!.coinDecimals
    );
  }, [baseAsset, quoteAsset]);

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
    if (isMarket) return;

    const quantity = paymentTokenValue.toCoin().amount ?? "0";

    if (quantity === "0") {
      return;
    }

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
  }, [
    orderDirection,
    priceState.price,
    quoteAssetPrice,
    normalizationFactor,
    paymentTokenValue,
    isMarket,
  ]);

  const encodedMsg = useMemo(() => {
    if (!placeLimitMsg) return;

    return cosmwasmMsgOpts.executeWasm.messageComposer({
      contract: orderbookContractAddress,
      sender: account?.address ?? "",
      msg: Buffer.from(JSON.stringify(placeLimitMsg)),
      funds: [
        {
          denom: paymentTokenValue.toCoin().denom,
          amount: paymentTokenValue.toCoin().amount ?? "0",
        },
      ],
    });
  }, [
    account?.address,
    orderbookContractAddress,
    paymentTokenValue,
    placeLimitMsg,
  ]);

  const placeLimit = useCallback(async () => {
    const quantity = paymentTokenValue.toCoin().amount ?? "0";
    if (quantity === "0") {
      return;
    }

    if (isMarket) {
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
        valueUsd: Number(
          marketState.inAmountInput.fiatValue?.toDec().toString() ?? "0"
        ),
        feeValueUsd: Number(marketState.totalFee?.toString() ?? "0"),
        page,
        quoteTimeMilliseconds: marketState.quote?.timeMs,
        router: marketState.quote?.name,
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

    if (!placeLimitMsg) return;

    const paymentDenom = paymentTokenValue.toCoin().denom;

    const baseEvent = {
      type: orderDirection === "bid" ? "buy" : "sell",
      fromToken: paymentDenom,
      toToken:
        orderDirection === "bid" ? baseAsset?.coinDenom : quoteAsset?.coinDenom,
      valueUsd: Number(paymentFiatValue?.toDec().toString() ?? "0"),
      tokenAmount: Number(quantity),
      page,
      isOnHomePage: page === "Swap Page",
      feeUsdValue,
    };

    try {
      logEvent([EventName.LimitOrder.placeOrderStarted, baseEvent]);
      await account?.cosmwasm.sendExecuteContractMsg(
        "executeWasm",
        orderbookContractAddress,
        placeLimitMsg!,
        [
          {
            amount: quantity,
            denom: paymentDenom,
          },
        ]
      );
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
    orderbookContractAddress,
    account,
    orderDirection,
    paymentTokenValue,
    isMarket,
    marketState,
    paymentFiatValue,
    baseAsset,
    quoteAsset,
    logEvent,
    page,
    feeUsdValue,
    placeLimitMsg,
  ]);

  const { data: balances, isLoading: isBalancesLoading } =
    api.local.balances.getUserBalances.useQuery(
      { bech32Address: account?.address ?? "" },
      {
        enabled: !!account?.address,
        select: (balances) =>
          balances.filter(
            ({ denom }) =>
              denom === baseAsset?.coinMinimalDenom ||
              denom === quoteAsset?.coinMinimalDenom
          ),
      }
    );

  const quoteTokenBalance = useMemo(() => {
    if (!balances) return;

    return balances.find(({ denom }) => denom === quoteAsset?.coinMinimalDenom)
      ?.coin;
  }, [balances, quoteAsset]);

  const baseTokenBalance = useMemo(() => {
    if (!balances) return;

    return balances.find(({ denom }) => denom === baseAsset?.coinMinimalDenom)
      ?.coin;
  }, [balances, baseAsset]);
  const insufficientFunds = useMemo(() => {
    return orderDirection === "bid"
      ? (quoteTokenBalance?.toDec() ?? new Dec(0)).lt(
          paymentTokenValue.toDec() ?? new Dec(0)
        )
      : (baseTokenBalance?.toDec() ?? new Dec(0)).lt(
          paymentTokenValue.toDec() ?? new Dec(0)
        );
  }, [orderDirection, paymentTokenValue, baseTokenBalance, quoteTokenBalance]);

  const expectedTokenAmountOut = useMemo(() => {
    if (isMarket) {
      return (
        marketState.quote?.amount ??
        new CoinPretty(
          orderDirection === "ask" ? quoteAsset! : baseAsset!,
          new Dec(0)
        )
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
    baseAsset,
    quoteAsset,
    orderDirection,
    makerFee,
    quoteAssetPrice,
    paymentFiatValue,
    isMarket,
    marketState.quote?.amount,
  ]);

  const expectedFiatAmountOut = useMemo(() => {
    if (isMarket) {
      return marketState.tokenOutFiatValue;
    }
    return orderDirection === "ask"
      ? new PricePretty(
          DEFAULT_VS_CURRENCY,
          quoteAssetPrice?.mul(expectedTokenAmountOut.toDec()) ?? new Dec(0)
        )
      : new PricePretty(
          DEFAULT_VS_CURRENCY,
          priceState.price?.mul(expectedTokenAmountOut.toDec()) ?? new Dec(0)
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
  }, [inAmountInput, priceState, marketState]);
  const error = useMemo(() => {
    if (!isMarket && orderbookError) {
      return orderbookError;
    }

    if (insufficientFunds) {
      return "limitOrders.insufficientFunds";
    }

    if (!isMarket && !priceState.isValidPrice) {
      return "limitOrders.invalidPrice";
    }

    if (isMarket && marketState.error) {
      return tError(marketState.error)[0];
    }

    const quantity = paymentTokenValue.toCoin().amount ?? "0";
    if (quantity === "0") {
      return "errors.zeroAmount";
    }

    return;
  }, [
    insufficientFunds,
    isMarket,
    marketState.error,
    priceState.isValidPrice,
    paymentTokenValue,
    orderbookError,
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
    messages: encodedMsg && !isMarket ? [encodedMsg] : [],
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
    reset,
    error,
    feeUsdValue,
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
}: {
  orderDirection: OrderDirection;
  baseDenom?: string;
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

      if (newPrice.lt(new Dec(MIN_TICK_PRICE)) && !newPrice.isZero()) {
        price = trimPlaceholderZeros(new Dec(MIN_TICK_PRICE).toString());
      } else if (newPrice.gt(new Dec(MAX_TICK_PRICE))) {
        price = trimPlaceholderZeros(new Dec(MAX_TICK_PRICE).toString());
      }

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
    new Dec(orderPrice).isPositive();

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

  const isValidPrice = isValidInputPrice || Boolean(spotPrice);

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
  };
};
