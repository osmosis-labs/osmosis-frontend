import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { LockableDurations } from "./types";
import { Duration } from "dayjs/plugin/duration";
export declare class ObservableQueryLockableDurations extends ObservableChainQuery<LockableDurations> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get lockableDurations(): Duration[];
}
