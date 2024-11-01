import { StatusResponse } from "@0xsquid/sdk";
import { Chain } from "@osmosis-labs/types";
import { apiClient, poll } from "@osmosis-labs/utils";

import type {
  BridgeEnvironment,
  BridgeTransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
  TxSnapshot,
} from "../interface";
import { SquidBridgeProvider } from ".";

/** Tracks (polls squid endpoint) and reports status updates on Squid bridge transfers. */
export class SquidTransferStatusProvider implements TransferStatusProvider {
  readonly providerId = SquidBridgeProvider.ID;
  readonly sourceDisplayName = "Squid Bridge";
  public statusReceiverDelegate?: TransferStatusReceiver;

  readonly apiUrl: string;
  readonly squidScanBaseUrl: string;

  constructor(env: BridgeEnvironment, protected readonly chainList: Chain[]) {
    this.apiUrl =
      env === "mainnet"
        ? "https://api.0xsquid.com"
        : "https://testnet.api.squidrouter.com";
    this.squidScanBaseUrl =
      env === "mainnet"
        ? "https://axelarscan.io"
        : "https://testnet.axelarscan.io";
  }

  /** Request to start polling a new transaction. */
  async trackTxStatus(snapshot: TxSnapshot): Promise<void> {
    const {
      sendTxHash,
      fromChain: { chainId: fromChainId },
      toChain: { chainId: toChainId },
    } = snapshot;
    await poll({
      fn: async () => {
        const url = new URL(`${this.apiUrl}/v1/status`);
        url.searchParams.append("transactionId", sendTxHash);
        if (fromChainId) {
          url.searchParams.append("fromChainId", fromChainId.toString());
        }
        if (toChainId) {
          url.searchParams.append("toChainId", toChainId.toString());
        }

        const data = await apiClient<StatusResponse>(url.toString());

        if (!data || !data.id || !data.squidTransactionStatus) {
          return;
        }

        const squidTransactionStatus = data.squidTransactionStatus as
          | "success"
          | "needs_gas"
          | "ongoing"
          | "partial_success"
          | "not_found";

        if (
          squidTransactionStatus === "not_found" ||
          squidTransactionStatus === "ongoing" ||
          squidTransactionStatus === "partial_success"
        ) {
          return;
        }

        return {
          id: sendTxHash,
          status: squidTransactionStatus === "success" ? "success" : "failed",
          reason:
            squidTransactionStatus === "needs_gas"
              ? "insufficientFee"
              : undefined,
        } as BridgeTransferStatus;
      },
      validate: (incomingStatus) => incomingStatus !== undefined,
      interval: 30_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .catch((e) => console.error(`Polling Squid has failed`, e))
      .then((s) => {
        if (s) this.receiveConclusiveStatus(sendTxHash, s);
      });
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
        "Squid transfer finished poll but neither succeeded or failed"
      );
    }
  }

  makeExplorerUrl(snapshot: TxSnapshot): string {
    const {
      sendTxHash,
      fromChain: { chainId: fromChainId },
      toChain: { chainId: toChainId },
    } = snapshot;

    if (typeof fromChainId === "number" || typeof toChainId === "number") {
      // EVM transfer
      return `${this.squidScanBaseUrl}/gmp/${sendTxHash}`;
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
}
