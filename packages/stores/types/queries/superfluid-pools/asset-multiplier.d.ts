import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery, ObservableChainQueryMap } from "@keplr-wallet/stores";
import { SuperfluidAssetMultiplier } from "./types";
import { Dec } from "@keplr-wallet/unit";
export declare class ObservableQuerySuperfluidAssetMultiplierInner extends ObservableChainQuery<SuperfluidAssetMultiplier> {
    protected readonly denom: string;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, denom: string);
    get multiplier(): Dec;
}
export declare class ObservableQuerySuperfluidAssetMultiplier extends ObservableChainQueryMap<SuperfluidAssetMultiplier> {
    protected readonly kvStore: KVStore;
    protected readonly chainId: string;
    protected readonly chainGetter: ChainGetter;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    getDenom(denom: string): ObservableQuerySuperfluidAssetMultiplierInner;
}
