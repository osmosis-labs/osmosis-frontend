import { CoinPretty } from "@keplr-wallet/unit";
import { AssetList, Chain } from "@osmosis-labs/types";
import { getChainStakeTokenSourceDenom } from "@osmosis-labs/utils";

import { queryDelegations } from "../../cosmos/staking/delegations";
import { getAsset } from "../assets";

/** Gets total amount of stake token across all delegations.
 *  Returns 0 coin if there's no delegations. */
export async function getUserTotalDelegatedCoin({
  assetLists,
  chainList,
  userOsmoAddress,
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  userOsmoAddress: string;
}): Promise<CoinPretty> {
  const delegations = (
    await queryDelegations({
      chainList,
      bech32Address: userOsmoAddress,
    })
  ).delegation_responses;

  const stakeDenom = getChainStakeTokenSourceDenom({
    chainId: chainList[0].chain_id,
    chainList,
  });
  if (!stakeDenom) throw new Error("No stake denom in chain list");
  const stakeAsset = getAsset({ assetLists, anyDenom: stakeDenom });

  return delegations
    .map(({ balance: { denom, amount } }) => {
      // validate delegation denom as stake denom
      if (denom !== stakeDenom)
        throw new Error("Unexpected non-stake denom in delegation");
      return new CoinPretty(stakeAsset, amount);
    })
    .reduce((sum, coin) => sum.add(coin), new CoinPretty(stakeAsset, 0));
}
