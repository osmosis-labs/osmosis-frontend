import {
  computed,
  observable,
  action,
  runInAction,
  autorun,
  toJS,
  makeObservable,
} from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { TxStatus } from "./types";
import { ITxStatusReceiver, ITxStatusSource } from "./types";

/** Persistable data enough to identify a tx. */
type TxSnapshot = {
  /** From Date.getTime(). Assumed local timezone. */
  createdAtMs: number;
  prefixedKey: string;
  amount: string;
  status: TxStatus;
  reason?: string;
  isWithdraw: boolean;
};

const STORE_KEY = "nonibc_history_tx_snapshots";

/** Stores and tracks status for non-IBC bridge transfers.
 *  Supports querying state from arbitrary remote chains via dependency injection.
 *  NOTE: source keyPrefix values must be unique.
 */
export class NonIbcBridgeHistoryStore implements ITxStatusReceiver {
  /** Volatile store of tx statuses. `prefixedKey => TxSnapshot` */
  @observable
  protected snapshots: TxSnapshot[] = [];
  @observable
  private isRestoredFromLocalStorage = false;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly txStatusSources: ITxStatusSource[] = [],
    protected readonly historyExpireDays = 3
  ) {
    this.txStatusSources.forEach(
      (source) => (source.statusReceiverDelegate = this)
    );

    makeObservable(this);

    // persist snapshots on change
    autorun(() => {
      console.log(
        this.snapshots.map((s) => {
          return [s.prefixedKey, s.amount, s.status];
        })
      );

      if (this.isRestoredFromLocalStorage) {
        this.kvStore.set(STORE_KEY, toJS(this.snapshots));
      }
    });

    this.restoreSnapshots();
  }

  addStatusSource(source: ITxStatusSource) {
    this.txStatusSources.push(source);
  }

  @computed
  get histories(): {
    key: string;
    createdAt: Date;
    sourceName?: string;
    status: TxStatus;
    reason?: string;
    amount: string;
    explorerUrl: string;
    isWithdraw: boolean;
  }[] {
    const histories: {
      key: string;
      createdAt: Date;
      sourceName?: string;
      status: TxStatus;
      amount: string;
      reason?: string;
      explorerUrl: string;
      isWithdraw: boolean;
    }[] = [];
    this.snapshots.forEach((snapshot) => {
      const statusSource = this.txStatusSources.find((source) =>
        snapshot.prefixedKey.startsWith(source.keyPrefix)
      );
      if (statusSource) {
        const key = snapshot.prefixedKey.slice(statusSource?.keyPrefix.length);

        histories.push({
          key,
          createdAt: new Date(snapshot.createdAtMs),
          sourceName: statusSource.sourceDisplayName,
          status: snapshot.status,
          amount: snapshot.amount,
          reason: snapshot.reason,
          explorerUrl: statusSource.makeExplorerUrl(key),
          isWithdraw: snapshot.isWithdraw,
        });
      }
    });

    return histories;
  }

  /**
   * Add transaction to be tracked starting now.
   * @param prefixedKey Identifier of transaction, with a prefix corresponding to a tx status source. Example: `axelar<tx hash>`
   * @param amount Human readable amount. (e.g. `12 ETH`)
   * @param isWithdraw Indicates if this is a withdraw from Osmosis.
   */
  @action
  pushTxNow(prefixedKey: string, amount: string, isWithdraw: boolean) {
    const statusSource = this.txStatusSources.find((source) =>
      prefixedKey.startsWith(source.keyPrefix)
    );

    // start tracking for life of current session
    statusSource?.trackTxStatus(
      prefixedKey.slice(statusSource.keyPrefix.length)
    );

    this.snapshots.push({
      createdAtMs: Date.now(),
      prefixedKey,
      amount,
      status: "pending",
      isWithdraw,
    });
  }

  @action
  receiveNewTxStatus(
    prefixedKey: string,
    status: TxStatus,
    reason: string | undefined
  ) {
    const snapshot = this.snapshots.find(
      (snapshot) => snapshot.prefixedKey === prefixedKey
    );

    console.log(
      prefixedKey,
      this.snapshots.map((s) => s.prefixedKey)
    );

    if (!snapshot) {
      console.error("Couldn't find tx snapshot when receiving tx status");
      return;
    }

    snapshot.status = status;
    snapshot.reason = reason;
  }

  /** Use persisted tx snapshots to resume Tx monitoring.
   *  Removes expired snapshots.
   */
  protected async restoreSnapshots() {
    const storedSnapshots =
      (await this.kvStore.get<TxSnapshot[]>(STORE_KEY)) ?? [];

    storedSnapshots.forEach(async (snapshot) => {
      if (this.isSnapshotExpired(snapshot)) {
        return;
      }
      const statusSource = this.txStatusSources.find((source) =>
        snapshot.prefixedKey.startsWith(source.keyPrefix)
      );

      // start receiving tx status updates again
      statusSource?.trackTxStatus(
        snapshot.prefixedKey.slice(statusSource.keyPrefix.length)
      );

      runInAction(() => {
        this.snapshots.push(snapshot);
      });
    });

    runInAction(() => {
      this.isRestoredFromLocalStorage = true;
    });
  }

  protected isSnapshotExpired(snapshot: TxSnapshot): boolean {
    const expiryMs = this.historyExpireDays * 86_400_00;
    return Date.now() - snapshot.createdAtMs > expiryMs;
  }
}

export * from "./types";
