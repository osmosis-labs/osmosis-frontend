import { Dec } from "@keplr-wallet/unit";
import { CoinPrimitive } from "@osmosis-labs/keplr-stores";
import { priceToTick } from "@osmosis-labs/math";
import { useCallback, useState } from "react";

import { useSwapAmountInput, useSwapAssets } from "~/hooks/use-swap";
import { useStore } from "~/stores";

export interface UsePlaceLimitParams {
  osmosisChainId: string;
  orderbookContractAddress: string;
  assetIn?: string;
  assetOut?: string;
  useQueryParams?: boolean;
  useOtherCurrencies?: boolean;
}

export interface PlaceLimitParams {
  direction: "buy" | "sell";
  price: number;
}

// TODO: adjust as necessary
const CLAIM_BOUNTY = "0.01";

export const usePlaceLimit = ({
  orderbookContractAddress,
  osmosisChainId,
  assetIn = "OSMO",
  assetOut = "ION",
  useQueryParams = true,
  useOtherCurrencies = true,
}: UsePlaceLimitParams) => {
  const { accountStore } = useStore();
  //   const [gasAmount, setGasAmount] = useState<CoinPretty>();
  const [placeLimitParams, setPlaceLimitParams] = useState<PlaceLimitParams>({
    direction: "buy",
    price: 0,
  });
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

  const account = accountStore.getWallet(osmosisChainId);

  const placeLimit = useCallback(
    async (
      direction: "bid" | "ask",
      price: number = 1,
      funds: CoinPrimitive[] = [
        { denom: "uion", amount: inAmountInput.inputAmount },
      ]
    ) => {
      const tickId = priceToTick(new Dec(price));

      const msg = {
        place_limit: {
          tick_id: parseInt(tickId.toDec().toString()),
          order_direction: direction,
          quantity: inAmountInput.inputAmount,
          claim_bounty: CLAIM_BOUNTY,
        },
      };
      await account?.cosmwasm.sendExecuteContractMsg(
        "executeWasm",
        orderbookContractAddress,
        msg,
        funds
      );
    },
    [orderbookContractAddress, account, inAmountInput]
  );

  return {
    ...swapAssets,
    inAmountInput,
    placeLimitParams,
    setPlaceLimitParams,
    placeLimit,
  };
};
