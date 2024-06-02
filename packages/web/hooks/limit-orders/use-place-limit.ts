import { Dec } from "@keplr-wallet/unit";
import { priceToTick } from "@osmosis-labs/math";
import { useCallback, useMemo } from "react";

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
    const tickId = priceToTick(new Dec(1));

    const msg = {
      place_limit: {
        tick_id: parseInt(tickId.toDec().toString()),
        order_direction: orderDirection,
        quantity: inAmountInput.inputAmount,
        claim_bounty: CLAIM_BOUNTY,
      },
    };
    await account?.cosmwasm.sendExecuteContractMsg(
      "executeWasm",
      orderbookContractAddress,
      msg,
      [{ denom: assetIn, amount: inAmountInput.inputAmount }]
    );
  }, [
    orderbookContractAddress,
    account,
    inAmountInput,
    orderDirection,
    assetIn,
  ]);

  return {
    ...swapAssets,
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
