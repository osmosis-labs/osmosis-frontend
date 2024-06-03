import { Dec } from "@keplr-wallet/unit";
import { priceToTick } from "@osmosis-labs/math";
import { useCallback, useMemo, useState } from "react";

import { useSwapAmountInput, useSwapAssets } from "~/hooks/use-swap";
import { useStore } from "~/stores";

export enum OrderDirection {
  Bid = "bid",
  Ask = "ask",
}

export interface UsePlaceLimitParams {
  osmosisChainId: string;
  orderbookContractAddress: string;
  assetIn?: string;
  assetOut?: string;
  useQueryParams?: boolean;
  useOtherCurrencies?: boolean;
}

// TODO: adjust as necessary
const CLAIM_BOUNTY = "0.01";

export const usePlaceLimit = ({
  orderbookContractAddress,
  osmosisChainId,
  assetIn = "OSMO",
  assetOut = "ION",
  useQueryParams = false,
  useOtherCurrencies = false,
}: UsePlaceLimitParams) => {
  const { accountStore } = useStore();
  const swapAssets = useSwapAssets({
    initialFromDenom: assetIn,
    initialToDenom: assetOut,
    useQueryParams,
    useOtherCurrencies,
  });
  const priceState = useLimitPrice();
  const inAmountInput = useSwapAmountInput({
    swapAssets,
    forceSwapInPoolId: undefined,
    maxSlippage: undefined,
  });

  const orderDirection = useOrderDirection({
    tokenInDenom: assetIn,
    tokenOutDenom: assetOut,
  });
  const account = accountStore.getWallet(osmosisChainId);

  const placeLimit = useCallback(async () => {
    const quantity = inAmountInput.amount?.toCoin().amount ?? "0'";
    if (quantity === "0") {
      return;
    }

    const tickId = priceToTick(priceState.price);
    const msg = {
      place_limit: {
        tick_id: parseInt(tickId.toString()),
        order_direction: orderDirection,
        quantity,
        claim_bounty: CLAIM_BOUNTY,
      },
    };
    await account?.cosmwasm.sendExecuteContractMsg(
      "executeWasm",
      orderbookContractAddress,
      msg,
      [
        {
          amount: quantity,
          denom: swapAssets.fromAsset.coinMinimalDenom,
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

  return {
    ...swapAssets,
    priceState,
    inAmountInput,
    placeLimit,
  };
};

const useOrderDirection = ({
  tokenInDenom,
  tokenOutDenom,
}: {
  tokenInDenom: string;
  tokenOutDenom: string;
}) => {
  const [baseDenom, quoteDenom] = useOrderbookDenoms();
  const orderDirection = useMemo(() => {
    if (tokenInDenom === baseDenom && tokenOutDenom === quoteDenom) {
      return OrderDirection.Bid;
    }
    if (tokenOutDenom === baseDenom && tokenInDenom === quoteDenom) {
      return OrderDirection.Ask;
    }

    // TODO: Error handle state?
    return OrderDirection.Bid;
  }, [tokenInDenom, baseDenom, tokenOutDenom, quoteDenom]);

  return orderDirection;
};

const useOrderbookDenoms = () => {
  //TODO: Implement
  return ["OSMO", "ION"];
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
