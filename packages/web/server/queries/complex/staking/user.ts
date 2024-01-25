import { CoinPretty } from "@keplr-wallet/unit";

import { queryDelegations } from "../../cosmos/staking/delegations";
import { getAsset } from "../assets";

/** Gets total amount of stake token across all delegations.  */
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

  const eventualCoins = delegations.map(async ({ balance }) => {
    const asset = await getAsset({ anyDenom: balance.denom }).catch(
      () => undefined
    );
    if (!asset) return;

    return new CoinPretty(asset, balance.amount);
  });

  return (await Promise.all(eventualCoins))
    .filter((coin): coin is CoinPretty => !!coin)
    .reduce((sum, coin) => {
      if (!sum) return coin;
      return sum.add(coin);
    });
}
