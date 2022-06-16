import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery, ObservableChainQueryMap } from "@keplr-wallet/stores";
import { SuperfluidUndelegation, SuperfluidUndelegationsResponse } from "./types";
import { Currency } from "@keplr-wallet/types";
export declare class ObservableQuerySuperfluidUndelegationsInner extends ObservableChainQuery<SuperfluidUndelegationsResponse> {
    protected readonly delegatorBech32Address: string;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, delegatorBech32Address: string);
    protected canFetch(): boolean;
    readonly getUndelegations: (poolShareCurrency: Currency) => SuperfluidUndelegation[] | undefined;
}
export declare class ObservableQuerySuperfluidUndelegations extends ObservableChainQueryMap<SuperfluidUndelegationsResponse> {
    protected readonly kvStore: KVStore;
    protected readonly chainId: string;
    protected readonly chainGetter: ChainGetter;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    getQuerySuperfluidDelegations(delegatorBech32Address: string): ObservableQuerySuperfluidUndelegationsInner;
}
