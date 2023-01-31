import {
  observable,
  action,
  runInAction,
  autorun,
  toJS,
  makeObservable,
} from "mobx";
import { computedFn } from "mobx-utils";
import { KVStore } from "@keplr-wallet/common";
import { IQueriesStore, CosmosQueries } from "@keplr-wallet/stores";
import { TxReason, TxStatus } from "./types";
import { ITxStatusReceiver, ITxStatusSource } from "./types";

/** Persistable data enough to identify a tx. */
type TxSnapshot = {
  /** From Date.getTime(). Assumed local timezone. */
  createdAtMs: number;
  prefixedKey: string;
  amount: string;
  status: TxStatus;
  reason?: TxReason;
  isWithdraw: boolean;
  accountAddress: string;
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
    protected readonly queriesStore: IQueriesStore<CosmosQueries>,
    protected readonly chainId: string,
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
      if (this.isRestoredFromLocalStorage) {
        this.kvStore.set(STORE_KEY, toJS(this.snapshots));
      }
    });

    this.restoreSnapshots();
  }

  addStatusSource(source: ITxStatusSource) {
    this.txStatusSources.push(source);
  }

  getHistoriesByAccount = computedFn((accountAddress: string) => {
    const histories: {
      key: string;
      createdAt: Date;
      sourceName?: string;
      status: TxStatus;
      amount: string;
      reason?: TxReason;
      explorerUrl: string;
      isWithdraw: boolean;
    }[] = [];
    this.snapshots.forEach((snapshot) => {
      const statusSource = this.txStatusSources.find((source) =>
        snapshot.prefixedKey.startsWith(source.keyPrefix)
      );
      if (statusSource && snapshot.accountAddress === accountAddress) {
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
  });

  /**
   * Add transaction to be tracked starting now.
   * @param prefixedKey Identifier of transaction, with a prefix corresponding to a tx status source. Example: `axelar<tx hash>`
   * @param amount Human readable amount. (e.g. `12 ETH`)
   * @param isWithdraw Indicates if this is a withdraw from Osmosis.
   * @param accountAddress The address of the user's account.
   */
  @action
  pushTxNow(
    prefixedKey: string,
    amount: string,
    isWithdraw: boolean,
    accountAddress: string
  ) {
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
      accountAddress,
    });
  }

  @action
  receiveNewTxStatus(
    prefixedKey: string,
    status: TxStatus,
    reason: TxReason | undefined
  ) {
    const snapshot = this.snapshots.find(
      (snapshot) => snapshot.prefixedKey === prefixedKey
    );

    if (!snapshot) {
      console.error("Couldn't find tx snapshot when receiving tx status");
      return;
    }

    // update balances if successful
    if (status === "success") {
      this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(snapshot.accountAddress)
        .fetch();
    }

    snapshot.status = status;
    snapshot.reason = reason;
  }

  /** Use persisted tx snapshots to resume Tx monitoring after browser first loads.
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
