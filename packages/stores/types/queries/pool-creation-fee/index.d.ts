import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { CoinPretty } from "@keplr-wallet/unit";
export declare type Params = {
    param: {
        subspace: "gamm";
        key: "PoolCreationFee";
        value: string;
    };
};
export declare class ObservableQueryPoolCreationFee extends ObservableChainQuery<Params> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get poolCreationFee(): CoinPretty[];
}
