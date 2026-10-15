export const WEIGHTED_POOL_TYPE = "/osmosis.gamm.v1beta1.Pool" as const;
export const STABLE_POOL_TYPE =
  "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool" as const;
export const CONCENTRATED_LIQ_POOL_TYPE =
  "/osmosis.concentratedliquidity.v1beta1.Pool" as const;
export const COSMWASM_POOL_TYPE =
  "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool" as const;

export type WeightedPoolRawResponse = {
  "@type": typeof WEIGHTED_POOL_TYPE;
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
  "@type": typeof STABLE_POOL_TYPE;
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
  "@type": typeof CONCENTRATED_LIQ_POOL_TYPE;
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
  "@type": typeof COSMWASM_POOL_TYPE;
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

export type PoolResponse = {
  pool: PoolRawResponse;
};

export interface PoolGetter<PoolType> {
  getPool(id: string): PoolType | undefined;
  poolExists(id: string): boolean | undefined;
  getAllPools(): PoolType[];
}

export type Pools = {
  pools: PoolRaw[];
  totalNumberOfPools: string;
  pageInfo?: {
    hasNextPage: boolean;
  };
};

export type PoolType =
  | "concentrated"
  | "weighted"
  | "stable"
  | "transmuter"
  | "alloyed"
  | "cosmwasm";

/** Chain/sidecar pool payload used by the MobX query. Extra fields are present
 *  on some sources (CL balances, CosmWasm token balances) but not the node type. */
export type PoolRaw =
  | WeightedPoolRawResponse
  | StablePoolRawResponse
  | (ConcentratedPoolRawResponse & {
      token0Amount?: string;
      token1Amount?: string;
    })
  | (CosmwasmPoolRawResponse & {
      tokens?: { denom: string; amount: string }[];
    });

export const ALLOYED_POOL_CODE_IDS_MAINNET = ["814", "867", "996"];
