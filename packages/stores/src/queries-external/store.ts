import { KVStore } from "@keplr-wallet/common";
import { ObservableQuery } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import Axios from "axios";

/** Root store for queries external to any chain. */
export class QueriesExternalStore {
  public readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;

  constructor(
    kvStore: KVStore,
    feeMetricsBaseURL = "https://api-osmosis.imperator.co"
  ) {
    this.queryGammPoolFeeMetrics = new ObservableQueryPoolFeesMetrics(
      kvStore,
      feeMetricsBaseURL
    );
  }
}

export class ObservableQueryExternalBase<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, baseURL: string, urlPath: string) {
    const instance = Axios.create({ baseURL });

    super(kvStore, instance, urlPath);
  }
}
