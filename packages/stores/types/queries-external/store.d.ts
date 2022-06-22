import { KVStore } from "@keplr-wallet/common";
import { HasMapStore, ObservableQuery } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
export declare class QueriesExternalStore extends HasMapStore<QueriesExternal> {
    protected readonly kvStore: KVStore;
    constructor(kvStore: KVStore);
    get(): QueriesExternal;
}
/** Root store for queries external to any chain. */
export declare class QueriesExternal {
    readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
    constructor(kvStore: KVStore);
}
export declare class ObservableQueryExternal<T = unknown, E = unknown> extends ObservableQuery<T, E> {
    constructor(kvStore: KVStore, urlPath: string);
}
