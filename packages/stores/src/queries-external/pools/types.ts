import { ObservableQuery } from "@keplr-wallet/stores";

import { ObservableQueryPool, PoolRaw } from "./pool";

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
  pools: PoolRaw[];
};
