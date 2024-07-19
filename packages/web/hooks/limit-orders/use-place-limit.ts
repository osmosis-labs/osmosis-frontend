import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { priceToTick } from "@osmosis-labs/math";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { useCallback, useEffect, useMemo, useState } from "react";

import { tError } from "~/components/localization";
import { useAmountInput } from "~/hooks/input/use-amount-input";
import { useOrderbook } from "~/hooks/limit-orders/use-orderbook";
import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
import { useSwap, useSwapAssets } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
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
}

export type PlaceLimitState = ReturnType<typeof usePlaceLimit>;

// TODO: adjust as necessary
const CLAIM_BOUNTY = "0.001";

export const usePlaceLimit = ({
  osmosisChainId,
  quoteDenom,
  baseDenom,
  orderDirection,
  useQueryParams = false,
  useOtherCurrencies = true,
  type,
}: UsePlaceLimitParams) => {
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

    const price = isMarket
      ? orderDirection === "bid"
        ? priceState.askSpotPrice
        : priceState.bidSpotPrice
      : priceState.price;
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
    priceState.askSpotPrice,
    priceState.bidSpotPrice,
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

  const placeLimit = useCallback(async () => {
    const quantity = paymentTokenValue.toCoin().amount ?? "0";
    if (quantity === "0") {
      return;
    }

    if (isMarket) {
      await marketState.sendTradeTokenInTx();
      return;
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
    try {
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
    } catch (error) {
      console.error("Error attempting to broadcast place limit tx", error);
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
  ]);

  const { data: baseTokenBalance, isLoading: isBaseTokenBalanceLoading } =
    api.local.balances.getUserBalances.useQuery(
      { bech32Address: account?.address ?? "" },
      {
        enabled: Boolean(account?.address),
        select: (balances) =>
          balances.find(({ denom }) => denom === baseAsset?.coinMinimalDenom)
            ?.coin,
      }
    );
  const { data: quoteTokenBalance, isLoading: isQuoteTokenBalanceLoading } =
    api.local.balances.getUserBalances.useQuery(
      { bech32Address: account?.address ?? "" },
      {
        enabled: Boolean(account?.address),
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
  };
};

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
      enabled: Boolean(orderbookContractAddress),
    }
  );
  const { data: assetPrice, isLoading: loadingAssetPrice } =
    api.edge.assets.getAssetPrice.useQuery(
      {
        coinMinimalDenom: baseDenom ?? "",
      },
      {
        enabled: Boolean(baseDenom) && baseDenom!.length > 0,
      }
    );

  const [orderPrice, setOrderPrice] = useState("");
  const [manualPercentAdjusted, setManualPercentAdjusted] = useState("");

  const spotPrice = useMemo(() => {
    if (!assetPrice) return new Dec(1);
    return assetPrice.toDec();
  }, [assetPrice]);

  const adjustByPercentage = useCallback(
    (percentage: Dec) => {
      setOrderPrice(
        formatPretty((spotPrice ?? new Dec(0)).mul(new Dec(1).add(percentage)))
      );
    },
    [spotPrice]
  );

  useEffect(() => {
    if (manualPercentAdjusted.length > 0) {
      const adjustment = new Dec(manualPercentAdjusted).quo(new Dec(100));
      if (adjustment.isNegative()) return adjustByPercentage(new Dec(0));

      adjustByPercentage(
        orderDirection === "ask" ? adjustment : adjustment.mul(new Dec(-1))
      );
    } else {
      adjustByPercentage(new Dec(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualPercentAdjusted, orderDirection]);

  const isValidInputPrice = useMemo(
    () =>
      Boolean(orderPrice) &&
      orderPrice.length > 0 &&
      !new Dec(orderPrice).isZero() &&
      new Dec(orderPrice).isPositive(),
    [orderPrice]
  );

  const percentAdjusted = useMemo(
    () =>
      isValidInputPrice
        ? new Dec(orderPrice).quo(spotPrice ?? new Dec(1)).sub(new Dec(1))
        : new Dec(0),
    [isValidInputPrice, orderPrice, spotPrice]
  );
  const price = useMemo(
    () => (isValidInputPrice ? new Dec(orderPrice) : spotPrice ?? new Dec(1)),
    [isValidInputPrice, orderPrice, spotPrice]
  );

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

  const setPrice = useCallback((price: string) => {
    if (!price) {
      setOrderPrice("");
    } else {
      setOrderPrice(price);
    }
  }, []);

  const setPercentAdjusted = useCallback(
    (percentAdjusted: string) => {
      if (!percentAdjusted) {
        setManualPercentAdjusted("");
      } else {
        setManualPercentAdjusted(percentAdjusted);
      }
    },
    [setManualPercentAdjusted]
  );

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
    adjustByPercentage,
    manualPercentAdjusted,
    setPercentAdjusted,
    percentAdjusted,
    isLoading,
    reset,
    setPrice,
    isValidPrice,
    isBeyondOppositePrice,
    bidSpotPrice: data?.bidSpotPrice,
    askSpotPrice: data?.askSpotPrice,
    loadingAssetPrice,
  };
};
