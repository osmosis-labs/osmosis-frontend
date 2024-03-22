import { createNodeQuery } from "../../../queries/base-utils";

interface DistributionParams {
  params: {
    community_tax: string;
    base_proposer_reward: string;
    bonus_proposer_reward: string;
    withdraw_addr_enabled: boolean;
  };
}

export const queryDistributionParams = createNodeQuery<DistributionParams>({
  path: "/cosmos/distribution/v1beta1/params",
});
