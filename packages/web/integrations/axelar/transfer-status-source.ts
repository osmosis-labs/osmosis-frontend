import { ITxStatusReceiver, ITxStatusSource } from "@osmosis-labs/stores";
import { poll } from "../../utils/promise";
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
      interval: 30_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .then((s) => this.receiveConclusiveStatus(s))
      .catch((e) =>
        console.error(`Polling ${this.axelarApiBaseUrl} failed`, e)
      );
  }

  receiveConclusiveStatus(status: TransferStatus): void {
    const foundTxStatus = this.makeResultStatusFromTransferStatus(status);

    if (foundTxStatus && foundTxStatus.id) {
      const { id, status, reason } = foundTxStatus;
      this.statusReceiverDelegate?.receiveNewTxStatus(
        (this.keyPrefix + id).toLowerCase(),
        status,
        reason
      );
    } else {
      console.error(
        "Axelar transfer finished poll but neither succeeded or failed"
      );
    }
  }

  makeExplorerUrl(key: string): string {
    return `${this.axelarScanBaseUrl}/transfer/${key}`;
  }

  /** Looking for conclusive status: success or failure. */
  protected makeResultStatusFromTransferStatus(
    transferStatus: TransferStatus
  ):
    | { id?: string; status: "success" | "failed"; reason?: string }
    | undefined {
    // could be { message: "Internal Server Error" } TODO: display server errors or connection issues to user
    if (
      !Array.isArray(transferStatus) ||
      (Array.isArray(transferStatus) && transferStatus.length === 0)
    ) {
      return;
    }

    const [data] = transferStatus;
    const idWithoutSourceChain = data?.id.split("_")[0].toLowerCase();

    // insufficient fee
    if (data.send && data.send.insufficient_fee) {
      return {
        id: idWithoutSourceChain,
        status: "failed",
        reason: "Insufficient fee",
      };
    }

    if (data.status === "executed") {
      return { id: idWithoutSourceChain, status: "success" };
    }

    if (
      // any of all complete stages does not return success
      data.send &&
      data.link &&
      data.confirm_deposit &&
      data.ibc_send && // transfer is complete
      (data.send.status !== "success" ||
        data.confirm_deposit.status !== "success" ||
        data.ibc_send.status !== "success")
    ) {
      return { id: idWithoutSourceChain, status: "failed" };
    }
  }
}
