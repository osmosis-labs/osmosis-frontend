import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { IPriceStore } from "../../price";
import { ObservableQueryExternalBase } from "../store";
import { PoolsRewards, PoolRewards } from "./types";
/** Queries Imperator pool fee history data. */
export declare class ObservableQueryAccountPoolRewards extends ObservableQueryExternalBase<PoolsRewards> {
    protected readonly priceStore: IPriceStore;
    constructor(kvStore: KVStore, baseURL: string, priceStore: IPriceStore, bech32Address: string);
    readonly getUsdRewardsForPool: (poolId: string) => PoolRewards | undefined;
}
export declare class ObservableQueryAccountsPoolRewards extends HasMapStore<ObservableQueryAccountPoolRewards> {
    constructor(kvStore: KVStore, priceStore: IPriceStore, poolRewardsBaseUrl?: string);
    get(bech32Address: string): ObservableQueryAccountPoolRewards;
}
export * from "./types";
