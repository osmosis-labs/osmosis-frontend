import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { SuperfluidAllAssets } from "./types";
export declare class ObservableQuerySuperfluidPools extends ObservableChainQuery<SuperfluidAllAssets> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    readonly isSuperfluidPool: (poolId: string) => boolean;
    get superfluidPoolIds(): string[] | undefined;
}
