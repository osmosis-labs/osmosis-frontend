import { poll } from "@osmosis-labs/utils";

import type {
  BridgeEnvironment,
  BridgeTransferStatus,
  GetTransferStatusParams,
  TransferStatusProvider,
  TransferStatusReceiver,
} from "../interface";
import { AxelarBridgeProvider } from ".";
import { getTransferStatus } from "./queries";

/** Tracks (polls Axelar endpoint) and reports status updates on Axelar bridge transfers. */
export class AxelarTransferStatusProvider implements TransferStatusProvider {
  readonly keyPrefix = AxelarBridgeProvider.ID;
  readonly sourceDisplayName = "Axelar Bridge";
  public statusReceiverDelegate?: TransferStatusReceiver;

  readonly axelarScanBaseUrl: string;
  readonly axelarApiBaseUrl: string;

  constructor(readonly env: BridgeEnvironment) {
    this.axelarScanBaseUrl =
      env === "mainnet"
        ? "https://axelarscan.io"
        : "https://testnet.axelarscan.io";
    this.axelarApiBaseUrl =
      env === "mainnet"
        ? "https://api.axelarscan.io"
        : "https://testnet.api.axelarscan.io";
  }

  /** Request to start polling a new transaction. */
  async trackTxStatus(serializedParamsOrHash: string): Promise<void> {
    const sendTxHash = serializedParamsOrHash.startsWith("{")
      ? (JSON.parse(serializedParamsOrHash) as GetTransferStatusParams)
          .sendTxHash
      : serializedParamsOrHash;

    const snapshotKey = `${this.keyPrefix}${serializedParamsOrHash}`;

    await poll({
      fn: async () => {
        const transferStatus = await getTransferStatus(
          sendTxHash,
          this.axelarApiBaseUrl
        );

        // could be { message: "Internal Server Error" } TODO: display server errors or connection issues to user
        if (
          !Array.isArray(transferStatus) ||
          (Array.isArray(transferStatus) && transferStatus.length === 0)
        ) {
          return;
        }

        try {
          const [data] = transferStatus;
          const idWithoutSourceChain =
            data.type && data.type === "wrap" && data.wrap
              ? data.wrap.tx_hash
              : data?.id.split("_")[0].toLowerCase();

          // insufficient fee
          if (data.send && data.send.insufficient_fee) {
            return {
              id: idWithoutSourceChain,
              status: "failed",
              reason: "insufficientFee",
            } as BridgeTransferStatus;
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
            return {
              id: idWithoutSourceChain,
              status: "failed",
            } as BridgeTransferStatus;
          }

          if (data.status === "executed") {
            return {
              id: idWithoutSourceChain,
              status: "success",
            } as BridgeTransferStatus;
          }
        } catch {
          return undefined;
        }
      },
      validate: (incomingStatus) => incomingStatus !== undefined,
      interval: 30_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .then((s) => {
        if (s) this.receiveConclusiveStatus(snapshotKey, s);
      })
      .catch((e) => console.error(`Polling Axelar has failed`, e));
  }

  receiveConclusiveStatus(
    key: string,
    txStatus: BridgeTransferStatus | undefined
  ): void {
    if (txStatus && txStatus.id) {
      const { status, reason } = txStatus;
      this.statusReceiverDelegate?.receiveNewTxStatus(key, status, reason);
    } else {
      console.error(
        "Axelar transfer finished poll but neither succeeded or failed"
      );
    }
  }

  makeExplorerUrl(serializedParamsOrKey: string): string {
    const txHash = serializedParamsOrKey.startsWith("{")
      ? (JSON.parse(serializedParamsOrKey) as GetTransferStatusParams)
          .sendTxHash
      : serializedParamsOrKey;
    return `${this.axelarScanBaseUrl}/transfer/${txHash}`;
  }
}
