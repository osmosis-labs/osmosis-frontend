import { ChainGetter, QueryResponse, ObservableChainQuery, ObservableChainQueryMap } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { AccountUnlockingCoins } from "./types";
import { CoinPretty } from "@keplr-wallet/unit";
export declare class ObservableQueryAccountUnlockingCoinsInner extends ObservableChainQuery<AccountUnlockingCoins> {
    protected readonly bech32Address: string;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, bech32Address: string);
    protected canFetch(): boolean;
    protected setResponse(response: Readonly<QueryResponse<AccountUnlockingCoins>>): void;
    get unlockingCoins(): CoinPretty[];
}
export declare class ObservableQueryAccountUnlockingCoins extends ObservableChainQueryMap<AccountUnlockingCoins> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get(bech32Address: string): ObservableQueryAccountUnlockingCoinsInner;
}
