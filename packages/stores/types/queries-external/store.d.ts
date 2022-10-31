import { KVStore } from "@keplr-wallet/common";
import { ObservableQuery } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { IPriceStore } from "../price";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";
/** Root store for queries external to any chain. */
export declare class QueriesExternalStore {
    readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
    readonly queryAccountsPoolRewards: DeepReadonly<ObservableQueryAccountsPoolRewards>;
    constructor(kvStore: KVStore, priceStore: IPriceStore, feeMetricsBaseURL?: string, poolRewardsBaseUrl?: string);
}
export declare class ObservableQueryExternalBase<T = unknown, E = unknown> extends ObservableQuery<T, E> {
    constructor(kvStore: KVStore, baseURL: string, urlPath: string);
}
