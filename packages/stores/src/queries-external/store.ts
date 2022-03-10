import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryPoolsFeeMetrics } from "./pools";

export class QueriesExternalStore extends HasMapStore<QueriesExternal> {
  constructor(protected readonly kvStore: KVStore) {
    super(() => new QueriesExternal(this.kvStore));
  }

  get(): QueriesExternal {
    return super.get("external");
  }
}

export class QueriesExternal {
  public readonly queryGammPoolMetrics: DeepReadonly<ObservableQueryPoolsFeeMetrics>;

  constructor(kvStore: KVStore) {
    this.queryGammPoolMetrics = new ObservableQueryPoolsFeeMetrics(kvStore);
  }
}
