import { createNodeQuery } from "../../../queries/base-utils";

export type WeightedPoolRawResponse = {
  "@type": "/osmosis.gamm.v1beta1.Pool";
  id: string;
  pool_params: {
    // Dec
    swap_fee: string;
    // Dec
    exit_fee: string;
    smooth_weight_change_params: {
      // Timestamp
      start_time: string;
      // Seconds with s suffix. Ex) 3600s
      duration: string;
      initial_pool_weights: {
        token: {
          denom: string;
          // Int
          amount: string;
        };
        // Int
        weight: string;
      }[];
      target_pool_weights: {
        token: {
          denom: string;
          // Int
          amount: string;
        };
        // Int
        weight: string;
      }[];
    } | null;
  };
  // Int
  total_weight: string;
  total_shares: {
    denom: string;
    // Int
    amount: string;
  };
  pool_assets: {
    // Int
    weight: string;
    token: {
      denom: string;
      // Int
      amount: string;
    };
  }[];
};

export type StablePoolRawResponse = {
  "@type": "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool";
  address: string;
  id: string;
  pool_params: {
    swap_fee: string;
    exit_fee: string;
  };
  future_pool_governor: string;
  total_shares: {
    denom: string;
    amount: string;
  };
  pool_liquidity: {
    denom: string;
    amount: string;
  }[];
  scaling_factors: string[];
  scaling_factor_controller: string;
};

export type ConcentratedPoolRawResponse = {
  "@type": "/osmosis.concentratedliquidity.v1beta1.Pool";
  address: string;
  incentives_address: string;
  spread_rewards_address: string;
  id: string;
  current_tick_liquidity: string;
  token0: string;
  token1: string;
  current_sqrt_price: string;
  current_tick: string;
  tick_spacing: string;
  exponent_at_price_one: string;
  spread_factor: string;
  last_liquidity_update: string;
};

export type CosmwasmPoolRawResponse = {
  "@type": "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool";
  contract_address: string;
  pool_id: string;
  code_id: string;
  instantiate_msg: string;
};

export type PoolRawResponse =
  | WeightedPoolRawResponse
  | StablePoolRawResponse
  | ConcentratedPoolRawResponse
  | CosmwasmPoolRawResponse;

export type PoolsResponse = {
  pools: PoolRawResponse[];
};

export const queryPools = createNodeQuery<PoolsResponse>({
  path: "/osmosis/poolmanager/v1beta1/all-pools",
});
