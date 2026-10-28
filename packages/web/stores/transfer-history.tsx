import {
  TransferFailureReason,
  TransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
  TxSnapshot,
} from "@osmosis-labs/bridge";
import { CoinPretty, Dec } from "@osmosis-labs/unit";
import type { KVStore } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { FunctionComponent, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { createStore, StoreApi } from "zustand/vanilla";

import { displayToast, ToastType } from "~/components/alert";
import { RadialProgress } from "~/components/radial-progress";
import { EntityImage } from "~/components/ui/entity-image";
import { useTranslation } from "~/hooks";
import { displayHumanizedTime, humanizeTime } from "~/utils/date";
import { formatPretty } from "~/utils/formatter";

/** IndexedDB key. The persisted value is a raw `TxSnapshot[]` (unchanged from
 *  the MobX-era store, so pending transfers survive the migration). */
export const TRANSFER_HISTORY_STORE_KEY = "transfer_history";

/** Long stop on the expiry exemption for unresolved mid-flow multi-tx
 *  entries: far longer than any real recovery window, short enough that an
 *  entry whose first transaction never landed doesn't live forever. */
const MULTI_TX_RESUME_EXPIRE_DAYS = 30;

/** How long after a local deposit's estimated arrival an imported arrival
 *  of the same asset is still treated as that deposit. */
const IMPORT_DEPOSIT_MATCH_GRACE_SECONDS = 60 * 60;

export type TransferHistoryState = {
  /** Volatile list of tx snapshots. Updated immutably. */
  snapshots: TxSnapshot[];
  isRestoredFromIndexedDB: boolean;
};

/**
 * Identifies a history entry: its tx hash, plus the packet for an imported
 * deposit (a relayer tx can deliver several packets to the same user).
 */
export function transferKey({
  sendTxHash,
  packetId,
}: Pick<TxSnapshot, "sendTxHash" | "packetId">) {
  return packetId ? `${sendTxHash}/${packetId}` : sendTxHash;
}

export type TransferHistoryEntry = TxSnapshot & {
  createdAt: Date;
  providerName?: string;
  status: TransferStatus;
  explorerUrl: string;
};

/**
 * Stores and tracks status for bridge transfers.
 *
 * State lives in a vanilla Zustand store (`this.store`, subscribed from React
 * via `useStore(store.store, selector)`). Persistence is hand-rolled against
 * the `KVStore` rather than Zustand's `persist` middleware: the stored value
 * must stay a bare `TxSnapshot[]` (persist wraps it in `{state, version}`),
 * and writes need the cross-session merge in `persistSnapshots`.
 *
 * NOTE: source keyPrefix values must be unique.
 */
export class TransferHistoryStore implements TransferStatusReceiver {
  readonly store: StoreApi<TransferHistoryState> =
    createStore<TransferHistoryState>(() => ({
      snapshots: [],
      isRestoredFromIndexedDB: false,
    }));

  /**
   * Since we can't control how many times a status provider
   * will call `receiveNewTxStatus`, we need to track which
   * tx statuses have already been resolved to avoid duplicity in UI.
   */
  private readonly _resolvedTxStatusKeys = new Set<string>();

  constructor(
    /** `undefined` until bound via `setOnAccountTransferSuccess`; successes
     *  arriving in the meantime are replayed (once) on binding. */
    protected onAccountTransferSuccess:
      ((accountAddress: string) => void) | undefined,
    protected readonly kvStore: KVStore,
    protected readonly transferStatusProviders: TransferStatusProvider[] = [],
    protected readonly historyExpireDays = 3,
    /** Disabled on the server so storage / restore are never touched. */
    enabled = true
  ) {
    this.transferStatusProviders.forEach(
      (source) => (source.statusReceiverDelegate = this)
    );

    if (!enabled) return;

    // persist snapshots on change (merged against storage, so a session
    // holding a stale in-memory copy can never regress an entry another
    // session already advanced)
    this.store.subscribe((state, prev) => {
      if (
        state.isRestoredFromIndexedDB &&
        (state.snapshots !== prev.snapshots || !prev.isRestoredFromIndexedDB)
      ) {
        void this.persistSnapshots(state.snapshots);
      }
    });

    void this.restoreSnapshots();
  }

  /** Late-bound so the callback can close over React context (tRPC utils). */
  setOnAccountTransferSuccess(callback: (accountAddress: string) => void) {
    this.onAccountTransferSuccess = callback;
    if (this.unboundSuccessAddress !== undefined) {
      const address = this.unboundSuccessAddress;
      this.unboundSuccessAddress = undefined;
      callback(address);
    }
  }

  /** Last account whose transfer succeeded before a callback was bound. */
  private unboundSuccessAddress: string | undefined;

  private notifyTransferSuccess(accountAddress: string) {
    if (this.onAccountTransferSuccess) {
      this.onAccountTransferSuccess(accountAddress);
    } else {
      this.unboundSuccessAddress = accountAddress;
    }
  }

  get snapshots(): readonly TxSnapshot[] {
    return this.store.getState().snapshots;
  }

  /** Provider for display (name, explorer link). */
  private findProvider(snapshot: TxSnapshot) {
    return this.transferStatusProviders.find((source) =>
      snapshot.provider.startsWith(source.providerId)
    );
  }

  /** Provider that tracks the transfer's status. */
  private findTrackingProvider(snapshot: TxSnapshot) {
    const providerId = snapshot.statusProvider ?? snapshot.provider;
    return this.transferStatusProviders.find((source) =>
      providerId.startsWith(source.providerId)
    );
  }

  /** Swap an entry found synchronously just before. Only safe with no
   *  `await` between the lookup and the call; after an await use
   *  `updateSnapshotByKey`, which re-resolves the entry. */
  private replaceSnapshot(prev: TxSnapshot, next: TxSnapshot) {
    let matched = false;
    this.store.setState((state) => ({
      snapshots: state.snapshots.map((s) => {
        if (s !== prev) return s;
        matched = true;
        return next;
      }),
    }));
    if (!matched) {
      console.warn(
        "Transfer snapshot update matched no entry",
        prev.sendTxHash
      );
    }
  }

  /**
   * Update an entry resolved by its immutable correlation key (the first-step
   * hash, or the current hash for entries that never had one) against the
   * CURRENT state. `update` receives the entry as it is now and returns the
   * replacement, or undefined to leave it. Returns the object written, or
   * undefined if the entry is gone / untouched.
   */
  private updateSnapshotByKey(
    key: string,
    update: (current: TxSnapshot) => TxSnapshot | undefined
  ): TxSnapshot | undefined {
    let written: TxSnapshot | undefined;
    this.store.setState((state) => {
      const index = state.snapshots.findIndex(
        (s) => s.firstStepTxHash === key || s.sendTxHash === key
      );
      if (index < 0) return state;
      written = update(state.snapshots[index]);
      if (!written) return state;
      const snapshots = state.snapshots.slice();
      snapshots[index] = written;
      return { snapshots };
    });
    if (!written) {
      console.warn("Transfer snapshot update matched no entry", key);
    }
    return written;
  }

  /** Pure derivation of the history rows for an account. */
  getHistoriesByAccount(
    accountAddress: string,
    snapshots: readonly TxSnapshot[] = this.snapshots
  ) {
    const histories: TransferHistoryEntry[] = [];
    snapshots.forEach((snapshot) => {
      const statusSource = this.findProvider(snapshot);
      if (statusSource && snapshot.osmoBech32Address === accountAddress) {
        // makeExplorerUrl already returns "" when it can't resolve a link
        // (e.g. the tx's chain is no longer in the registry). This try/catch
        // is a render-safety backstop: an explorer URL is cosmetic, so any
        // unexpected throw from a status provider must not escape and crash
        // the transaction history / portfolio page. Fall back to an
        // empty URL, which the UI renders as "no explorer link".
        let explorerUrl = snapshot.explorerUrl ?? "";
        try {
          explorerUrl ||= statusSource.makeExplorerUrl(snapshot);
        } catch (e) {
          console.error("Failed to build transfer explorer URL", e);
        }
        histories.push({
          ...snapshot,
          sendTxHash: snapshot.sendTxHash,
          createdAt: new Date(snapshot.createdAtUnix * 1000),
          providerName: statusSource.sourceDisplayName,
          explorerUrl,
        });
      }
    });

    return histories;
  }

  /**
   * History rows for transfers from the transaction index (e.g. one page of
   * it), with the status tracked here for those already imported. Transfers
   * made in this browser are left out: they're in `getHistoriesByAccount`.
   */
  getIndexedHistories(
    accountAddress: string,
    indexed: readonly TxSnapshot[],
    snapshots: readonly TxSnapshot[] = this.snapshots
  ) {
    const rows = matchIndexedTransfers(indexed, snapshots).flatMap(
      (match, i) =>
        match.kind === "imported"
          ? [match.entry]
          : match.kind === "new"
            ? [{ ...indexed[i], imported: true }]
            : []
    );
    return this.getHistoriesByAccount(accountAddress, rows);
  }

  /** Add transaction to be tracked starting now. */
  pushTxNow(snapshot: TxSnapshot) {
    // For multi-tx entries, pin the immutable first-step hash: sendTxHash
    // is reassigned when the transfer advances, and the first-step hash is
    // what lets a stale session correlate its entry with the persisted one.
    // Copy rather than mutate the caller's object.
    if (snapshot.pendingStep && !snapshot.firstStepTxHash) {
      snapshot = { ...snapshot, firstStepTxHash: snapshot.sendTxHash };
    }
    const {
      sendTxHash,
      estimatedArrivalUnix,
      createdAtUnix,
      fromChain,
      toChain,
      toAsset,
      fromAsset,
      direction,
    } = snapshot;
    const statusSource = this.findTrackingProvider(snapshot);

    // start tracking for life of current session — except mid-flow multi-tx
    // entries: their first tx's status completes when funds reach the
    // intermediate chain, which the provider would misreport as transfer
    // success. The multi-tx flow drives their status until the final step is
    // signed (`advanceMultiTxStep`).
    if (!snapshot.pendingStep) {
      statusSource?.trackTxStatus(snapshot);
    }

    const amountLogo =
      direction === "withdraw" ? toAsset?.imageUrl : fromAsset.imageUrl;

    setTimeout(() => {
      displayToast(
        {
          titleTranslationKey:
            snapshot.direction === "withdraw"
              ? "transfer.pendingWithdraw"
              : "transfer.pendingDeposit",
          iconElement:
            amountLogo && estimatedArrivalUnix ? (
              <PendingTransferLoadingIcon
                estimatedArrivalUnix={estimatedArrivalUnix}
                assetLogo={amountLogo}
                startTimeUnix={createdAtUnix}
              />
            ) : undefined,
          captionElement: (
            <PendingTransferCaption
              amount={formatPretty(
                new CoinPretty(
                  {
                    coinDecimals: fromAsset.decimals,
                    coinMinimalDenom: fromAsset.address,
                    coinDenom: fromAsset.denom,
                  },
                  new Dec(fromAsset.amount)
                ),
                {
                  maxDecimals: 6,
                }
              )}
              chainPrettyName={
                direction === "deposit"
                  ? (fromChain?.prettyName ?? "")
                  : (toChain?.prettyName ?? "")
              }
              isWithdraw={direction === "withdraw"}
              estimatedArrivalUnix={estimatedArrivalUnix}
            />
          ),
        },
        ToastType.LOADING,
        {
          toastId: sendTxHash,
          autoClose: false,
        }
      );
    }, 1000);

    const pushed = snapshot;
    this.store.setState((state) => ({
      snapshots: [...state.snapshots, pushed],
    }));
  }

  /**
   * The final step of a multi-tx route was signed: clear the pending step,
   * key the entry on the final step's tx hash, and hand status tracking to
   * the provider (polling on the intermediate chain the step was signed on).
   */
  advanceMultiTxStep(
    prevSendTxHash: string,
    {
      finalSendTxHash,
      trackingChainId,
      estimatedArrivalUnix,
    }: {
      finalSendTxHash: string;
      trackingChainId: string;
      estimatedArrivalUnix: number;
    }
  ) {
    // Look up by the current key OR the immutable first-step hash: after a
    // failed final step restores the pending step, the entry's sendTxHash
    // is still the failed attempt's hash while the step being re-signed is
    // keyed on the first step's hash.
    const snapshot = this.snapshots.find(
      (snapshot) =>
        snapshot.sendTxHash === prevSendTxHash ||
        snapshot.firstStepTxHash === prevSendTxHash
    );
    if (!snapshot) {
      console.error("Couldn't find tx snapshot when advancing multi-tx step");
      return;
    }

    // the pending toast is keyed on the entry's current hash; dismiss it
    // since further updates are keyed on the final step's hash
    toast.dismiss(snapshot.sendTxHash);

    const next: TxSnapshot = {
      ...snapshot,
      // keep the immutable correlation key even for entries created before
      // firstStepTxHash existed, so other sessions can match the advance
      firstStepTxHash: snapshot.firstStepTxHash ?? prevSendTxHash,
      // Keep a copy of the step being advanced past: if the signed tx then
      // fails on-chain (or its transfer times out and refunds), the funds are
      // still on the intermediate chain and the step is restored from this.
      advancedStep: snapshot.pendingStep
        ? { ...snapshot.pendingStep }
        : undefined,
      multiTxStepVersion: (snapshot.multiTxStepVersion ?? 0) + 1,
      pendingStep: undefined,
      sendTxHash: finalSendTxHash,
      trackingChainId,
      estimatedArrivalUnix,
      status: "pending",
    };
    this.replaceSnapshot(snapshot, next);

    this.findTrackingProvider(next)?.trackTxStatus(next);
  }

  /**
   * Receives status updates from providers (and the bridge flows) for a
   * tracked transfer, updating the snapshot and surfacing toasts.
   */
  async receiveNewTxStatus(
    sendTxHash: string,
    status: TransferStatus,
    reason: TransferFailureReason | undefined
  ) {
    const found = this.snapshots.find(
      (snapshot) => snapshot.sendTxHash === sendTxHash
    );

    if (!found) {
      console.error("Couldn't find tx snapshot when receiving tx status");
      return;
    }

    // Providers can deliver the same terminal status more than once. A hash
    // that already resolved must not mutate the snapshot AT ALL: a late
    // duplicate "failed" would otherwise clobber the pending step a
    // failed-final-step restore just put back (and the status write happens
    // before the toast dedup below).
    if (this._resolvedTxStatusKeys.has(sendTxHash)) return;

    const {
      direction,
      toAsset,
      fromAsset,
      createdAtUnix,
      estimatedArrivalUnix,
      fromChain,
      toChain,
      osmoBech32Address,
    } = found;

    // set updates
    const snapshot: TxSnapshot = { ...found, status, reason };
    this.replaceSnapshot(found, snapshot);

    // Imported transfers were made elsewhere (another browser or device):
    // update history silently rather than toasting about them here.
    if (found.imported) {
      if (status !== "pending") this._resolvedTxStatusKeys.add(sendTxHash);
      return;
    }

    const amountLogo =
      direction === "withdraw" ? toAsset?.imageUrl : fromAsset.imageUrl;
    const amount = formatPretty(
      new CoinPretty(
        {
          coinDecimals: fromAsset.decimals,
          coinMinimalDenom: fromAsset.address,
          coinDenom: fromAsset.denom,
        },
        new Dec(fromAsset.amount)
      ),
      {
        maxDecimals: 6,
      }
    );

    const chainPrettyName =
      direction === "deposit"
        ? (fromChain?.prettyName ?? "")
        : (toChain?.prettyName ?? "");

    switch (status) {
      case "pending":
        displayToast(
          {
            titleTranslationKey:
              snapshot.direction === "withdraw"
                ? "transfer.pendingWithdraw"
                : "transfer.pendingDeposit",
            iconElement:
              amountLogo && estimatedArrivalUnix ? (
                <PendingTransferLoadingIcon
                  estimatedArrivalUnix={estimatedArrivalUnix}
                  assetLogo={amountLogo}
                  startTimeUnix={createdAtUnix}
                />
              ) : undefined,
            captionElement: (
              <PendingTransferCaption
                amount={amount}
                chainPrettyName={chainPrettyName}
                isWithdraw={direction === "withdraw"}
                estimatedArrivalUnix={estimatedArrivalUnix}
              />
            ),
          },
          ToastType.LOADING,
          { updateToastId: sendTxHash, autoClose: false }
        );
        break;
      case "success":
        displayToast(
          {
            titleTranslationKey:
              direction === "withdraw"
                ? "transfer.completedWithdraw"
                : "transfer.completedDeposit",
            captionTranslationKey:
              direction === "withdraw"
                ? [
                    "transfer.amountToChain",
                    { amount: amount, chain: chainPrettyName },
                  ]
                : [
                    "transfer.amountFromChain",
                    { amount: amount, chain: chainPrettyName },
                  ],
          },
          ToastType.SUCCESS,
          { updateToastId: sendTxHash }
        );
        this.notifyTransferSuccess(osmoBech32Address);
        this._resolvedTxStatusKeys.add(sendTxHash);
        break;
      case "failed":
        // A failed FINAL step of a multi-tx route is not terminal for the
        // funds: an on-chain failure moved nothing and a timed-out transfer
        // refunds, so they sit on the intermediate chain either way (and
        // the resume-time balance check catches the exceptions). Restore
        // the pending step so Continue is offered again, and say where the
        // funds are, instead of leaving a dead "failed" row with copy that
        // implies the deposit itself failed.
        if (snapshot.advancedStep && snapshot.firstStepTxHash) {
          const restoredStep = { ...snapshot.advancedStep };
          this.replaceSnapshot(snapshot, {
            ...snapshot,
            status: "pending",
            reason: undefined,
            pendingStep: restoredStep,
            advancedStep: undefined,
            multiTxStepVersion: (snapshot.multiTxStepVersion ?? 0) + 1,
          });
          // The failed attempt's hash is fully handled: resolve it so a
          // duplicate provider callback can't re-enter and overwrite the
          // restore (a retry advances under a NEW final hash).
          this._resolvedTxStatusKeys.add(sendTxHash);
          displayToast(
            {
              titleTranslationKey: "transfer.multiTxStepFailedTitle",
              captionTranslationKey: [
                "transfer.multiTxStepFailed",
                { chain: restoredStep.prettyName },
              ],
            },
            ToastType.ERROR,
            { updateToastId: sendTxHash }
          );
          // make the restore durable before another session's storage
          // check can mistake it for an already-advanced entry
          await this.persistNow();
          break;
        }
        displayToast(
          {
            titleTranslationKey:
              direction === "withdraw"
                ? "transfer.failedWithdraw"
                : "transfer.failedDeposit",
            captionTranslationKey: [
              "transfer.amountFailedToWithdraw",
              { amount },
            ],
          },
          ToastType.ERROR,
          { updateToastId: sendTxHash }
        );
        this._resolvedTxStatusKeys.add(sendTxHash);
        break;
      case "connection-error":
        displayToast(
          {
            titleTranslationKey: "transfer.connectionError",
            captionTranslationKey: [
              "transfer.amountFailedToWithdraw",
              { amount },
            ],
          },
          ToastType.ERROR,
          { updateToastId: sendTxHash }
        );
        this._resolvedTxStatusKeys.add(sendTxHash);
        break;
    }
  }

  /** Imports received before the stored history was restored. */
  private importsAwaitingRestore: TxSnapshot[] = [];

  /**
   * Add transfers found in the transaction index (made in any browser or
   * device) to history, to track their status. Idempotent: see
   * `matchIndexedTransfers`. Pending withdrawals are tracked to their final
   * status.
   */
  importSnapshots(snapshots: TxSnapshot[]) {
    if (!this.store.getState().isRestoredFromIndexedDB) {
      // dedupe needs the stored history; finish after restore
      this.importsAwaitingRestore.push(...snapshots);
      return;
    }

    const matches = matchIndexedTransfers(snapshots, this.snapshots);
    const toAdd: TxSnapshot[] = [];
    const refreshed = new Map<TxSnapshot, TxSnapshot>();
    snapshots.forEach((incoming, i) => {
      const match = matches[i];
      if (match.kind === "imported") {
        // Refresh details of previously imported entries (parsing improves
        // over time). Keep what's already resolved: a final status, and a
        // sender/link a later response may lack (e.g. a timed-out lookup).
        const previous = match.entry;
        const isSettled = previous.status !== "pending";
        const next: TxSnapshot = {
          ...incoming,
          fromAddress: incoming.fromAddress || previous.fromAddress,
          explorerUrl: incoming.explorerUrl ?? previous.explorerUrl,
          imported: true,
          status: isSettled ? previous.status : incoming.status,
          reason: isSettled ? previous.reason : incoming.reason,
        };
        if (!isSameSnapshot(previous, next)) refreshed.set(previous, next);
      } else if (match.kind === "new") {
        // Pending withdrawals are tracked to their final status (via Skip,
        // which traces old transfers by hash too); the index alone can't
        // tell whether a transfer was delivered, timed out or refunded.
        toAdd.push({ ...incoming, imported: true });
      }
    });

    if (toAdd.length === 0 && refreshed.size === 0) return;

    this.store.setState((state) => ({
      snapshots: [
        ...state.snapshots.map((s) => refreshed.get(s) ?? s),
        ...toAdd,
      ],
    }));

    toAdd.forEach((snapshot) => {
      if (snapshot.status === "pending") {
        this.findTrackingProvider(snapshot)?.trackTxStatus(snapshot);
      } else {
        this._resolvedTxStatusKeys.add(snapshot.sendTxHash);
      }
    });
    // settled by the server (e.g. Axelarscan) while tracked here: a late
    // provider update must not overwrite it
    refreshed.forEach((snapshot) => {
      if (snapshot.status !== "pending") {
        this._resolvedTxStatusKeys.add(snapshot.sendTxHash);
      }
    });
  }

  /**
   * A mid-flow multi-tx entry whose expected funds are no longer on the
   * intermediate account must stop offering Continue: signing again could
   * spend unrelated funds. It must NOT be handed to first-leg tracking
   * either — tx1 success only proves arrival on the intermediate chain, so
   * tracking it would report a completed deposit that may never have
   * reached the destination. The entry keeps its pending step, marked
   * stale, and expires with the snapshot.
   */
  markPendingStepStale(sendTxHash: string) {
    const snapshot = this.snapshots.find(
      (snapshot) => snapshot.sendTxHash === sendTxHash
    );
    if (!snapshot?.pendingStep) return;

    this.replaceSnapshot(snapshot, {
      ...snapshot,
      pendingStep: { ...snapshot.pendingStep, stale: true },
    });
  }

  /**
   * Record that the entry's first transaction was broadcast but its receipt
   * couldn't be fetched, so its inclusion is unproven. Status providers and
   * the resume check then stop reading "not found" or "abandoned" as proof
   * of failure.
   */
  markSendTxUnconfirmed(sendTxHash: string) {
    const snapshot = this.snapshots.find(
      (snapshot) => snapshot.sendTxHash === sendTxHash
    );
    if (!snapshot) return;

    this.replaceSnapshot(snapshot, { ...snapshot, sendTxUnconfirmed: true });
  }

  /**
   * Durably write the given snapshots, merged against what storage already
   * holds: a full-array write from a session with a stale in-memory copy
   * must never regress a multi-tx entry that another session has advanced
   * past its pending step (or marked stale). The read-merge-write cycle is
   * serialized cross-tab via the Web Locks API where available so
   * concurrent writers cannot interleave.
   */
  protected async persistSnapshots(
    snapshots: readonly TxSnapshot[]
  ): Promise<void> {
    const keyOf = (snapshot: TxSnapshot) =>
      snapshot.firstStepTxHash ?? transferKey(snapshot);
    const write = async () => {
      const stored =
        (await this.kvStore.get<TxSnapshot[]>(TRANSFER_HISTORY_STORE_KEY)) ??
        [];
      const merged = snapshots.map((local) => {
        const winner = pickFurtherAlong(local);
        // Unproven inclusion is only ever resolved by the status providers,
        // so a copy that learned it must not lose it to the other copy.
        const twin = stored.find((s) => keyOf(s) === keyOf(local));
        return !winner.sendTxUnconfirmed &&
          (local.sendTxUnconfirmed || twin?.sendTxUnconfirmed)
          ? { ...winner, sendTxUnconfirmed: true }
          : winner;
      });
      function pickFurtherAlong(local: TxSnapshot): TxSnapshot {
        const key = keyOf(local);
        const storedTwin = stored.find((snapshot) => keyOf(snapshot) === key);
        if (!storedTwin) return local;
        // The step version orders advances AND restores (a restored step
        // has a pendingStep again but is NEWER than the advanced copy, so
        // pendingStep presence alone can't order the two): the higher
        // version is further along.
        const localVersion = local.multiTxStepVersion ?? 0;
        const storedVersion = storedTwin.multiTxStepVersion ?? 0;
        if (storedVersion > localVersion) return storedTwin;
        if (localVersion > storedVersion) return local;
        // Same version: the stored copy is further along when it advanced
        // past the step or marked it stale — keep it over the local
        // regression.
        if (!local.pendingStep) return local;
        if (
          !storedTwin.pendingStep ||
          (storedTwin.pendingStep.stale && !local.pendingStep.stale)
        ) {
          return storedTwin;
        }
        return local;
      }
      // Union, not replacement: entries that exist only in storage (created
      // by another session after this one loaded) must survive this
      // session's write, or a stale tab persisting an unrelated change
      // would erase another tab's resumable entry. Expired entries are
      // still pruned rather than resurrected.
      const mergedKeys = new Set(merged.map(keyOf));
      for (const storedOnly of stored) {
        if (!mergedKeys.has(keyOf(storedOnly)) && this.isLive(storedOnly)) {
          merged.push(storedOnly);
        }
      }
      await this.kvStore.set(TRANSFER_HISTORY_STORE_KEY, merged);
    };
    if (typeof navigator !== "undefined" && navigator.locks) {
      await navigator.locks.request("transfer-history-persist", write);
    } else {
      await write();
    }
  }

  /**
   * Awaitable durable persistence of the current snapshots, for callers
   * that must not proceed until state is written — e.g. the final-step
   * signing lock is only released after the broadcast advance is durable,
   * so the next lock holder's storage check sees it.
   */
  async persistNow(): Promise<void> {
    await this.persistSnapshots(this.snapshots);
  }

  /**
   * Whether a snapshot should still be kept. UNRESOLVED mid-flow multi-tx
   * entries (still pending, step not stale) outlive the normal expiry:
   * their Continue action is the only recovery path for funds on the
   * intermediate chain. Not forever, though — a first transaction that
   * never actually landed (dropped or reverted) leaves an entry whose
   * Continue can never work, so a long stop bounds the exemption.
   * Everything else — terminal statuses included, even with a leftover
   * pending step — expires after `historyExpireDays`.
   */
  protected isLive(snapshot: TxSnapshot): boolean {
    if (
      snapshot.status === "pending" &&
      snapshot.pendingStep &&
      !snapshot.pendingStep.stale
    ) {
      return dayjs
        .unix(snapshot.createdAtUnix)
        .isAfter(dayjs().subtract(MULTI_TX_RESUME_EXPIRE_DAYS, "day"));
    }
    return dayjs
      .unix(snapshot.createdAtUnix)
      .isAfter(dayjs().subtract(this.historyExpireDays, "day"));
  }

  /**
   * Cross-session replay guard for resuming a multi-tx transfer: the
   * persisted history is the shared truth between sessions of this browser
   * profile (the signing session writes the advance at final-step
   * broadcast), so a session holding a stale in-memory entry must re-read
   * it before signing. Called INSIDE the cross-tab signing lock by
   * `signFinalStep`, which is what makes the check-then-sign atomic.
   * Correlates via the immutable `firstStepTxHash`,
   * since an advanced entry's `sendTxHash` has been reassigned.
   *
   * Applies whatever the storage knows to the local entry, and reports:
   * - "resumable": storage agrees the step is still pending and not stale
   * - "advanced": another session already signed the step (local entry
   *   updated from storage, tracking started if still pending)
   * - "stale": storage has the step marked stale (mirrored locally)
   * - "missing": storage no longer has the entry; do not sign
   */
  async syncPendingStepFromStorage(
    sendTxHash: string
  ): Promise<"resumable" | "advanced" | "stale" | "missing"> {
    const initial = this.snapshots.find(
      (snapshot) => snapshot.sendTxHash === sendTxHash
    );
    if (!initial?.pendingStep) return "missing";
    const firstStepHash = initial.firstStepTxHash ?? sendTxHash;

    const stored =
      (await this.kvStore.get<TxSnapshot[]>(TRANSFER_HISTORY_STORE_KEY)) ?? [];

    // The await above can overlap another sync / advance / stale-mark on the
    // same entry, so everything below works off the entry as it is NOW,
    // resolved by its immutable key, never off `initial`.
    const local = this.snapshots.find(
      (snapshot) =>
        snapshot.firstStepTxHash === firstStepHash ||
        snapshot.sendTxHash === firstStepHash
    );
    if (!local) return "missing";
    // already advanced by a concurrent call; tracking was started there
    if (!local.pendingStep) return "advanced";

    const storedSnapshot = stored.find(
      (snapshot) =>
        snapshot.firstStepTxHash === firstStepHash ||
        snapshot.sendTxHash === firstStepHash
    );
    if (!storedSnapshot) {
      // Storage no longer knows this entry (cleared elsewhere, or an
      // uncorrelatable legacy advance): nothing can verify the step wasn't
      // signed, so it must never be signed from here. Mark it stale so the
      // row shows needs-attention instead of a silently dead Continue.
      this.markPendingStepStale(local.sendTxHash);
      return "missing";
    }

    // Local state newer than storage (a just-restored step whose persist
    // hasn't landed yet): trust the newer local copy rather than regressing
    // it to the stored advance.
    if (
      (local.multiTxStepVersion ?? 0) > (storedSnapshot.multiTxStepVersion ?? 0)
    ) {
      return local.pendingStep.stale ? "stale" : "resumable";
    }

    if (storedSnapshot.pendingStep?.stale) {
      this.markPendingStepStale(local.sendTxHash);
      return "stale";
    }
    if (storedSnapshot.pendingStep) {
      // another session may have learned the first tx is unconfirmed
      if (storedSnapshot.sendTxUnconfirmed && !local.sendTxUnconfirmed) {
        this.markSendTxUnconfirmed(local.sendTxHash);
      }
      return "resumable";
    }

    // Advanced elsewhere: mirror the persisted state so this session's row
    // stops offering Continue, and pick up tracking if still pending.
    toast.dismiss(local.sendTxHash);
    const advanced = this.updateSnapshotByKey(firstStepHash, (current) =>
      current.pendingStep
        ? {
            ...current,
            pendingStep: undefined,
            sendTxHash: storedSnapshot.sendTxHash,
            trackingChainId: storedSnapshot.trackingChainId,
            estimatedArrivalUnix: storedSnapshot.estimatedArrivalUnix,
            status: storedSnapshot.status,
          }
        : undefined
    );
    if (!advanced) return "missing";
    if (advanced.status === "pending") {
      this.findTrackingProvider(advanced)?.trackTxStatus(advanced);
    }
    return "advanced";
  }

  /** Use persisted tx snapshots to resume Tx monitoring after browser first loads.
   *  Removes expired snapshots.
   */
  protected async restoreSnapshots() {
    const storedSnapshots =
      (await this.kvStore.get<TxSnapshot[]>(TRANSFER_HISTORY_STORE_KEY)) ?? [];

    // Drop expired snapshots (they are pruned from storage on the next
    // persist); see `isLive` for the multi-tx exemption. Legacy mid-flow
    // entries persisted before `firstStepTxHash` existed are stamped so
    // cross-session correlation works for them too (pre-advance,
    // sendTxHash is still the first step's hash).
    const liveSnapshots = storedSnapshots
      .filter((snapshot) => this.isLive(snapshot))
      .map((snapshot) =>
        snapshot.pendingStep && !snapshot.firstStepTxHash
          ? { ...snapshot, firstStepTxHash: snapshot.sendTxHash }
          : snapshot
      );

    liveSnapshots.forEach((snapshot) => {
      const statusSource = this.findTrackingProvider(snapshot);

      // start receiving tx status updates again for snapshots that were still pending
      if (
        (snapshot.status === "pending" ||
          snapshot.status === "connection-error") &&
        statusSource &&
        // mid-flow multi-tx entries stay pending without provider tracking:
        // their first tx's status would misreport arrival on the
        // intermediate chain as transfer success. They resolve when the user
        // resumes and signs the final step.
        !snapshot.pendingStep
      ) {
        statusSource.trackTxStatus(snapshot);
      } else if (
        snapshot.status !== "pending" &&
        snapshot.status !== "connection-error"
      ) {
        this._resolvedTxStatusKeys.add(snapshot.sendTxHash);
      }
    });

    // Append (not replace): a transfer pushed while restore was in flight
    // must be kept. One atomic update so the persist subscriber sees the
    // restored flag and the merged list together.
    this.store.setState((state) => ({
      snapshots: [...state.snapshots, ...liveSnapshots],
      isRestoredFromIndexedDB: true,
    }));

    if (this.importsAwaitingRestore.length > 0) {
      const awaiting = this.importsAwaitingRestore;
      this.importsAwaitingRestore = [];
      this.importSnapshots(awaiting);
    }
  }
}

type IndexedTransferMatch =
  /** Imported earlier; the entry tracks its status. */
  | { kind: "imported"; entry: TxSnapshot }
  /** Made in this browser, or a repeat within the batch. */
  | { kind: "known" }
  | { kind: "new" };

/**
 * How each transfer from the transaction index relates to history: imported
 * earlier (matched by tx hash and packet), made in this browser (by Osmosis
 * tx hash, or for deposits, whose snapshot holds the source chain's hash, by
 * asset and arrival time), or new.
 */
function matchIndexedTransfers(
  indexed: readonly TxSnapshot[],
  existing: readonly TxSnapshot[]
): IndexedTransferMatch[] {
  const importedByKey = new Map<string, TxSnapshot>();
  // imported before deposits were keyed by packet: one entry per tx hash
  const legacyByHash = new Map<string, TxSnapshot>();
  // Uppercased: the index gives Cosmos tx hashes in uppercase, while a
  // transfer made in this browser keeps the broadcast's lowercase hash.
  const localHashes = new Set<string>();
  existing.forEach((s) => {
    if (s.imported) {
      importedByKey.set(transferKey(s), s);
      if (s.direction === "deposit" && !s.packetId) {
        legacyByHash.set(s.sendTxHash, s);
      }
    } else {
      localHashes.add(s.sendTxHash.toUpperCase());
      if (s.firstStepTxHash) localHashes.add(s.firstStepTxHash.toUpperCase());
    }
  });

  const seen = new Set<string>();
  const claimed = new Set<TxSnapshot>();
  const matchedLocalDeposits = new Set<TxSnapshot>();
  return indexed.map((incoming): IndexedTransferMatch => {
    const key = transferKey(incoming);
    if (seen.has(key)) return { kind: "known" };
    seen.add(key);

    // made in this browser, so it's listed (and tracked) as that entry; this
    // comes first so a copy imported before hashes were compared by case is
    // never listed too
    if (localHashes.has(incoming.sendTxHash.toUpperCase())) {
      return { kind: "known" };
    }
    const entry =
      importedByKey.get(key) ??
      (incoming.packetId ? legacyByHash.get(incoming.sendTxHash) : undefined);
    if (entry && !claimed.has(entry)) {
      claimed.add(entry);
      return { kind: "imported", entry };
    }

    if (incoming.direction === "deposit") {
      const localDeposit = findMatchingLocalDeposit(
        incoming,
        existing,
        matchedLocalDeposits
      );
      if (localDeposit) {
        matchedLocalDeposits.add(localDeposit);
        return { kind: "known" };
      }
    }
    return { kind: "new" };
  });
}

function isSameSnapshot(a: TxSnapshot, b: TxSnapshot) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * A deposit made in this browser is keyed on its source chain tx hash, so its
 * arrival on Osmosis (as found in the index) can't be matched by hash.
 * Match on the received asset and the arrival time instead, nearest first,
 * each local deposit at most once.
 */
export function findMatchingLocalDeposit(
  incoming: TxSnapshot,
  existing: readonly TxSnapshot[],
  alreadyMatched: ReadonlySet<TxSnapshot>
): TxSnapshot | undefined {
  let best: TxSnapshot | undefined;
  for (const local of existing) {
    if (
      local.imported ||
      local.direction !== "deposit" ||
      // its funds never arrived, so an arrival can't be this deposit
      local.status === "failed" ||
      local.status === "refunded" ||
      alreadyMatched.has(local) ||
      local.osmoBech32Address !== incoming.osmoBech32Address ||
      !isSameReceivedAsset(local, incoming)
    ) {
      continue;
    }
    const windowEnd =
      Math.max(local.estimatedArrivalUnix, local.createdAtUnix) +
      IMPORT_DEPOSIT_MATCH_GRACE_SECONDS;
    if (
      incoming.createdAtUnix < local.createdAtUnix ||
      incoming.createdAtUnix > windowEnd
    ) {
      continue;
    }
    if (!best || local.createdAtUnix > best.createdAtUnix) best = local;
  }
  return best;
}

/**
 * Whether an indexed arrival is the asset a local deposit received, in about
 * the amount it sent. A deposit that converts on arrival (e.g. USDC into
 * alloyed allUSDC) records the alloy locally, while the index sees the asset
 * that arrived: match an arrival of one of the alloy's variants by its
 * 1:1-converted amount.
 */
function isSameReceivedAsset(local: TxSnapshot, incoming: TxSnapshot) {
  const expected =
    displayAmount(local.toAsset) ?? displayAmount(local.fromAsset);
  const arrived =
    displayAmount(incoming.toAsset) ??
    displayAmount({
      ...incoming.fromAsset,
      decimals: incoming.toAsset.decimals,
    });

  if (local.toAsset.address === incoming.toAsset.address) {
    // an unknown amount can't rule the arrival out
    if (expected === undefined || arrived === undefined) return true;
    // bridge fees can come off the amount on the way, but an arrival can't
    // be more than was sent
    return arrived <= expected * 1.02 && arrived >= expected * 0.8;
  }

  if (
    !incoming.toAsset.alloy ||
    incoming.toAsset.alloy !== local.toAsset.address ||
    expected === undefined ||
    arrived === undefined
  ) {
    return false;
  }
  return Math.abs(arrived - expected) / expected <= 0.02;
}

/** An asset amount in display units, from the asset's own decimals. */
function displayAmount(asset: {
  amount?: string;
  decimals: number;
}): number | undefined {
  const amount = Number(asset.amount);
  if (!(amount > 0)) return;
  return amount / 10 ** asset.decimals;
}

const PendingTransferLoadingIcon: FunctionComponent<{
  assetLogo: string;
  estimatedArrivalUnix: number;
  startTimeUnix: number;
}> = ({ assetLogo, estimatedArrivalUnix, startTimeUnix }) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!estimatedArrivalUnix || !progressRef.current) return;

    const updateProgress = () => {
      const currentTime = Date.now() / 1000;
      const remainingTime = estimatedArrivalUnix - currentTime;
      const totalElapsedTime = estimatedArrivalUnix - startTimeUnix;
      const progressPercentage = Math.max(
        (remainingTime / totalElapsedTime) * 100,
        0
      );

      // Directly update the HTML elements
      // DANGER: We update the HTML directly because react-toastify is having issues while handling react state changes
      if (progressRef.current) {
        const circles = progressRef.current.querySelectorAll("circle");
        const radius = 20;
        const circumference = 2 * Math.PI * radius;
        const offset = Math.max((progressPercentage / 100) * circumference, 7);

        circles.forEach((circle, index) => {
          if (index === 1) {
            // Only update the second circle
            circle.style.strokeDashoffset = `${offset}`;
          }
        });
      }
    };

    updateProgress();

    const intervalId = setInterval(updateProgress, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [estimatedArrivalUnix, startTimeUnix]);

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <div className="h-8 w-8 overflow-hidden rounded-full">
        <EntityImage
          logoURIs={{
            png: assetLogo,
          }}
          name="Token"
          symbol="TOK"
          width={32}
          height={32}
        />
      </div>
      <div className="absolute inset-0" ref={progressRef}>
        <RadialProgress progress={100} strokeWidth={2} />
      </div>
    </div>
  );
};

export const PendingTransferCaption: FunctionComponent<{
  isWithdraw: boolean;
  amount: string;
  chainPrettyName: string;
  estimatedArrivalUnix: number | undefined;
}> = ({ isWithdraw, amount, chainPrettyName, estimatedArrivalUnix }) => {
  const { t } = useTranslation();
  const progressRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!estimatedArrivalUnix || !progressRef.current) return;

    const updateTime = () => {
      const date = dayjs.unix(estimatedArrivalUnix);
      const humanizedTime = humanizeTime(date);
      if (progressRef.current) {
        const transferTakingLonger = isWithdraw
          ? t("transfer.withdrawalTakingLonger")
          : t("transfer.depositTakingLonger");

        // DANGER: We update the HTML directly because react-toastify is having issues while handling react state changes
        progressRef.current.textContent =
          date.diff(dayjs(), "seconds") < 1
            ? transferTakingLonger
            : `${t("estimated")} ${displayHumanizedTime({
                humanizedTime,
                t,
              })} ${t("remaining")}`;
      }
    };

    updateTime();

    const intervalId = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [estimatedArrivalUnix, isWithdraw, t]);

  return (
    <div>
      <p className="body2">
        {isWithdraw
          ? t("transfer.amountToChain", { amount, chain: chainPrettyName })
          : t("transfer.amountFromChain", { amount, chain: chainPrettyName })}
      </p>
      <p className="body2 text-osmoverse-300" ref={progressRef}></p>
    </div>
  );
};
