import { KVStore } from "@keplr-wallet/common";
import { HasMapStore, ObservableQuery } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import Axios from "axios";
import { IMPERATOR_API_DOMAIN } from "./index";

export class QueriesExternalStore extends HasMapStore<QueriesExternal> {
  constructor(protected readonly kvStore: KVStore) {
    super(() => new QueriesExternal(this.kvStore));
  }

  get(): QueriesExternal {
    return super.get("external");
  }
}

export class QueriesExternal {
  public readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;

  constructor(kvStore: KVStore) {
    this.queryGammPoolFeeMetrics = new ObservableQueryPoolFeesMetrics(kvStore);
  }
}

export class ObservableQueryExternal<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, urlPath: string) {
    const instance = Axios.create({ baseURL: IMPERATOR_API_DOMAIN });

    super(kvStore, instance, urlPath);
  }
}
