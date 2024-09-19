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
import { SkipBridgeProvider } from "./index";
import { SkipTxStatusResponse } from "./types";

type Transaction = {
  chainID: string;
  txHash: string;
  env: BridgeEnvironment;
};

export type SkipStatusProvider = {
  transactionStatus: ({
    chainID,
    txHash,
    env,
  }: Transaction) => Promise<SkipTxStatusResponse>;
  trackTransaction: ({
    chainID,
    txHash,
    env,
  }: Transaction) => Promise<Promise<void>>;
};

/** Tracks (polls skip endpoint) and reports status updates on Skip bridge transfers. */
export class SkipTransferStatusProvider implements TransferStatusProvider {
  readonly keyPrefix = SkipBridgeProvider.ID;
  readonly sourceDisplayName = "Skip Bridge";

  statusReceiverDelegate?: TransferStatusReceiver | undefined;

  readonly axelarScanBaseUrl: string;

  constructor(
    protected readonly env: BridgeEnvironment,
    protected readonly chainList: Chain[],
    protected readonly skipStatusProvider: SkipStatusProvider
  ) {
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
        const tx = {
          chainID: fromChainId.toString(),
          txHash: sendTxHash,
          env: this.env,
        };

        const txStatus = await this.skipStatusProvider
          .transactionStatus(tx)
          .catch(async (error) => {
            if (error instanceof Error && error.message.includes("not found")) {
              // if we get an error that it's not found, prompt skip to track it first
              // then try again
              await this.skipStatusProvider.trackTransaction(tx);
              return this.skipStatusProvider.transactionStatus(tx);
            }

            throw error;
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
