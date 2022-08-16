import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { SuperfluidParams } from "./types";
import { Dec } from "@keplr-wallet/unit";
export declare class ObservableQuerySuperfluidParams extends ObservableChainQuery<SuperfluidParams> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get minimumRiskFactor(): Dec;
}
