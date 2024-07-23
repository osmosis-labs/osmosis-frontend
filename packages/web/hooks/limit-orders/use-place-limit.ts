import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { priceToTick } from "@osmosis-labs/math";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { isValidNumericalRawInput } from "@osmosis-labs/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import { tError } from "~/components/localization";
import { EventName, EventPage } from "~/config";
import { useAmountInput } from "~/hooks/input/use-amount-input";
import { useOrderbook } from "~/hooks/limit-orders/use-orderbook";
import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useSwap, useSwapAssets } from "~/hooks/use-swap";
import { useStore } from "~/stores";
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
    // forceSwapInPoolId: poolId,
    maxSlippage: new Dec(0.1),
  });

  const quoteAsset = swapAssets.toAsset;
  const baseAsset = swapAssets.fromAsset;

  const priceState = useLimitPrice({
    orderbookContractAddress,
    orderDirection,
    baseDenom: baseAsset?.coinMinimalDenom,
  });

  const isMarket = useMemo(
    () => type === "market" || priceState.isBeyondOppositePrice,
    [type, priceState.isBeyondOppositePrice]
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

    const price = priceState.price;
    // Determine the outgoing fiat amount the user wants to buy
    const outgoingFiatValue = mulPrice(
      baseTokenAmount,
      new PricePretty(DEFAULT_VS_CURRENCY, price ?? new Dec(1)),
      DEFAULT_VS_CURRENCY
    );

    // Determine the amount of quote asset tokens to send by dividing the outgoing fiat amount by the current quote asset price
    // Multiply by 10^n where n is the amount of decimals for the quote asset
    const quoteTokenAmount = outgoingFiatValue!
      .quo(quoteAssetPrice ?? new Dec(1))
      .toDec()
      .mul(new Dec(Math.pow(10, quoteAsset!.coinDecimals)));
    return new CoinPretty(quoteAsset!, quoteTokenAmount);
  }, [
    quoteAssetPrice,
    baseAsset,
    orderDirection,
    inAmountInput.amount,
    quoteAsset,
    priceState.price,
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

    const paymentDenom = paymentTokenValue.toCoin().denom;
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
        msg,
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
    priceState,
    paymentTokenValue,
    isMarket,
    marketState,
    quoteAssetPrice,
    normalizationFactor,
    paymentFiatValue,
    baseAsset,
    quoteAsset,
    logEvent,
    page,
    feeUsdValue,
  ]);

  const { data: baseTokenBalance, isLoading: isBaseTokenBalanceLoading } =
    api.local.balances.getUserBalances.useQuery(
      { bech32Address: account?.address ?? "" },
      {
        enabled: !!account?.address,
        select: (balances) =>
          balances.find(({ denom }) => denom === baseAsset?.coinMinimalDenom)
            ?.coin,
      }
    );
  const { data: quoteTokenBalance, isLoading: isQuoteTokenBalanceLoading } =
    api.local.balances.getUserBalances.useQuery(
      { bech32Address: account?.address ?? "" },
      {
        enabled: !!account?.address,
        select: (balances) =>
          balances.find(({ denom }) => denom === quoteAsset?.coinMinimalDenom)
            ?.coin,
      }
    );

  const insufficientFunds =
    (orderDirection === "bid"
      ? quoteTokenBalance?.toDec()?.lt(paymentTokenValue.toDec() ?? new Dec(0))
      : baseTokenBalance
          ?.toDec()
          ?.lt(paymentTokenValue.toDec() ?? new Dec(0))) ?? true;

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

  return {
    baseAsset,
    quoteAsset,
    priceState,
    inAmountInput,
    placeLimit,
    baseTokenBalance,
    quoteTokenBalance,
    isBalancesFetched:
      !isBaseTokenBalanceLoading && !isQuoteTokenBalanceLoading,
    insufficientFunds,
    paymentFiatValue,
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
  };
};

const DEFAULT_PERCENT_ADJUSTMENT = "0.5";

const MAX_TICK_PRICE = 340282300000000000000;
const MIN_TICK_PRICE = 0.000000000001;

/**
 * Handles the logic for the limit price selector.
 * Allows the user to input either a set fiat price or a percentage related to the current spot price.
 * Also returns relevant spot price for each direction.
 */
const useLimitPrice = ({
  orderbookContractAddress,
  orderDirection,
  baseDenom,
}: {
  orderbookContractAddress: string;
  orderDirection: OrderDirection;
  baseDenom?: string;
}) => {
  const { data, isLoading } = api.edge.orderbooks.getOrderbookState.useQuery(
    {
      osmoAddress: orderbookContractAddress,
    },
    {
      enabled: !!orderbookContractAddress,
    }
  );
  const {
    data: assetPrice,
    isLoading: loadingSpotPrice,
    isRefetching: isSpotPriceRefetching,
  } = api.edge.assets.getAssetPrice.useQuery(
    {
      coinMinimalDenom: baseDenom ?? "",
    },
    { refetchInterval: 10000, enabled: !!baseDenom }
  );

  const [orderPrice, setOrderPrice] = useState("");
  const [manualPercentAdjusted, setManualPercentAdjusted] = useState("");

  // Decimal version of the spot price, defaults to 1
  const spotPrice = useMemo(() => {
    return assetPrice ? assetPrice.toDec() : new Dec(1);
  }, [assetPrice]);

  // Sets a user based order price, if nothing is input it resets the form (including percentage adjustments)
  const setManualOrderPrice = useCallback(
    (price: string) => {
      if (countDecimals(price) > 2) {
        price = parseFloat(price).toFixed(2).toString();
      }

      const newPrice = new Dec(price.length > 0 ? price : "0");
      if (newPrice.lt(new Dec(MIN_TICK_PRICE)) && !newPrice.isZero()) {
        price = trimPlaceholderZeros(new Dec(MIN_TICK_PRICE).toString());
      } else if (newPrice.gt(new Dec(MAX_TICK_PRICE))) {
        price = trimPlaceholderZeros(new Dec(MAX_TICK_PRICE).toString());
      }

      setOrderPrice(price);

      if (price.length === 0) {
        setManualPercentAdjusted("");
      }
    },
    [setOrderPrice]
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

      if (countDecimals(percentAdjusted) > 10) {
        percentAdjusted = parseFloat(percentAdjusted).toFixed(10).toString();
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

      // Reset the user's manual order price if they adjust percentage
      if (orderPrice.length > 0) setOrderPrice("");
    },
    [setManualPercentAdjusted, orderPrice.length, orderDirection]
  );

  // Whether the user's manual order price is a valid price
  const isValidInputPrice = useMemo(
    () =>
      Boolean(orderPrice) &&
      orderPrice.length > 0 &&
      !new Dec(orderPrice).isZero() &&
      new Dec(orderPrice).isPositive(),
    [orderPrice]
  );

  // The current price. If the user has input a manual order price then that is used, otherwise we look at the percentage adjusted.
  // If the user has a percentage adjusted input we calculate the price relative to the spot price
  // given the current direction of the order.
  // If the form is empty we default to a percentage relative to the spot price.
  const price = useMemo(() => {
    if (orderPrice && orderPrice.length > 0) {
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

    return spotPrice.mul(percentAdjusted) ?? new Dec(1);
  }, [orderPrice, spotPrice, manualPercentAdjusted, orderDirection]);

  // The raw percentage adjusted based on the current order price state
  const percentAdjusted = useMemo(
    () => price.quo(spotPrice ?? new Dec(1)).sub(new Dec(1)),
    [price, spotPrice]
  );

  // If the user is inputting a price that crosses over the spot price
  const isBeyondOppositePrice = useMemo(() => {
    return orderDirection === "ask" ? spotPrice.gt(price) : spotPrice.lt(price);
  }, [orderDirection, price, spotPrice]);

  const priceFiat = useMemo(() => {
    return new PricePretty(DEFAULT_VS_CURRENCY, price);
  }, [price]);

  const reset = useCallback(() => {
    setManualPercentAdjusted("");
    setOrderPrice("");
  }, []);

  // const setPercentAdjusted = useCallback(
  //   (percentAdjusted: string) => {
  //     if (!percentAdjusted || percentAdjusted.length === 0) {
  //       setManualPercentAdjusted("");
  //     } else {
  //       if (countDecimals(percentAdjusted) > 10) {
  //         percentAdjusted = parseFloat(percentAdjusted).toFixed(10).toString();
  //       }
  //       if (
  //         orderDirection === "bid" &&
  //         new Dec(percentAdjusted).gte(new Dec(100))
  //       ) {
  //         return;
  //       }

  //       const split = percentAdjusted.split(".");
  //       if (split[0].length > 9) {
  //         return;
  //       }

  //       setManualPercentAdjusted(percentAdjusted);
  //     }
  //   },
  //   [setManualPercentAdjusted, orderDirection]
  // );

  useEffect(() => {
    reset();
  }, [orderDirection, reset]);

  const isValidPrice = useMemo(() => {
    return isValidInputPrice || Boolean(spotPrice);
  }, [isValidInputPrice, spotPrice]);

  return {
    spotPrice,
    orderPrice,
    price,
    priceFiat,
    manualPercentAdjusted,
    setPercentAdjusted: setManualPercentAdjustedSafe,
    _setPercentAdjustedUnsafe: setManualPercentAdjusted,
    percentAdjusted,
    isLoading: isLoading || loadingSpotPrice,
    reset,
    setPrice: setManualOrderPrice,
    isValidPrice,
    isBeyondOppositePrice,
    bidSpotPrice: data?.bidSpotPrice,
    askSpotPrice: data?.askSpotPrice,
    isSpotPriceRefetching,
  };
};
