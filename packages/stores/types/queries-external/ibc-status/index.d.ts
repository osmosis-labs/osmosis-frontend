import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "../base";
import { IbcMetrics, IbcStatus } from "./types";
export declare class ObservableQueryIbcDepositStatus extends ObservableQueryExternalBase<IbcMetrics> {
    constructor(kvStore: KVStore, baseURL: string, counterPartyChainID: string);
    readonly getIbcStatus: (counterPartyChainID: string) => IbcStatus;
}
export declare class ObservableQueryIbcDepositStatuses extends HasMapStore<ObservableQueryIbcDepositStatus> {
    constructor(kvStore: KVStore, ibcStatusBaseUrl?: string);
    get(counterPartyChainID: string): ObservableQueryIbcDepositStatus;
}
export declare class ObservableQueryIbcWithdrawStatus extends ObservableQueryExternalBase<IbcMetrics> {
    constructor(kvStore: KVStore, baseURL: string, counterPartyChainID: string);
    readonly getIbcStatus: (counterPartyChainID: string) => IbcStatus;
}
export declare class ObservableQueryIbcWithdrawStatuses extends HasMapStore<ObservableQueryIbcWithdrawStatus> {
    constructor(kvStore: KVStore, ibcStatusBaseUrl?: string);
    get(counterPartyChainID: string): ObservableQueryIbcWithdrawStatus;
}
