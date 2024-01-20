import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

interface MintParams {
  params: {
    mint_denom: string;
    genesis_epoch_provisions: string;
    epoch_identifier: string;
    reduction_period_in_epochs: string;
    reduction_factor: string;
    distribution_proportions: {
      staking: string;
      pool_incentives: string;
      developer_rewards: string;
    };
    developer_rewards_receiver: string;
  };
}

export async function queryOsmosisMintParams(): Promise<MintParams> {
  const url = new URL(
    "/osmosis/mint/v1beta1/params",
    ChainList[0].apis.rest[0].address
  );
  return apiClient<MintParams>(url.toString());
}
