import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { LockableDurations } from "./types";
import { Duration } from "dayjs/plugin/duration";
export declare class ObservableQueryLockableDurations extends ObservableChainQuery<LockableDurations> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    /** On chain param: bond durations capable of receiving internal (OSMO) mint incentives, assuming pool is marked incentivized. */
    get lockableDurations(): Duration[];
    get highestDuration(): Duration | undefined;
}
