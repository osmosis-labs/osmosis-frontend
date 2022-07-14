import { ITxStatusReceiver, ITxStatusSource } from "@osmosis-labs/stores";
import { poll } from "../../components/utils";
import { getTransferStatus, TransferStatus } from "./queries";

/** Tracks and reports status updates on Axelar bridge transfers. */
export class AxelarTransferStatusSource implements ITxStatusSource {
  readonly keyPrefix = "axelar";
  readonly sourceDisplayName = "Axlear Bridge";
  public statusReceiverDelegate?: ITxStatusReceiver;

  /** Request to start polling a new transaction. */
  trackTxStatus(txHash: string): void {
    const makeResultedStatus = (status: TransferStatus) =>
      this.makeResultStatusFromTransferStatus(status);
    poll<TransferStatus>({
      fn: () => getTransferStatus(txHash),
      validate: (incomingStatus) =>
        makeResultedStatus(incomingStatus) !== undefined,
      interval: 10_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .then((s) => this.receiveConclusiveStatus(s))
      .catch((e) => console.error("Polling failed", e));

    // initial status re-check before polls reach desired result
    getTransferStatus(txHash).then((result) => {
      const res = this.makeResultStatusFromTransferStatus(result);
      this.statusReceiverDelegate?.receiveNewTxStatus(
        `${this.keyPrefix}${txHash}`,
        res || "pending"
      );
    });
  }

  receiveConclusiveStatus(status: TransferStatus): void {
    const foundTxStatus = this.makeResultStatusFromTransferStatus(status);

    if (foundTxStatus && status.length > 0 && status[0].source !== undefined) {
      this.statusReceiverDelegate?.receiveNewTxStatus(
        this.keyPrefix + status[0].source.id,
        foundTxStatus
      );
    } else {
      console.error("Axelar transfer polled but neither succeeded or failed");
    }
  }

  makeExplorerUrl(key: string): string {
    return `https://axelarscan.io/transfer/${key}`;
  }

  protected makeResultStatusFromTransferStatus(
    transferStatus: TransferStatus
  ): "success" | "failed" | undefined {
    if (transferStatus.length === 0) {
      return;
    }

    const [data] = transferStatus;
    if (
      // any of all complete stages does not return success
      data.source &&
      data.link &&
      data.confirm_deposit &&
      data.ibc_send && // transfer is complete
      (data.source.status !== "success" ||
        data.confirm_deposit.status !== "success" ||
        data.ibc_send.status !== "success")
    ) {
      return "failed";
    } else if (data.ibc_send?.status === "success") {
      // final ibc transfer is successful
      return "success";
    }
  }
}
