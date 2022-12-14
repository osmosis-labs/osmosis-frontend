import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "../base";
import { KVStore } from "@keplr-wallet/common";
/** Queries */
export declare class ObservableQueryIbcChainStatus extends ObservableQueryExternalBase<string> {
    constructor(kvStore: KVStore, baseURL: string, chainId: string, counterPartyChainId: string);
    get getIBCStatus(): string | undefined;
}
export declare class ObservableQueryIbcChainsStatus extends HasMapStore<ObservableQueryIbcChainStatus> {
    constructor(kvStore: KVStore, chainId: string, baseUrl?: string);
    get(counterPartyChainId: string): ObservableQueryIbcChainStatus;
}
