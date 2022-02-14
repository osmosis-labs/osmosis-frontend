import { KVStore } from "@keplr-wallet/common";
import {
  ObservableQuery,
  QueryOptions,
  QueryResponse,
} from "@keplr-wallet/stores";
import Axios, { AxiosInstance, CancelToken } from "axios";
import { makeObservable, observable, action, computed } from "mobx";
import { computedFn } from "mobx-utils";

import { ObservablePool } from "@osmosis-labs/stores";

import { IMPERATOR_API_DOMAIN } from "../../constants";

interface PoolMetric {
  pool_id: string;
  volume_24h: number;
  volume_7d: number;
  fees_spent_24h: number;
  fees_spent_7d: number;
  fees_percentage: number;
}

interface ObservablePoolWithMetric {
  pool: ObservablePool;
  liqudity: string;
  volume24h: string;
  fees7d: string;
  myLiqudity: string;
}

export class ObservableImperatorQuery<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, urlPath: string) {
    const instance = Axios.create({ baseURL: IMPERATOR_API_DOMAIN });

    super(kvStore, instance, urlPath);
  }
}

export class ObservableImperatorQueryPoolMetrics extends ObservableImperatorQuery<{
  last_update_at: number;
  data: PoolMetric[];
}> {
  constructor(kvStore: KVStore) {
    super(kvStore, "/fees/v1/pools");
  }

  @computed
  get poolMetrics(): PoolMetric[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.data;
  }
}
