import { KVStore } from "@keplr-wallet/common";
import { RatePretty } from "@keplr-wallet/unit";
import { IPriceStore } from "../../price";
import { ObservableQueryPool } from "../../queries/pools";
import { ObservableQueryExternalBase } from "../base";
import { PoolFeesMetrics, PoolFees } from "./types";
/** Queries Imperator pool fee history data. */
export declare class ObservableQueryPoolFeesMetrics extends ObservableQueryExternalBase<PoolFees> {
    constructor(kvStore: KVStore, baseURL: string);
    readonly getPoolFeesMetrics: (poolId: string, priceStore: IPriceStore) => PoolFeesMetrics;
    /** Get pool non-incentivized return from fees based on past 7d of activity. */
    readonly get7dPoolFeeApr: (pool: ObservableQueryPool, priceStore: IPriceStore) => RatePretty;
}
export * from "./types";
