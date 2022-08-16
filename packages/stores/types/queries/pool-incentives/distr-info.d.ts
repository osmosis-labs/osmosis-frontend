import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { Int } from "@keplr-wallet/unit";
import { DistrInfo } from "./types";
export declare class ObservableQueryDistrInfo extends ObservableChainQuery<DistrInfo> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get totalWeight(): Int;
    readonly getWeight: (gaugeId: string) => Int;
}
