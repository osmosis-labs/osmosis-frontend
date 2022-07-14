import { KVStore } from "@keplr-wallet/common";
import { TxStatus } from "./types";
import { ITxStatusReceiver, ITxStatusSource } from "./types";
/** Persistable data enough to identify a tx. */
declare type TxSnapshot = {
    /** From Date.getTime(). Assumed local timezone. */
    createdAtMs: number;
    prefixedKey: string;
    amount: string;
    status: TxStatus;
    isWithdraw: boolean;
};
/** Stores and tracks status for non-IBC bridge transfers.
 *  Supports querying state from arbitrary remote chains via dependency injection.
 *  NOTE: source keyPrefix values must be unique.
 */
export declare class NonIbcBridgeHistoryStore implements ITxStatusReceiver {
    protected readonly kvStore: KVStore;
    protected readonly txStatusSources: ITxStatusSource[];
    protected readonly historyExpireDays: number;
    /** Volatile store of tx statuses. `prefixedKey => TxSnapshot` */
    protected snapshots: TxSnapshot[];
    private isRestored;
    constructor(kvStore: KVStore, txStatusSources?: ITxStatusSource[], historyExpireDays?: number);
    addStatusSource(source: ITxStatusSource): void;
    get histories(): {
        key: string;
        createdAt: Date;
        sourceName?: string;
        status: TxStatus;
        amount: string;
        explorerUrl: string;
        isWithdraw: boolean;
    }[];
    /**
     * Add transaction to be tracked starting now.
     * @param prefixedKey Identifier of transaction, with a prefix corresponding to a tx status source. Example: `axelar<tx hash>`
     * @param amount Human readable amount. (e.g. `12 ETH`)
     * @param isWithdraw Indicates if this is a withdraw from Osmosis.
     */
    pushTxNow(prefixedKey: string, amount: string, isWithdraw: boolean): void;
    receiveNewTxStatus(prefixedKey: string, status: TxStatus): void;
    /** Use persisted tx snapshots to resume Tx monitoring.
     *  Removes expired snapshots.
     */
    protected restoreSnapshots(): Promise<void>;
    protected isSnapshotExpired(snapshot: TxSnapshot): boolean;
}
export * from "./types";
