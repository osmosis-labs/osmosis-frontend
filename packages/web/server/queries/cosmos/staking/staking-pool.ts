import { apiClient, getChain } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

export type StakingPool = {
  pool: {
    // Int
    not_bonded_tokens: string;
    // Int
    bonded_tokens: string;
  };
};

export function queryStakingPool({
  chainId = ChainList[0].chain_id,
}: {
  chainId?: string;
}): Promise<StakingPool> {
  const chain = getChain({ chainId, chainList: ChainList });

  if (!chain) throw new Error(`Chain ${chainId} not found`);

  const url = new URL(
    "/cosmos/staking/v1beta1/pool",
    chain.apis.rest[0].address
  );
  return apiClient<StakingPool>(url.toString());
}
