import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { NumPools } from "./types";
export declare class ObservableQueryNumPools extends ObservableChainQuery<NumPools> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get numPools(): number;
    readonly computeNumPages: (itemsPerPage: number) => number;
}
