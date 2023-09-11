import { CoinPrimitive, ObservableQuery } from "@keplr-wallet/stores";
import { StablePoolRaw, WeightedPoolRaw } from "@osmosis-labs/pools";

import { ObservableQueryPool } from "./pool";

export interface PoolGetter<PoolType> {
  getPool(id: string): PoolType | undefined;
  poolExists(id: string): boolean | undefined;
  getAllPools(): PoolType[];
}

export interface ObservableQueryPoolGetter
  extends PoolGetter<ObservableQueryPool>,
    ObservableQuery {
  paginate(): Promise<void>;
  fetchRemainingPools(limit?: number): Promise<void>;
}

export type Pools = {
  pools: (WeightedPoolRaw | StablePoolRaw)[];
};

export type NumPools = {
  num_pools: string;
};

export type MigrationRecords = {
  migration_records: {
    balancer_to_concentrated_pool_links: {
      balancer_pool_id: string;
      cl_pool_id: string;
    }[];
  };
};

/** Metrics about a pool that may prevent additional querying. */
export type PoolMetricsRaw = Partial<{
  liquidityUsd: number;
  liquidity24hUsdChange: number;

  volume24hUsd: number;
  volume24hUsdChange: number;

  volume7dUsd: number;

  poolTokens: CoinPrimitive[];
}>;
