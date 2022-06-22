import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { Epochs } from "./types";
import { Duration } from "dayjs/plugin/duration";
export declare class ObservableQueryEpochsInner {
    protected readonly identifier: string;
    protected readonly queryEpochs: ObservableQueryEpochs;
    constructor(identifier: string, queryEpochs: ObservableQueryEpochs);
    get epoch(): Epochs["epochs"][0] | undefined;
    get duration(): Duration | undefined;
    get startTime(): Date;
    get endTime(): Date;
}
export declare class ObservableQueryEpochs extends ObservableChainQuery<Epochs> {
    protected map: Map<string, ObservableQueryEpochsInner>;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    getEpoch(identifier: string): ObservableQueryEpochsInner;
}
export * from "./types";
