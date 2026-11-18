import { createNodeQuery } from "../../create-node-query";

export type StakingParams = {
  params: {
    // Duration, e.g. "1209600s"
    unbonding_time: string;
    max_validators: number;
    max_entries: number;
    historical_entries: number;
    bond_denom: string;
    // Dec
    min_commission_rate: string;
  };
};

export const queryStakingParams = createNodeQuery<StakingParams>({
  path: "/cosmos/staking/v1beta1/params",
});
