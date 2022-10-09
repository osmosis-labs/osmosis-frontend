import { KVStore } from "@keplr-wallet/common";
import { HasMapStore, ObservableQuery } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import Axios from "axios";

export class QueriesExternalStore extends HasMapStore<QueriesExternal> {
  constructor(protected readonly kvStore: KVStore, feeMetricsBaseURL?: string) {
    super(() => new QueriesExternal(this.kvStore, feeMetricsBaseURL));
  }

  get(): QueriesExternal {
    return super.get("external");
  }
}

/** Root store for queries external to any chain. */
export class QueriesExternal {
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

export class ObservableQueryExternal<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, baseURL: string, urlPath: string) {
    const instance = Axios.create({ baseURL });

    super(kvStore, instance, urlPath);
  }
}
