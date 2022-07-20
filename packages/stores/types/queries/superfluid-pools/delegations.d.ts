import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery, ObservableChainQueryMap } from "@keplr-wallet/stores";
import { SuperfluidDelegationsResponse, SuperfluidDelegation } from "./types";
import { Currency } from "@keplr-wallet/types";
export declare class ObservableQuerySuperfluidDelegationsInner extends ObservableChainQuery<SuperfluidDelegationsResponse> {
    protected readonly delegatorBech32Address: string;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, delegatorBech32Address: string);
    protected canFetch(): boolean;
    readonly getDelegations: (poolShareCurrency: Currency) => SuperfluidDelegation[] | undefined;
}
export declare class ObservableQuerySuperfluidDelegations extends ObservableChainQueryMap<SuperfluidDelegationsResponse> {
    protected readonly kvStore: KVStore;
    protected readonly chainId: string;
    protected readonly chainGetter: ChainGetter;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    getQuerySuperfluidDelegations(delegatorBech32Address: string): ObservableQuerySuperfluidDelegationsInner;
}
