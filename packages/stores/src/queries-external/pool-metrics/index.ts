import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { computed } from "mobx";

import { ObservableQueryExternalBase } from "../base";
import { PoolMetrics } from "./types";

/** Get pool metrics from a server side cached Next.js API endpoint for a specific pool. */
export class ObservablePoolMetrics extends ObservableQueryExternalBase<PoolMetrics> {
  constructor(kvStore: KVStore, baseURL: string, poolId: string) {
    super(kvStore, baseURL, `/api/pool-metrics?poolId=${poolId}`);
  }

  @computed
  get metrics() {
    return this.response?.data;
  }
}

/** Per-pool Next.js API endpoint for fetching cached APR data. */
export class ObservablePoolsMetrics extends HasMapStore<ObservablePoolMetrics> {
  constructor(kvStore: KVStore, baseURL: string) {
    super((id: string) => new ObservablePoolMetrics(kvStore, baseURL, id));
  }

  get(poolId: string) {
    return super.get(poolId) as ObservablePoolMetrics;
  }
}

export * from "./types";
