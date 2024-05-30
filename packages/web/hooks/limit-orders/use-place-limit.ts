import { Dec } from "@keplr-wallet/unit";
import { CoinPrimitive } from "@osmosis-labs/keplr-stores";
import { priceToTick } from "@osmosis-labs/math";

import { useStore } from "~/stores";

export interface UsePlaceLimitParams {
  osmosisChainId: string;
  orderbookContractAddress: string;
}

// TODO: adjust as necessary
const CLAIM_BOUNTY = "0.01";

export const usePlaceLimit = ({
  orderbookContractAddress,
  osmosisChainId,
}: UsePlaceLimitParams) => {
  const { accountStore } = useStore();

  const account = accountStore.getWallet(osmosisChainId);

  const placeLimit = async (
    direction: "buy" | "sell",
    price: number,
    quantity: number,
    funds: CoinPrimitive[]
  ) => {
    const tickId = priceToTick(new Dec(price));

    const msg = {
      tick_id: tickId,
      order_direction: direction,
      quantity,
      claim_bounty: CLAIM_BOUNTY,
    };
    await account?.cosmwasm.sendExecuteContractMsg(
      "executeWasm",
      orderbookContractAddress,
      msg,
      funds
    );
  };

  return [placeLimit];
};
