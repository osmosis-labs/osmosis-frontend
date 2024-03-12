import { createNodeQuery } from "~/server/queries/base-utils";

export type IncentivizedPools = {
  incentivized_pools: {
    pool_id: string;
    lockable_duration: string;
    gauge_id: string;
  }[];
};

export const queryIncentivizedPools = createNodeQuery<IncentivizedPools>({
  path: "/osmosis/pool-incentives/v1beta1/incentivized_pools",
});
