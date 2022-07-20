import { ObservableChainQueryMap, ChainGetter, ObservableChainQuery, QueryResponse } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { GaugeById } from "./types";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";
export declare class ObservableQueryGuageById extends ObservableChainQuery<GaugeById> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, id: string);
    protected setResponse(response: Readonly<QueryResponse<GaugeById>>): void;
    get startTime(): Date;
    get lockupDuration(): Duration;
    get remainingEpoch(): number;
    get numEpochsPaidOver(): number;
    readonly getCoin: (currency: AppCurrency) => CoinPretty;
    readonly getDistributedCoin: (currency: AppCurrency) => CoinPretty;
    readonly getRemainingCoin: (currency: AppCurrency) => CoinPretty;
}
export declare class ObservableQueryGuage extends ObservableChainQueryMap<GaugeById> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get(id: string): ObservableQueryGuageById;
}
