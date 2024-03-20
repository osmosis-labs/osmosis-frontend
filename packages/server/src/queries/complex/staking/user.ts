import { CoinPretty } from "@keplr-wallet/unit";
import { getChainStakeTokenSourceDenom } from "@osmosis-labs/utils";

import { ChainList } from "~/codegen/generated/chain-list";

import { queryDelegations } from "../../cosmos/staking/delegations";
import { getAsset } from "../assets";

/** Gets total amount of stake token across all delegations.
 *  Returns 0 coin if there's no delegations. */
export async function getUserTotalDelegatedCoin({
  userOsmoAddress,
}: {
  userOsmoAddress: string;
}): Promise<CoinPretty> {
  const delegations = (
    await queryDelegations({
      bech32Address: userOsmoAddress,
    })
  ).delegation_responses;

  const stakeDenom = getChainStakeTokenSourceDenom({
    chainId: ChainList[0].chain_id,
    chainList: ChainList,
  });
  if (!stakeDenom) throw new Error("No stake denom in chain list");
  const stakeAsset = await getAsset({ anyDenom: stakeDenom });

  return delegations
    .map(({ balance: { denom, amount } }) => {
      // validate delegation denom as stake denom
      if (denom !== stakeDenom)
        throw new Error("Unexpected non-stake denom in delegation");
      return new CoinPretty(stakeAsset, amount);
    })
    .reduce((sum, coin) => sum.add(coin), new CoinPretty(stakeAsset, 0));
}
