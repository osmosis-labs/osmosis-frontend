import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "../base";
import { IbcMetrics, IbcStatus } from "./types";
export declare class ObservableQueryIbcStatuses {
    protected readonly queryIbcDepositStatuses: Readonly<ObservableQueryIbcDepositStatuses>;
    protected readonly queryIbcWithdrawStatuses: Readonly<ObservableQueryIbcWithdrawStatuses>;
    constructor(kvStore: KVStore, ibcStatusBaseUrl?: string);
    readonly getIbcStatus: (direction: "deposit" | "withdraw", counterpartyChainId: string, sourceChannelId: string) => IbcStatus | undefined;
}
export declare class ObservableQueryIbcDepositStatus extends ObservableQueryExternalBase<IbcMetrics> {
    constructor(kvStore: KVStore, baseURL: string, counterPartyChainID: string);
    readonly getIbcStatus: (sourceChannelId: string) => IbcStatus | undefined;
}
export declare class ObservableQueryIbcDepositStatuses extends HasMapStore<ObservableQueryIbcDepositStatus> {
    constructor(kvStore: KVStore, ibcStatusBaseUrl?: string);
    get(counterPartyChainID: string): ObservableQueryIbcDepositStatus;
}
export declare class ObservableQueryIbcWithdrawStatus extends ObservableQueryExternalBase<IbcMetrics> {
    constructor(kvStore: KVStore, baseURL: string, counterPartyChainID: string);
    readonly getIbcStatus: (sourceChannelId: string) => IbcStatus | undefined;
}
export declare class ObservableQueryIbcWithdrawStatuses extends HasMapStore<ObservableQueryIbcWithdrawStatus> {
    constructor(kvStore: KVStore, ibcStatusBaseUrl?: string);
    get(counterPartyChainID: string): ObservableQueryIbcWithdrawStatus;
}
export * from "./types";
