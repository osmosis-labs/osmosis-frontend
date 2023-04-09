import { ObservableQuery } from "@keplr-wallet/stores";
import { StablePoolRaw, WeightedPoolRaw } from "@osmosis-labs/pools";

import { ObservableQueryPool } from "./pool";

export interface PoolGetter extends ObservableQuery {
  getPool(id: string): ObservableQueryPool | undefined;
  poolExists(id: string): boolean | undefined;
  getAllPools(): ObservableQueryPool[];
  paginate(): void;
  fetchRemainingPools(): void;
}

export type Pools = {
  pools: (WeightedPoolRaw | StablePoolRaw)[];
};

export type NumPools = {
  num_pools: string;
};
