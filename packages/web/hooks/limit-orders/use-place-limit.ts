import { Dec } from "@keplr-wallet/unit";
import { priceToTick } from "@osmosis-labs/math";
import { useCallback, useMemo, useState } from "react";

import {
  useSwapAmountInput,
  useSwapAsset,
  useSwapAssets,
} from "~/hooks/use-swap";
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
  const priceState = useLimitPrice();
  const inAmountInput = useSwapAmountInput({
    swapAssets,
    forceSwapInPoolId: undefined,
    maxSlippage: undefined,
  });
  const account = accountStore.getWallet(osmosisChainId);

  const placeLimit = useCallback(async () => {
    const quantity = inAmountInput.amount?.toCoin().amount ?? "0'";
    if (quantity === "0") {
      return;
    }

    const paymentDenom =
      orderDirection === OrderDirection.Bid
        ? swapAssets.toAsset.coinMinimalDenom
        : swapAssets.fromAsset.coinMinimalDenom;
    const paymentAmount =
      orderDirection === OrderDirection.Ask
        ? quantity
        : new Dec(quantity).mul(priceState.price).truncate().toString();

    const tickId = priceToTick(priceState.price);
    const msg = {
      place_limit: {
        tick_id: parseInt(tickId.toString()),
        order_direction: orderDirection,
        quantity: paymentAmount,
        claim_bounty: CLAIM_BOUNTY,
      },
    };
    await account?.cosmwasm.sendExecuteContractMsg(
      "executeWasm",
      orderbookContractAddress,
      msg,
      [
        {
          amount: paymentAmount,
          denom: paymentDenom,
        },
      ]
    );
  }, [
    orderbookContractAddress,
    account,
    swapAssets,
    orderDirection,
    inAmountInput,
    priceState,
  ]);

  const { asset: quoteAsset } = useSwapAsset({
    minDenomOrSymbol: quoteDenom,
    existingAssets: swapAssets.selectableAssets,
  });
  console.log("QUOTE", quoteAsset);

  const { asset: baseAsset } = useSwapAsset({
    minDenomOrSymbol: baseDenom,
    existingAssets: swapAssets.selectableAssets,
  });

  return {
    ...swapAssets,
    quoteDenom,
    baseDenom,
    baseAsset,
    quoteAsset,
    priceState,
    inAmountInput,
    placeLimit,
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
