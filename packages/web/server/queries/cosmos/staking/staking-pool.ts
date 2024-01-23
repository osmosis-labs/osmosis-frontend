import { createNodeQuery } from "~/server/queries/base-utils";

export type StakingPool = {
  pool: {
    // Int
    not_bonded_tokens: string;
    // Int
    bonded_tokens: string;
  };
};

export const queryStakingPool = createNodeQuery<StakingPool>({
  path: "/cosmos/staking/v1beta1/pool",
});
