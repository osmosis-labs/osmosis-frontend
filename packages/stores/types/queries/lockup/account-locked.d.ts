import { ChainGetter, ObservableChainQuery, ObservableChainQueryMap, QueryResponse } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { AccountLockedLongerDuration } from "./types";
import { Duration } from "dayjs/plugin/duration";
import { CoinPretty } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
export declare class ObservableQueryAccountLockedInner extends ObservableChainQuery<AccountLockedLongerDuration> {
    protected readonly bech32Address: string;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, bech32Address: string);
    protected canFetch(): boolean;
    protected setResponse(response: Readonly<QueryResponse<AccountLockedLongerDuration>>): void;
    get unlockingCoins(): {
        amount: CoinPretty;
        lockIds: string[];
        endTime: Date;
    }[];
    readonly getLockedCoinWithDuration: (currency: AppCurrency, duration: Duration) => {
        amount: CoinPretty;
        lockIds: string[];
    };
    readonly getUnlockingCoinsWithDuration: (duration: Duration) => {
        amount: CoinPretty;
        lockIds: string[];
        endTime: Date;
    }[];
    readonly getUnlockingCoinWithDuration: (currency: AppCurrency, duration: Duration) => {
        amount: CoinPretty;
        lockIds: string[];
        endTime: Date;
    }[];
}
export declare class ObservableQueryAccountLocked extends ObservableChainQueryMap<AccountLockedLongerDuration> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get(bech32Address: string): ObservableQueryAccountLockedInner;
}
