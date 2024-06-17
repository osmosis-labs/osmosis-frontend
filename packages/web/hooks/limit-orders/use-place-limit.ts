import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { priceToTick } from "@osmosis-labs/math";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { useCallback, useMemo, useState } from "react";

import { useOrderbook } from "~/hooks/limit-orders/use-orderbook";
import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { useSwapAmountInput, useSwapAssets } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export enum OrderDirection {
  Bid = "bid",
  Ask = "ask",
}

export interface UsePlaceLimitParams {
  osmosisChainId: string;
  orderDirection: OrderDirection;
  useQueryParams?: boolean;
  useOtherCurrencies?: boolean;
  baseDenom: string;
  quoteDenom: string;
}

export type PlaceLimitState = ReturnType<typeof usePlaceLimit>;

// TODO: adjust as necessary
const CLAIM_BOUNTY = "0.01";

export const usePlaceLimit = ({
  osmosisChainId,
  quoteDenom,
  baseDenom,
  orderDirection,
  useQueryParams = false,
  useOtherCurrencies = false,
}: UsePlaceLimitParams) => {
  const { accountStore } = useStore();
  const swapAssets = useSwapAssets({
    initialFromDenom: baseDenom,
    initialToDenom: quoteDenom,
    useQueryParams,
    useOtherCurrencies,
  });
  const {
    makerFee,
    isMakerFeeLoading,
    contractAddress: orderbookContractAddress,
  } = useOrderbook({
    quoteDenom,
    baseDenom,
  });

  const quoteAsset = swapAssets.toAsset;
  const baseAsset = swapAssets.fromAsset;

  const priceState = useLimitPrice();
  const inAmountInput = useSwapAmountInput({
    swapAssets,
    forceSwapInPoolId: undefined,
    maxSlippage: undefined,
  });
  const account = accountStore.getWallet(osmosisChainId);

  const { price: baseAssetPrice } = usePrice({
    coinMinimalDenom: baseAsset?.coinMinimalDenom ?? "",
  });
  const { price: quoteAssetPrice } = usePrice({
    coinMinimalDenom: quoteAsset?.coinMinimalDenom ?? "",
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
    // The amount of tokens the user wishes to buy/sell
    const baseTokenAmount =
      inAmountInput.amount ?? new CoinPretty(baseAsset!, new Dec(0));
    if (orderDirection === OrderDirection.Ask) {
      // In the case of an Ask we just return the amount requested to sell
      return baseTokenAmount;
    }

    // Determine the outgoing fiat amount the user wants to buy
    const outgoingFiatValue =
      mulPrice(
        baseTokenAmount,
        new PricePretty(DEFAULT_VS_CURRENCY, priceState.price),
        DEFAULT_VS_CURRENCY
      ) ?? new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0));

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
  ]);

  /**
   * Determines the fiat amount the user will pay for their order.
   * In the case of an Ask the fiat amount is the amount of tokens the user will sell multiplied by the currently selected price.
   * In the case of a Bid the fiat amount is the amount of quote asset tokens the user will send multiplied by the current price of the quote asset.
   */
  const paymentFiatValue = useMemo(() => {
    return orderDirection === OrderDirection.Ask
      ? mulPrice(
          paymentTokenValue,
          new PricePretty(DEFAULT_VS_CURRENCY, priceState.price),
          DEFAULT_VS_CURRENCY
        )
      : mulPrice(paymentTokenValue, quoteAssetPrice, DEFAULT_VS_CURRENCY);
  }, [paymentTokenValue, orderDirection, quoteAssetPrice, priceState]);

  const placeLimit = useCallback(async () => {
    const quantity = paymentTokenValue.toCoin().amount ?? "0";
    if (quantity === "0") {
      return;
    }

    const paymentDenom = paymentTokenValue.toCoin().denom;

    // The requested price must account for the ratio between the quote and base asset as the base asset may not be a stablecoin.
    // To account for this we divide by the quote asset price.
    const tickId = priceToTick(
      priceState.price.quo(quoteAssetPrice?.toDec() ?? new Dec(1))
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
    quoteAssetPrice,
    paymentTokenValue,
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
          balances.find(({ denom }) => denom === baseAsset?.coinMinimalDenom)
            ?.coin,
      }
    );

  const insufficientFunds =
    (orderDirection === OrderDirection.Bid
      ? quoteTokenBalance
          ?.toDec()
          ?.lt(inAmountInput.amount?.toDec() ?? new Dec(0))
      : baseTokenBalance
          ?.toDec()
          ?.lt(inAmountInput.amount?.toDec() ?? new Dec(0))) ?? true;

  const expectedTokenAmountOut = useMemo(() => {
    const preFeeAmount =
      orderDirection === OrderDirection.Ask
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
  ]);

  const expectedFiatAmountOut = useMemo(() => {
    return orderDirection === OrderDirection.Ask
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
  ]);

  return {
    quoteDenom,
    baseDenom,
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
    quoteAssetPrice,
    baseAssetPrice,
    paymentFiatValue,
    makerFee,
    isMakerFeeLoading,
    expectedTokenAmountOut,
    expectedFiatAmountOut,
  };
};

const useLimitPrice = () => {
  // TODO: Fetch spot price from SQS
  const spotPrice = useMemo(() => new Dec(1), []);
  const [percentAdjusted, setPercentAdjusted] = useState(new Dec(0));

  const adjustByPercentage = useCallback((percentage: Dec) => {
    setPercentAdjusted(percentage);
  }, []);

  const price = useMemo(
    () => spotPrice.mul(new Dec(1).add(percentAdjusted)),
    [spotPrice, percentAdjusted]
  );

  return { spotPrice, price, adjustByPercentage, percentAdjusted };
};
