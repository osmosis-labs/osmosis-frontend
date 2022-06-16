import { KVStore } from "@keplr-wallet/common";
import { RatePretty } from "@keplr-wallet/unit";
import { IPriceStore } from "../../price";
import { ObservableQueryPool } from "../../queries/pools";
import { ObservableQueryExternal } from "../store";
import { ObservablePoolWithFeeMetrics, PoolFeesMetrics, PoolFees } from "./types";
/** Queries Imperator pool fee history data. */
export declare class ObservableQueryPoolFeesMetrics extends ObservableQueryExternal<PoolFees> {
    constructor(kvStore: KVStore);
    readonly makePoolWithFeeMetrics: (pool: ObservableQueryPool, priceStore: IPriceStore) => ObservablePoolWithFeeMetrics;
    readonly getPoolFeesMetrics: (poolId: string, priceStore: IPriceStore) => PoolFeesMetrics;
    /** Get pool non-incentivized return from fees based on past 7d of activity, compounded. */
    readonly get7dPoolFeeApy: (pool: ObservablePoolWithFeeMetrics, priceStore: IPriceStore) => RatePretty;
}
export * from "./types";
