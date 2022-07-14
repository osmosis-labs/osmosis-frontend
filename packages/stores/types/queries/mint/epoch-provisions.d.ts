import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { EpochProvisions } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { CoinPretty } from "@keplr-wallet/unit";
import { ObservableQueryMintParmas } from "./params";
export declare class ObservableQueryEpochProvisions extends ObservableChainQuery<EpochProvisions> {
    protected readonly queryMintParmas: ObservableQueryMintParmas;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, queryMintParmas: ObservableQueryMintParmas);
    get epochProvisions(): CoinPretty | undefined;
}
