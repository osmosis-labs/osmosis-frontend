import { createNodeQuery } from "../../create-node-query";

export type OsmosisMintParams = {
  params: {
    mint_denom: string;
    epoch_identifier: string;
    distribution_proportions: {
      // Dec
      staking: string;
      // Dec
      pool_incentives: string;
      // Dec
      developer_rewards: string;
      // Dec
      community_pool: string;
    };
  };
};

export const queryOsmosisMintParams = createNodeQuery<OsmosisMintParams>({
  path: "/osmosis/mint/v1beta1/params",
});
