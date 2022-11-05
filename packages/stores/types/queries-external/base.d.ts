import { ObservableQuery } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
export declare class ObservableQueryExternalBase<T = unknown, E = unknown> extends ObservableQuery<T, E> {
    constructor(kvStore: KVStore, baseURL: string, urlPath: string);
}
