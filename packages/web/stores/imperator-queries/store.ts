import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableImperatorQueryPoolMetrics } from "./pools";

export class QueriesImperatorStore extends HasMapStore<QueriesImperator> {
  constructor(protected readonly kvStore: KVStore) {
    super(() => new QueriesImperator(this.kvStore));
  }

  get(): QueriesImperator {
    return super.get("imperator");
  }
}

export class QueriesImperator {
  public readonly queryGammPoolMetrics: DeepReadonly<ObservableImperatorQueryPoolMetrics>;

  constructor(kvStore: KVStore) {
    this.queryGammPoolMetrics = new ObservableImperatorQueryPoolMetrics(
      kvStore
    );
  }
}
