import { KVStore } from "@keplr-wallet/common";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import {
  TransferFailureReason,
  TransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
  TxSnapshot,
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

export const TRANSFER_HISTORY_STORE_KEY = "transfer_history";

/**
 * Stores and tracks status for bridge transfers.
 * NOTE: source keyPrefix values must be unique.
 */
export class TransferHistoryStore implements TransferStatusReceiver {
  /** Volatile store of tx statuses. `prefixedKey => TxSnapshot` */
  @observable
  protected snapshots: TxSnapshot[] = [];
  @observable
  private isRestoredFromIndexedDB = false;

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
      if (this.isRestoredFromIndexedDB) {
        this.kvStore.set(TRANSFER_HISTORY_STORE_KEY, toJS(this.snapshots));
      }
    });

    this.restoreSnapshots();
  }

  getHistoriesByAccount = computedFn((accountAddress: string) => {
    const histories: (TxSnapshot & {
      createdAt: Date;
      providerName?: string;
      status: TransferStatus;
      explorerUrl: string;
    })[] = [];
    this.snapshots.forEach((snapshot) => {
      const statusSource = this.transferStatusProviders.find((source) =>
        snapshot.provider.startsWith(source.providerId)
      );
      if (statusSource && snapshot.osmoBech32Address === accountAddress) {
        histories.push({
          ...snapshot,
          sendTxHash: snapshot.sendTxHash,
          createdAt: new Date(snapshot.createdAtUnix * 1000),
          providerName: statusSource.sourceDisplayName,
          explorerUrl: statusSource.makeExplorerUrl(snapshot),
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
  pushTxNow(snapshot: TxSnapshot) {
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
    const statusSource = this.transferStatusProviders.find((source) =>
      snapshot.provider.startsWith(source.providerId)
    );

    // start tracking for life of current session
    statusSource?.trackTxStatus(snapshot);

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
              amount={new CoinPretty(
                {
                  coinDecimals: fromAsset.decimals,
                  coinMinimalDenom: fromAsset.address,
                  coinDenom: fromAsset.denom,
                },
                new Dec(fromAsset.amount)
              ).toString()}
              chainPrettyName={
                direction === "deposit"
                  ? fromChain?.prettyName ?? ""
                  : toChain?.prettyName ?? ""
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

    this.snapshots.push(snapshot);
  }

  /**
   * Forward tx info the relevant status source to start tracking the transfer status
   * of an initiated transfer.
   */
  @action
  async receiveNewTxStatus(
    sendTxHash: string,
    status: TransferStatus,
    reason: TransferFailureReason | undefined
  ) {
    const snapshot = this.snapshots.find(
      (snapshot) => snapshot.sendTxHash === sendTxHash
    );

    console.log(snapshot);

    if (!snapshot) {
      console.error("Couldn't find tx snapshot when receiving tx status");
      return;
    }

    const {
      direction,
      toAsset,
      fromAsset,
      createdAtUnix,
      estimatedArrivalUnix,
      fromChain,
      toChain,
      osmoBech32Address,
    } = snapshot;

    // set updates
    snapshot.status = status;
    snapshot.reason = reason;

    const amountLogo =
      direction === "withdraw" ? toAsset?.imageUrl : fromAsset.imageUrl;
    const amount = new CoinPretty(
      {
        coinDecimals: fromAsset.decimals,
        coinMinimalDenom: fromAsset.address,
        coinDenom: fromAsset.denom,
      },
      new Dec(fromAsset.amount)
    ).toString();

    const chainPrettyName =
      direction === "deposit"
        ? fromChain?.prettyName ?? ""
        : toChain?.prettyName ?? "";

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
        if (this._resolvedTxStatusKeys.has(sendTxHash)) break;
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
        this.onAccountTransferSuccess(osmoBech32Address);
        this._resolvedTxStatusKeys.add(sendTxHash);
        break;
      case "failed":
        if (this._resolvedTxStatusKeys.has(sendTxHash)) break;
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
        if (this._resolvedTxStatusKeys.has(sendTxHash)) break;
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

  /** Use persisted tx snapshots to resume Tx monitoring after browser first loads.
   *  Removes expired snapshots.
   */
  protected async restoreSnapshots() {
    const storedSnapshots =
      (await this.kvStore.get<TxSnapshot[]>(TRANSFER_HISTORY_STORE_KEY)) ?? [];

    storedSnapshots.forEach(async (snapshot) => {
      if (this.isSnapshotExpired(snapshot)) {
        return;
      }
      const statusSource = this.transferStatusProviders.find((source) =>
        snapshot.provider.startsWith(source.providerId)
      );

      // start receiving tx status updates again for snapshots that were still pending
      if (
        (snapshot.status === "pending" ||
          snapshot.status === "connection-error") &&
        statusSource
      ) {
        statusSource.trackTxStatus(snapshot);
      } else {
        this._resolvedTxStatusKeys.add(snapshot.sendTxHash);
      }

      runInAction(() => {
        this.snapshots.push(snapshot);
      });
    });

    runInAction(() => {
      this.isRestoredFromIndexedDB = true;
    });
  }

  protected isSnapshotExpired(snapshot: TxSnapshot): boolean {
    const expiryMs = this.historyExpireDays * 86_400_00;
    return Date.now() - snapshot.createdAtUnix * 1000 > expiryMs;
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
      <Image src={assetLogo} width={32} height={32} alt="Asset image" />
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
        // DANGER: We update the HTML directly because react-toastify is having issues while handling react state changes
        progressRef.current.textContent =
          date.diff(dayjs(), "seconds") < 5
            ? t("aboutSecondsRemaining", {
                seconds: "5 " + t("timeUnits.seconds"),
              })
            : `${t("estimated")} ${humanizedTime.value} ${t(
                humanizedTime.unitTranslationKey
              )} ${t("remaining")}`;
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
