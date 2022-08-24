import { ITxStatusReceiver, ITxStatusSource } from "@osmosis-labs/stores";
import { poll } from "../../components/utils";
import { getTransferStatus, TransferStatus } from "./queries";

/** Tracks (polls Axelar endpoint) and reports status updates on Axelar bridge transfers. */
export class AxelarTransferStatusSource implements ITxStatusSource {
  readonly keyPrefix = "axelar";
  readonly sourceDisplayName = "Axlear Bridge";
  public statusReceiverDelegate?: ITxStatusReceiver;

  constructor(
    protected axelarScanBaseUrl = "https://axelarscan.io",
    protected axelarApiBaseUrl = "https://api.axelarscan.io"
  ) {}

  /** Request to start polling a new transaction. */
  trackTxStatus(txHash: string): void {
    const makeResultedStatus = (status: TransferStatus) =>
      this.makeResultStatusFromTransferStatus(status);
    poll<TransferStatus>({
      fn: () => getTransferStatus(txHash, this.axelarApiBaseUrl),
      validate: (incomingStatus) =>
        makeResultedStatus(incomingStatus) !== undefined,
      interval: 20_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .then((s) => this.receiveConclusiveStatus(s))
      .catch((e) =>
        console.error(`Polling ${this.axelarApiBaseUrl} failed`, e)
      );

    // initial status re-check before polls reach desired result
    getTransferStatus(txHash, this.axelarApiBaseUrl).then((result) => {
      const res = this.makeResultStatusFromTransferStatus(result);
      this.statusReceiverDelegate?.receiveNewTxStatus(
        `${this.keyPrefix}${txHash}`,
        res?.status || "pending",
        res?.reason
      );
    });
  }

  receiveConclusiveStatus(status: TransferStatus): void {
    const foundTxStatus = this.makeResultStatusFromTransferStatus(status);

    if (foundTxStatus && status.length > 0 && status[0].source !== undefined) {
      this.statusReceiverDelegate?.receiveNewTxStatus(
        this.keyPrefix + status[0].source.id,
        foundTxStatus.status,
        foundTxStatus.reason
      );
    } else {
      console.error("Axelar transfer polled but neither succeeded or failed");
    }
  }

  makeExplorerUrl(key: string): string {
    return `${this.axelarScanBaseUrl}/transfer/${key}`;
  }

  /** Looking for conclusive status: success or failure. */
  protected makeResultStatusFromTransferStatus(
    transferStatus: TransferStatus
  ): { status: "success" | "failed"; reason?: string } | undefined {
    // could be { message: "Internal Server Error" } TODO: display server errors or connection issues to user
    if (
      !Array.isArray(transferStatus) ||
      (Array.isArray(transferStatus) && transferStatus.length === 0)
    ) {
      return;
    }

    const [data] = transferStatus;

    // insufficient fee
    if (data.source && data.source.insufficient_fee) {
      return { status: "failed", reason: "Insufficient fee" };
    }

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
      return { status: "failed" };
    } else if (data.ibc_send?.status === "success") {
      // final ibc transfer is successful
      return { status: "success" };
    }
  }
}
