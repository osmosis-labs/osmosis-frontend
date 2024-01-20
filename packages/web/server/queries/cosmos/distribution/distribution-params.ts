import { apiClient, getChain } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

interface DistributionParams {
  params: {
    community_tax: string;
    base_proposer_reward: string;
    bonus_proposer_reward: string;
    withdraw_addr_enabled: boolean;
  };
}

export async function queryDistributionParams({
  chainId,
}: {
  chainId: string;
}): Promise<DistributionParams> {
  const chain = getChain({ chainId, chainList: ChainList });

  if (!chain) throw new Error(`Chain ${chainId} not found`);

  const url = new URL(
    "/cosmos/distribution/v1beta1/params",
    chain.apis.rest[0].address
  );
  return apiClient<DistributionParams>(url.toString());
}
