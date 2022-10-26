import { KVStore } from "@keplr-wallet/common";
import { ObservableQuery } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
/** Root store for queries external to any chain. */
export declare class QueriesExternalStore {
    readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
    constructor(kvStore: KVStore, feeMetricsBaseURL?: string);
}
export declare class ObservableQueryExternalBase<T = unknown, E = unknown> extends ObservableQuery<T, E> {
    constructor(kvStore: KVStore, baseURL: string, urlPath: string);
}
