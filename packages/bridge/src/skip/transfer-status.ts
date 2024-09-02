import { Chain } from "@osmosis-labs/types";
import { poll } from "@osmosis-labs/utils";

import type {
  BridgeEnvironment,
  BridgeTransferStatus,
  GetTransferStatusParams,
  TransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
} from "../interface";
import { SkipApiClient } from "./client";
import { SkipBridgeProvider } from "./index";

/** Tracks (polls skip endpoint) and reports status updates on Skip bridge transfers. */
export class SkipTransferStatusProvider implements TransferStatusProvider {
  readonly keyPrefix = SkipBridgeProvider.ID;
  readonly sourceDisplayName = "Skip Bridge";

  statusReceiverDelegate?: TransferStatusReceiver | undefined;

  readonly skipClient: SkipApiClient;
  readonly axelarScanBaseUrl: string;

  constructor(env: BridgeEnvironment, protected readonly chainList: Chain[]) {
    this.skipClient = new SkipApiClient(env);

    this.axelarScanBaseUrl =
      env === "mainnet"
        ? "https://axelarscan.io"
        : "https://testnet.axelarscan.io";
  }

  async trackTxStatus(serializedParams: string): Promise<void> {
    const { sendTxHash, fromChainId } = JSON.parse(
      serializedParams
    ) as GetTransferStatusParams;

    const snapshotKey = `${this.keyPrefix}${serializedParams}`;

    await poll({
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
    const { sendTxHash, fromChainId, toChainId } = JSON.parse(
      serializedParams
    ) as GetTransferStatusParams;

    if (typeof fromChainId === "number" || typeof toChainId === "number") {
      // EVM transfer
      return `${this.axelarScanBaseUrl}/gmp/${sendTxHash}`;
    } else {
      const chain = this.chainList.find(
        (chain) => chain.chain_id === fromChainId
      );

      if (!chain) throw new Error("Chain not found: " + fromChainId);

      if (chain.explorers.length === 0) {
        // attempt to link to mintscan since this is an IBC transfer
        return `https://www.mintscan.io/${chain.chain_name}/txs/${sendTxHash}`;
      }

      return chain.explorers[0].tx_page.replace("{txHash}", sendTxHash);
    }
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
