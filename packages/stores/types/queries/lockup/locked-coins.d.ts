import { ChainGetter, QueryResponse, ObservableChainQuery, ObservableChainQueryMap } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { AccountLockedCoins } from "./types";
import { CoinPretty } from "@keplr-wallet/unit";
export declare class ObservableQueryAccountLockedCoinsInner extends ObservableChainQuery<AccountLockedCoins> {
    protected readonly bech32Address: string;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, bech32Address: string);
    protected canFetch(): boolean;
    protected setResponse(response: Readonly<QueryResponse<AccountLockedCoins>>): void;
    get lockedCoins(): CoinPretty[];
}
export declare class ObservableQueryAccountLockedCoins extends ObservableChainQueryMap<AccountLockedCoins> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get(bech32Address: string): ObservableQueryAccountLockedCoinsInner;
}
