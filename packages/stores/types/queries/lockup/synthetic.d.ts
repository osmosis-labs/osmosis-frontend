import { ChainGetter, ObservableChainQuery, ObservableChainQueryMap } from "@keplr-wallet/stores";
import { SyntheticLockupsByLockId } from "./types";
import { KVStore } from "@keplr-wallet/common";
export declare class ObservableSyntheticLockupsByLockIdInner extends ObservableChainQuery<SyntheticLockupsByLockId> {
    protected readonly _lockId: string;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, _lockId: string);
    get lockId(): string;
    /** `undefined` if not loaded, otherwise `boolean` */
    get isSyntheticLock(): boolean | undefined;
}
export declare class ObservableSyntheticLockupsByLockId extends ObservableChainQueryMap<SyntheticLockupsByLockId> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get(lockId: string): ObservableSyntheticLockupsByLockIdInner;
}
