import { ObservableQuery } from "@keplr-wallet/stores";
import { StablePoolRaw, WeightedPoolRaw } from "@osmosis-labs/pools";

import { ObservableQueryPool } from "./pool";

export interface PoolGetterWithoutQuery {
  getPool(id: string): ObservableQueryPool | undefined;
  poolExists(id: string): boolean | undefined;
  getAllPools(): ObservableQueryPool[];
  paginate(): void;
  fetchRemainingPools(): void;
}

export type PoolGetter = PoolGetterWithoutQuery &
  ObservableQuery &
  PoolGetterWithoutQuery;

export type Pools = {
  pools: (WeightedPoolRaw | StablePoolRaw)[];
};

export type NumPools = {
  num_pools: string;
};

export type Head<T extends any[]> = T extends [...infer Head, any]
  ? Head
  : any[];
