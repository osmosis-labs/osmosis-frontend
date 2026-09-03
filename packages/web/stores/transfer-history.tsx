import { KVStore } from "@keplr-wallet/common";
import {
  TransferFailureReason,
  TransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
  TxSnapshot,
} from "@osmosis-labs/bridge";
import { CoinPretty, Dec } from "@osmosis-labs/unit";
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
import { FunctionComponent, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import { displayToast, ToastType } from "~/components/alert";
import { RadialProgress } from "~/components/radial-progress";
import { EntityImage } from "~/components/ui/entity-image";
import { useTranslation } from "~/hooks";
import { displayHumanizedTime, humanizeTime } from "~/utils/date";
import { formatPretty } from "~/utils/formatter";
import { getChainBalance, waitForSkipStepArrival } from "~/utils/multi-tx";

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
        // makeExplorerUrl already returns "" when it can't resolve a link
        // (e.g. the tx's chain is no longer in the registry). This try/catch
        // is a render-safety backstop: an explorer URL is cosmetic, so any
        // unexpected throw from a status provider must not escape this computed
        // and crash the transaction history / portfolio page. Fall back to an
        // empty URL, which the UI renders as "no explorer link".
        let explorerUrl = "";
        try {
          explorerUrl = statusSource.makeExplorerUrl(snapshot);
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
   * The final step of a multi-tx route was signed: clear the pending step,
   * key the entry on the final step's tx hash, and hand status tracking to
   * the provider (polling on the intermediate chain the step was signed on).
   */
  @action
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
    const snapshot = this.snapshots.find(
      (snapshot) => snapshot.sendTxHash === prevSendTxHash
    );
    if (!snapshot) {
      console.error("Couldn't find tx snapshot when advancing multi-tx step");
      return;
    }

    // the pending toast is keyed on the first step's hash; dismiss it since
    // further updates are keyed on the final step's hash
    toast.dismiss(prevSendTxHash);

    snapshot.pendingStep = undefined;
    snapshot.sendTxHash = finalSendTxHash;
    snapshot.trackingChainId = trackingChainId;
    snapshot.estimatedArrivalUnix = estimatedArrivalUnix;
    snapshot.status = "pending";

    const statusSource = this.transferStatusProviders.find((source) =>
      snapshot.provider.startsWith(source.providerId)
    );
    statusSource?.trackTxStatus(toJS(snapshot));
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

  /**
   * A mid-flow multi-tx entry whose expected funds are no longer on the
   * intermediate account must stop offering Continue: signing again could
   * spend unrelated funds. It must NOT be handed to first-leg tracking
   * either — tx1 success only proves arrival on the intermediate chain, so
   * tracking it would report a completed deposit that may never have
   * reached the destination. The entry keeps its pending step, marked
   * stale, and expires with the snapshot.
   */
  @action
  markPendingStepStale(sendTxHash: string) {
    const snapshot = this.snapshots.find(
      (snapshot) => snapshot.sendTxHash === sendTxHash
    );
    if (!snapshot?.pendingStep) return;

    snapshot.pendingStep.stale = true;
  }

  /**
   * Background self-heal for a restored mid-flow multi-tx entry: when the
   * first leg has arrived but the expected funds are no longer on the
   * intermediate account (on top of what it held before the first tx), the
   * final step was almost certainly signed elsewhere, so mark the entry
   * stale instead of leaving a Continue that could double-sign. Only acts
   * on definitive signals; any unreadable state leaves the entry untouched.
   */
  protected async validatePendingStep(snapshot: TxSnapshot) {
    const { pendingStep } = snapshot;
    if (
      !pendingStep?.expectedArrival ||
      !pendingStep.intermediateAddress ||
      pendingStep.preArrivalBalance === undefined ||
      pendingStep.stale
    )
      return;

    const arrival = await waitForSkipStepArrival({
      chainId: String(snapshot.fromChain.chainId),
      txHash: pendingStep.priorStepTxHash,
      maxAttempts: 1,
    });
    if (arrival !== "success") return;

    const balance = await getChainBalance({
      chainId: pendingStep.chainId,
      address: pendingStep.intermediateAddress,
      denom: pendingStep.expectedArrival.denom,
    });
    if (balance === undefined) return;

    const required =
      BigInt(pendingStep.expectedArrival.amount) +
      BigInt(pendingStep.preArrivalBalance);
    if (balance < required) {
      this.markPendingStepStale(snapshot.sendTxHash);
    }
  }

  /** Use persisted tx snapshots to resume Tx monitoring after browser first loads.
   *  Removes expired snapshots.
   */
  protected async restoreSnapshots() {
    const storedSnapshots =
      (await this.kvStore.get<TxSnapshot[]>(TRANSFER_HISTORY_STORE_KEY)) ?? [];

    storedSnapshots.forEach(async (snapshot) => {
      const statusSource = this.transferStatusProviders.find((source) =>
        snapshot.provider.startsWith(source.providerId)
      );

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
      } else if (snapshot.status === "pending" && snapshot.pendingStep) {
        // fire-and-forget: resolves the entry if its step was completed
        // from another session, so a stale Continue isn't offered
        this.validatePendingStep(snapshot).catch(() => undefined);
      } else if (
        snapshot.status !== "pending" &&
        snapshot.status !== "connection-error"
      ) {
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
