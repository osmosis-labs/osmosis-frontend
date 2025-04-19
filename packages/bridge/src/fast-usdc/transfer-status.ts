import { Chain } from "@osmosis-labs/types";
import { poll } from "@osmosis-labs/utils";
import { apiClient } from "@osmosis-labs/utils";

import type {
  BridgeEnvironment,
  BridgeTransferStatus,
  TransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
  TxSnapshot,
} from "../interface";
import { AGORIC_API_URL } from "./client";
import { FastUsdcBridgeProvider } from "./index";

/** Tracks and reports status updates on Fast USDC transfers. */
export class FastUsdcTransferStatusProvider implements TransferStatusProvider {
  readonly providerId = FastUsdcBridgeProvider.ID;
  readonly sourceDisplayName = "Fast USDC";

  statusReceiverDelegate?: TransferStatusReceiver | undefined;

  constructor(
    protected readonly env: BridgeEnvironment,
    protected readonly chainList: Chain[]
  ) {}

  async trackTxStatus(snapshot: TxSnapshot): Promise<void> {
    const { sendTxHash } = snapshot;

    await poll({
      fn: async () => {
        const rawData = await apiClient<{ value: string }>(
          `${AGORIC_API_URL}/agoric/vstorage/data/published.fastUsdc.txns.${sendTxHash}`
        );
        if (!rawData?.value) {
          return { id: sendTxHash, status: "pending" as TransferStatus };
        }
        const nestedValue = JSON.parse(rawData.value);
        const latestValue = nestedValue?.values?.at(-1);
        if (!latestValue)
          throw new Error(
            "Could not find latest value in fast usdc txn response"
          );
        const parsedBody = JSON.parse(JSON.parse(latestValue).body.slice(1));
        const status = parsedBody.status;
        let transferStatus: TransferStatus = "pending";

        if (["DISBURSED", "ADVANCED", "FORWARDED"].includes(status)) {
          transferStatus = "success";
        } else if (["FORWARD_FAILED"].includes(status)) {
          transferStatus = "failed";
        }

        return {
          id: sendTxHash,
          status: transferStatus,
        };
      },
      validate: (incomingStatus) => {
        if (!incomingStatus) {
          return false;
        }

        return incomingStatus.status !== "pending";
      },
      interval: 4_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .catch((e) => console.error(`Polling Fast USDC has failed`, e))
      .then((s) => {
        if (s) this.receiveConclusiveStatus(sendTxHash, s);
      });
  }

  makeExplorerUrl(_snapshot: TxSnapshot): string {
    return "";
  }

  receiveConclusiveStatus(
    sendTxHash: string,
    txStatus: BridgeTransferStatus | undefined
  ): void {
    if (txStatus && txStatus.id) {
      const { status, reason } = txStatus;
      this.statusReceiverDelegate?.receiveNewTxStatus(
        sendTxHash,
        status,
        reason
      );
    } else {
      console.error(
        "Fast USDC transfer finished poll but neither succeeded or failed"
      );
    }
  }
}
