import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "../base";
import { KVStore } from "@keplr-wallet/common";
import { IbcStatus } from "./types";
/** Queries for ibc chain data*/
declare class ObservableQueryIbcChainStatus extends ObservableQueryExternalBase<[
    {
        source: string;
        destination: string;
        channel_id: string;
        token_symbol: string;
        token_name: string;
        last_tx: string;
        size_queue: number;
        duration_minutes: number;
    }
]> {
    constructor(kvStore: KVStore, baseURL: string, sourceChainId: string, destinationChainId: string);
    readonly getIbcStatus: (channelId: string) => IbcStatus | undefined;
}
declare class ObservableQueryWithdrawIbcChainsStatus extends HasMapStore<ObservableQueryIbcChainStatus> {
    constructor(kvStore: KVStore, sourceChainId: string, baseUrl: string);
    get(counterPartyChainId: string): ObservableQueryIbcChainStatus;
}
declare class ObservableQueryDepositIbcChainsStatus extends HasMapStore<ObservableQueryIbcChainStatus> {
    constructor(kvStore: KVStore, sourceChainId: string, baseUrl: string);
    get(counterPartyChainId: string): ObservableQueryIbcChainStatus;
}
export declare class ObservableQueryIbcChainsStatus {
    withdrawQueryMapping: ObservableQueryWithdrawIbcChainsStatus;
    depositQueryMapping: ObservableQueryDepositIbcChainsStatus;
    constructor(kvStore: KVStore, sourceChainId: string, baseUrl: string);
    getIbcStatus(direction: "withdraw" | "deposit", channelId: string, counterPartyChainId: string): IbcStatus | undefined;
}
export {};
