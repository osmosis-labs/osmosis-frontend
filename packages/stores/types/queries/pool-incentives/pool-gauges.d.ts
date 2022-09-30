import { ChainGetter, ObservableChainQuery, HasMapStore } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { Duration } from "dayjs/plugin/duration";
import { GaugeIdsWithDuration } from "./types";
/** Queries matching gauge ids and durations in seconds for a given pool. */
export declare class ObservableQueryPoolGaugeIds extends ObservableChainQuery<GaugeIdsWithDuration> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, poolId: string);
    get gaugeIdsWithDuration(): {
        gaugeId: string;
        duration: Duration;
    }[] | undefined;
}
export declare class ObservableQueryPoolsGaugeIds extends HasMapStore<ObservableQueryPoolGaugeIds> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get(poolId: string): ObservableQueryPoolGaugeIds;
}
