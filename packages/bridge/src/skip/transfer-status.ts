import { poll } from "@osmosis-labs/utils";

import type {
  BridgeEnvironment,
  BridgeTransferStatus,
  GetTransferStatusParams,
  TransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
} from "../interface";
import { skipProviderId } from ".";
import { SkipApiClient } from "./queries";

/** Tracks (polls skip endpoint) and reports status updates on Skip bridge transfers. */
export class SkipTransferStatusProvider implements TransferStatusProvider {
  readonly keyPrefix = skipProviderId;
  readonly sourceDisplayName = "Skip Bridge";

  statusReceiverDelegate?: TransferStatusReceiver;

  readonly skipClient: SkipApiClient;
  readonly axelarScanBaseUrl: string;

  constructor(env: BridgeEnvironment) {
    this.skipClient = new SkipApiClient();

    this.axelarScanBaseUrl =
      env === "mainnet"
        ? "https://axelarscan.io"
        : "https://testnet.axelarscan.io";
  }

  trackTxStatus(serializedParams: string): void {
    const { sendTxHash, fromChainId } = JSON.parse(
      serializedParams
    ) as GetTransferStatusParams;

    const snapshotKey = `${this.keyPrefix}${serializedParams}`;

    poll({
      fn: async () => {
        try {
          const txStatus = await this.skipClient.transactionStatus({
            chainID: fromChainId.toString(),
            txHash: sendTxHash,
          });

          let status: TransferStatus = "pending";
          if (txStatus.state === "STATE_COMPLETED_SUCCESS") {
            status = "success";
          }

          if (txStatus.state === "STATE_COMPLETED_ERROR") {
            status = "failed";
          }

          return {
            id: sendTxHash,
            status,
          };
        } catch (error: any) {
          if ("message" in error) {
            if (error.message.includes("not found")) {
              await this.skipClient.trackTransaction({
                chainID: fromChainId.toString(),
                txHash: sendTxHash,
              });

              return undefined;
            }
          }

          throw error;
        }
      },
      validate: (incomingStatus) => {
        if (!incomingStatus) {
          return false;
        }

        return incomingStatus.status !== "pending";
      },
      interval: 30_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .catch((e) => console.error(`Polling Skip has failed`, e))
      .then((s) => {
        if (s) this.receiveConclusiveStatus(snapshotKey, s);
      });
  }

  makeExplorerUrl(serializedParams: string): string {
    const { sendTxHash } = JSON.parse(
      serializedParams
    ) as GetTransferStatusParams;

    return `${this.axelarScanBaseUrl}/gmp/${sendTxHash}`;
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
        "Skip transfer finished poll but neither succeeded or failed"
      );
    }
  }
}
