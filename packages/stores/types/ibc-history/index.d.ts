import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "@keplr-wallet/stores";
import { UncommitedHistory, IBCTransferHistory, IBCTransferHistoryStatus } from "./types";
import { PollingStatusSubscription } from "./polling-status-subscription";
/** Stores IBC sending, pending, and failure transactions state for some time period. */
export declare class IBCTransferHistoryStore {
    protected readonly kvStore: KVStore;
    protected readonly chainGetter: ChainGetter;
    protected readonly keepHistoryDays: number;
    protected _uncommitedHistories: UncommitedHistory[];
    protected _histories: IBCTransferHistory[];
    protected onHistoryChangedHandlers: ((history: IBCTransferHistory) => void)[];
    protected blockSubscriberMap: Map<string, PollingStatusSubscription>;
    constructor(kvStore: KVStore, chainGetter: ChainGetter, keepHistoryDays?: number);
    addHistoryChangedHandler(handler: (history: IBCTransferHistory) => void): void;
    get histories(): IBCTransferHistory[];
    getHistoriesByAccount: (address: string) => IBCTransferHistory[];
    getUncommitedHistoriesByAccount: (address: string) => UncommitedHistory[];
    getHistoriesAndUncommitedHistoriesByAccount: (address: string) => (IBCTransferHistory | UncommitedHistory)[];
    protected getBlockSubscriber(chainId: string): PollingStatusSubscription;
    protected traceTimeoutHeight(statusSubscriber: PollingStatusSubscription, timeoutHeight: string): {
        unsubscriber: () => void;
        promise: Promise<void>;
    };
    protected traceTimeoutTimestamp(statusSubscriber: PollingStatusSubscription, timeoutTimestamp: string): {
        unsubscriber: () => void;
        promise: Promise<void>;
    };
    traceHistroyStatus(history: Pick<IBCTransferHistory, "sourceChainId" | "sourceChannelId" | "destChainId" | "destChannelId" | "sequence" | "timeoutHeight" | "timeoutTimestamp" | "status">): Promise<IBCTransferHistoryStatus>;
    pushUncommitedHistory(history: Omit<UncommitedHistory, "createdAt">): Generator<Promise<void>, void, unknown>;
    pushPendingHistory(history: Omit<IBCTransferHistory, "createdAt" | "status">): Generator<Promise<void>, void, unknown>;
    protected pushPendingHistoryWithCreatedAt(history: Omit<IBCTransferHistory, "status">): Generator<Promise<void>, void, unknown>;
    protected traceUncommitedHistoryAndUpgradeToPendingHistory(txHash: string): Generator<Promise<any>, void, any>;
    tryUpdateHistoryStatus(txHash: string): Generator<Promise<void> | Promise<IBCTransferHistoryStatus>, void, IBCTransferHistoryStatus>;
    protected get historyMapByTxHash(): Map<string, IBCTransferHistory>;
    protected restore(): Generator<Promise<string | undefined> | Generator<Promise<void>, void, unknown>, void, string | undefined>;
    protected trimObsoleteHistory(): Generator<Promise<void>, void, unknown>;
    protected save(): Promise<void>;
}
export * from "./types";
