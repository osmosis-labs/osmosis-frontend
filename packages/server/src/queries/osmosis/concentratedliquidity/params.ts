import { createNodeQuery } from "../../create-node-query";

export type ClParamsResponse = {
  params: {
    authorized_tick_spacing: string[];
    authorized_spread_factors: string[];
    balancer_shares_reward_discount: string;
    authorized_quote_denoms: string[];
    authorized_uptimes: string[];
    is_permissionless_pool_creation_enabled: boolean;
    unrestricted_pool_creator_whitelist: string[];
    hook_gas_limit: string;
  };
};

export const queryClParams = createNodeQuery<ClParamsResponse>({
  path: "/osmosis/concentratedliquidity/v1beta1/params",
});
