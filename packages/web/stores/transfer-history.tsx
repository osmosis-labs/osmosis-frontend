import { KVStore } from "@keplr-wallet/common";
import {
  TransferFailureReason,
  TransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
} from "@osmosis-labs/bridge";
import dayjs from "dayjs";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { computedFn } from "mobx-utils";
import Image from "next/image";
import { FunctionComponent, useEffect, useRef } from "react";

import { displayToast, ToastType } from "~/components/alert";
import { RadialProgress } from "~/components/radial-progress";
import { useTranslation } from "~/hooks";
import { humanizeTime } from "~/utils/date";

/** Persistable data enough to identify a tx. */
type TxSnapshot = {
  /** From Date.getTime(). Assumed local timezone. */
  createdAtMs: number;
  prefixedKey: string;
  amount: string;
  startTimeUnix: number;
  amountLogo: string | undefined;
  status: TransferStatus;
  estimatedArrivalUnix: number | undefined;
  chainPrettyName: string;
  reason?: TransferFailureReason;
  isWithdraw: boolean;
  accountAddress: string;
};

const STORE_KEY = "nonibc_history_tx_snapshots";

/**
 * Stores and tracks status for bridge transfers.
 * NOTE: source keyPrefix values must be unique.
 */
export class TransferHistoryStore implements TransferStatusReceiver {
  /** Volatile store of tx statuses. `prefixedKey => TxSnapshot` */
  @observable
  protected snapshots: TxSnapshot[] = [];
  @observable
  private isRestoredFromLocalStorage = false;

  /**
   * Since we can't control how many times a status provider
   * will call `receiveNewTxStatus`, we need to track which
   * tx statuses have already been resolved to avoid duplicity in UI.
   */
  private readonly _resolvedTxStatusKeys = new Set<string>();

  constructor(
    protected readonly onAccountTransferSuccess: (
      accountAddress: string
    ) => void,
    protected readonly kvStore: KVStore,
    protected readonly transferStatusProviders: TransferStatusProvider[] = [],
    protected readonly historyExpireDays = 3
  ) {
    this.transferStatusProviders.forEach(
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

  getHistoriesByAccount = computedFn((accountAddress: string) => {
    const histories: {
      key: string;
      createdAt: Date;
      sourceName?: string;
      status: TransferStatus;
      amount: string;
      reason?: TransferFailureReason;
      explorerUrl: string;
      isWithdraw: boolean;
    }[] = [];
    this.snapshots.forEach((snapshot) => {
      const statusSource = this.transferStatusProviders.find((source) =>
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
   * @param chainPrettyName The pretty name of the chain.
   * @param estimatedArrivalUnix The estimated arrival time in Unix timestamp.
   * @param amountLogo The logo URL of the amount's currency.
   */
  @action
  pushTxNow({
    prefixedKey,
    amount,
    isWithdraw,
    accountAddress,
    chainPrettyName,
    estimatedArrivalUnix,
    amountLogo,
  }: {
    prefixedKey: string;
    amount: string;
    amountLogo: string | undefined;
    estimatedArrivalUnix: number | undefined;
    chainPrettyName: string;
    isWithdraw: boolean;
    accountAddress: string;
  }) {
    const statusSource = this.transferStatusProviders.find((source) =>
      prefixedKey.startsWith(source.keyPrefix)
    );

    // start tracking for life of current session
    statusSource?.trackTxStatus(
      prefixedKey.slice(statusSource.keyPrefix.length)
    );

    const startTimeUnix = Date.now() / 1000;

    setTimeout(() => {
      displayToast(
        {
          titleTranslationKey: isWithdraw
            ? "transfer.pendingWithdraw"
            : "transfer.pendingDeposit",
          iconElement:
            amountLogo && estimatedArrivalUnix ? (
              <PendingTransferLoadingIcon
                estimatedArrivalUnix={estimatedArrivalUnix}
                assetLogo={amountLogo}
                startTimeUnix={startTimeUnix}
              />
            ) : undefined,
          captionElement: (
            <PendingTransfer
              amount={amount}
              chainPrettyName={chainPrettyName}
              isWithdraw={isWithdraw}
              estimatedArrivalUnix={estimatedArrivalUnix}
            />
          ),
        },
        ToastType.LOADING,
        { toastId: prefixedKey, autoClose: false }
      );
    }, 1000);

    this.snapshots.push({
      createdAtMs: Date.now(),
      prefixedKey,
      amount,
      status: "pending",
      isWithdraw,
      accountAddress,
      chainPrettyName,
      estimatedArrivalUnix,
      amountLogo,
      startTimeUnix,
    });
  }

  /**
   * Forward tx info the relevant status source to start tracking the transfer status
   * of an initiated transfer.
   */
  @action
  receiveNewTxStatus(
    prefixedKey: string,
    status: TransferStatus,
    reason: TransferFailureReason | undefined
  ) {
    const snapshot = this.snapshots.find(
      (snapshot) => snapshot.prefixedKey === prefixedKey
    );

    if (!snapshot) {
      console.error("Couldn't find tx snapshot when receiving tx status");
      return;
    }

    // set updates
    snapshot.status = status;
    snapshot.reason = reason;

    switch (status) {
      case "pending":
        displayToast(
          {
            titleTranslationKey: snapshot.isWithdraw
              ? "transfer.pendingWithdraw"
              : "transfer.pendingDeposit",
            iconElement:
              snapshot.amountLogo && snapshot.estimatedArrivalUnix ? (
                <PendingTransferLoadingIcon
                  estimatedArrivalUnix={snapshot.estimatedArrivalUnix}
                  assetLogo={snapshot.amountLogo}
                  startTimeUnix={snapshot.startTimeUnix}
                />
              ) : undefined,
            captionElement: (
              <PendingTransfer
                amount={snapshot.amount}
                chainPrettyName={snapshot.chainPrettyName}
                isWithdraw={snapshot.isWithdraw}
                estimatedArrivalUnix={snapshot.estimatedArrivalUnix}
              />
            ),
          },
          ToastType.LOADING,
          { updateToastId: prefixedKey, autoClose: false }
        );
        break;
      case "success":
        if (this._resolvedTxStatusKeys.has(prefixedKey)) break;
        displayToast(
          {
            titleTranslationKey: snapshot.isWithdraw
              ? "transfer.completedWithdraw"
              : "transfer.completedDeposit",
            captionTranslationKey: snapshot.isWithdraw
              ? [
                  "transfer.amountToChain",
                  { amount: snapshot.amount, chain: snapshot.chainPrettyName },
                ]
              : [
                  "transfer.amountFromChain",
                  { amount: snapshot.amount, chain: snapshot.chainPrettyName },
                ],
          },
          ToastType.SUCCESS,
          { updateToastId: prefixedKey }
        );
        this.onAccountTransferSuccess(snapshot.accountAddress);
        this._resolvedTxStatusKeys.add(prefixedKey);
        break;
      case "failed":
        if (this._resolvedTxStatusKeys.has(prefixedKey)) break;
        displayToast(
          {
            titleTranslationKey: snapshot.isWithdraw
              ? "transfer.failedWithdraw"
              : "transfer.failedDeposit",
            captionTranslationKey: [
              "transfer.amountFailedToWithdraw",
              { amount: snapshot.amount },
            ],
          },
          ToastType.ERROR,
          { updateToastId: prefixedKey }
        );
        this._resolvedTxStatusKeys.add(prefixedKey);
        break;
      case "connection-error":
        if (this._resolvedTxStatusKeys.has(prefixedKey)) break;
        displayToast(
          {
            titleTranslationKey: "transfer.connectionError",
            captionTranslationKey: [
              "transfer.amountFailedToWithdraw",
              { amount: snapshot.amount },
            ],
          },
          ToastType.ERROR,
          { updateToastId: prefixedKey }
        );
        this._resolvedTxStatusKeys.add(prefixedKey);
        break;
    }
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
      const statusSource = this.transferStatusProviders.find((source) =>
        snapshot.prefixedKey.startsWith(source.keyPrefix)
      );

      // start receiving tx status updates again for snapshots that were still pending
      if (snapshot.status === "pending" && statusSource) {
        statusSource.trackTxStatus(
          snapshot.prefixedKey.slice(statusSource.keyPrefix.length)
        );
      } else {
        this._resolvedTxStatusKeys.add(snapshot.prefixedKey);
      }

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
        const offset = (progressPercentage / 100) * circumference;

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
      <Image src={assetLogo} width={32} height={32} alt="Asset image" />
      <div className="absolute inset-0" ref={progressRef}>
        <RadialProgress progress={100} strokeWidth={2} />
      </div>
    </div>
  );
};

const PendingTransfer: FunctionComponent<{
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
      const humanizedTime = humanizeTime(dayjs.unix(estimatedArrivalUnix));
      if (progressRef.current) {
        // DANGER: We update the HTML directly because react-toastify is having issues while handling react state changes
        progressRef.current.textContent = `${t("estimated")} ${
          humanizedTime.value
        } ${t(humanizedTime.unitTranslationKey)} ${t("remaining")}`;
      }
    };

    updateTime();

    const intervalId = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [estimatedArrivalUnix, t]);

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
