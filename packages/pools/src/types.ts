import {
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolRaw,
} from "./concentrated";
import { CosmwasmPoolRaw, TransmuterPool } from "./cosmwasm";
import { StablePool, StablePoolRaw } from "./stable";
import { WeightedPool, WeightedPoolRaw } from "./weighted";

const STABLE_POOL_TYPE = "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool";
const WEIGHTED_POOL_TYPE = "/osmosis.gamm.v1beta1.Pool";
const CONCENTRATED_LIQ_POOL_TYPE =
  "/osmosis.concentratedliquidity.v1beta1.Pool";
const COSMWASM_POOL_TYPE = "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool";

export type PoolRaw =
  | WeightedPoolRaw
  | StablePoolRaw
  | ConcentratedLiquidityPoolRaw
  | CosmwasmPoolRaw;

/**
 * Returns corresponding pool class instance from raw pool data.
 * This method is useful for performing server-side pool calculations, such as those required for price computations.
 *
 * Note: Pools that depend on a query store will be partially supported.
 * i.e. Concentrated liquidity pool won't have the tick data provider.
 * So it won't be able to calculate spot price or get updated prices.
 */
export function makeStaticPoolFromRaw(rawPool: PoolRaw) {
  if (rawPool["@type"] === STABLE_POOL_TYPE) {
    return new StablePool(rawPool as StablePoolRaw);
  }
  if (rawPool["@type"] === WEIGHTED_POOL_TYPE) {
    return new WeightedPool(rawPool as WeightedPoolRaw);
  }
  if (rawPool["@type"] === CONCENTRATED_LIQ_POOL_TYPE) {
    return new ConcentratedLiquidityPool(
      rawPool as ConcentratedLiquidityPoolRaw
    );
  }
  if (rawPool["@type"] === COSMWASM_POOL_TYPE) {
    // currently only support transmuter pools
    return new TransmuterPool(rawPool as CosmwasmPoolRaw);
  }

  // Query pool should not be created without a supported pool
  throw new Error("Raw type not recognized");
}

export type PoolCommon = {
  taker_fee: string;
};

export type PoolMetricsRaw = {
  liquidityUsd: number;
  liquidity24hUsdChange: number;

  volume24hUsd: number;
  volume24hUsdChange: number;

  volume7dUsd: number;
};
