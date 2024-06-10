import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { priceToTick } from "@osmosis-labs/math";
import { useCallback, useMemo, useState } from "react";

import { useCoinPrice } from "~/hooks/queries/assets/use-coin-price";
import { useBalances } from "~/hooks/queries/cosmos/use-balances";
import { useSwapAmountInput, useSwapAssets } from "~/hooks/use-swap";
import { useStore } from "~/stores";

export enum OrderDirection {
  Bid = "bid",
  Ask = "ask",
}

export interface UsePlaceLimitParams {
  osmosisChainId: string;
  poolId: string;
  orderDirection: OrderDirection;
  useQueryParams?: boolean;
  useOtherCurrencies?: boolean;
  baseDenom: string;
  quoteDenom: string;
  orderbookContractAddress: string;
}

export type PlaceLimitState = ReturnType<typeof usePlaceLimit>;

// TODO: adjust as necessary
const CLAIM_BOUNTY = "0.01";

export const usePlaceLimit = ({
  osmosisChainId,
  quoteDenom,
  baseDenom,
  orderbookContractAddress,
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

  const quoteAsset = swapAssets.toAsset;
  const baseAsset = swapAssets.fromAsset;

  const priceState = useLimitPrice();
  const inAmountInput = useSwapAmountInput({
    swapAssets,
    forceSwapInPoolId: undefined,
    maxSlippage: undefined,
  });
  const account = accountStore.getWallet(osmosisChainId);

  const paymentAmount = useMemo(
    () =>
      orderDirection === OrderDirection.Ask
        ? inAmountInput.amount ?? new CoinPretty(baseAsset, "0")
        : new CoinPretty(
            quoteAsset,
            inAmountInput.amount?.toCoin().amount ?? "0"
          ).mul(priceState.price),
    [
      orderDirection,
      inAmountInput.amount,
      priceState.price,
      baseAsset,
      quoteAsset,
    ]
  );

  const { price: baseAssetPrice } = useCoinPrice(
    new CoinPretty(baseAsset, new Dec(1))
  );
  const { price: quoteAssetPrice } = useCoinPrice(
    new CoinPretty(quoteAsset, new Dec(1))
  );

  const placeLimit = useCallback(async () => {
    const quantity = inAmountInput.amount?.toCoin().amount ?? "0";
    if (quantity === "0") {
      return;
    }

    const paymentDenom =
      orderDirection === OrderDirection.Bid
        ? quoteAsset.coinMinimalDenom
        : baseAsset.coinMinimalDenom;

    const tickId = priceToTick(priceState.price);
    const msg = {
      place_limit: {
        tick_id: parseInt(tickId.toString()),
        order_direction: orderDirection,
        quantity: paymentAmount?.toCoin().amount ?? "0",
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
            amount: paymentAmount.toCoin().amount ?? "0",
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
    quoteAsset,
    baseAsset,
    orderDirection,
    inAmountInput,
    priceState,
    paymentAmount,
  ]);

  const { data: balances, isFetched: isBalancesFetched } = useBalances({
    address: account?.address ?? "",
    queryOptions: {
      enabled: Boolean(account?.address),
    },
  });

  const baseTokenBalanceRaw = balances?.balances.find(
    (bal) => bal.denom === baseAsset?.coinMinimalDenom
  )?.amount;
  const baseTokenBalance = new CoinPretty(
    baseAsset,
    new Dec(baseTokenBalanceRaw ?? "0")
  );

  const quoteTokenBalanceRaw = balances?.balances.find(
    (bal) => bal.denom === quoteAsset?.coinMinimalDenom
  )?.amount;
  const quoteTokenBalance = new CoinPretty(
    quoteAsset,
    new Dec(quoteTokenBalanceRaw ?? "0")
  );

  const insufficientFunds =
    orderDirection === OrderDirection.Bid
      ? quoteTokenBalance
          .toDec()
          .lt(inAmountInput.amount?.toDec() ?? new Dec(0))
      : baseTokenBalance
          .toDec()
          .lt(inAmountInput.amount?.toDec() ?? new Dec(0));

  return {
    quoteDenom,
    baseDenom,
    baseAsset,
    baseAssetPrice,
    quoteAsset,
    quoteAssetPrice,
    priceState,
    inAmountInput,
    placeLimit,
    baseTokenBalance,
    quoteTokenBalance,
    isBalancesFetched,
    insufficientFunds,
    paymentAmount,
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
