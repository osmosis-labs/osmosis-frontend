import { Chain } from "@osmosis-labs/types";
import { poll } from "@osmosis-labs/utils";

import type {
  BridgeEnvironment,
  BridgeTransferStatus,
  TransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
  TxSnapshot,
} from "../interface";
import { SkipProviderId } from "./constants";
import { SkipTxStatusResponse } from "./types";

type Transaction = {
  chainID: string;
  txHash: string;
  env: BridgeEnvironment;
};

export interface SkipStatusProvider {
  transactionStatus: ({
    chainID,
    txHash,
    env,
  }: Transaction) => Promise<SkipTxStatusResponse>;
  trackTransaction: ({ chainID, txHash, env }: Transaction) => Promise<void>;
}

/**
 * Maps a Skip status to a transfer status.
 *
 * `STATE_ABANDONED` is not a failure: it means Skip stopped tracking, which
 * it also does when a slow transfer times out while its funds can still
 * arrive or be refunded. It stays pending; only proof of failure resolves
 * it (see `SolanaSignatureCheck` for Solana-signed transfers).
 */
export function toTransferStatus(
  state: SkipTxStatusResponse["state"]
): TransferStatus {
  if (state === "STATE_COMPLETED_SUCCESS") return "success";
  if (state === "STATE_COMPLETED_ERROR") return "failed";
  return "pending";
}

/**
 * Proves the outcome of a Solana signature from the chain, independent of
 * Skip: "failed" (error at confirmed or later) or "dropped" (no record in
 * full history and the blockhash has expired). Anything unproven must come
 * back undefined.
 */
export type SolanaSignatureCheck = (params: {
  signature: string;
  recentBlockhash?: string;
}) => Promise<"confirmed" | "failed" | "dropped" | undefined>;

/** Tracks (polls skip endpoint) and reports status updates on Skip bridge transfers. */
export class SkipTransferStatusProvider implements TransferStatusProvider {
  readonly providerId = SkipProviderId;
  readonly sourceDisplayName = "Skip Bridge";

  statusReceiverDelegate?: TransferStatusReceiver | undefined;

  readonly axelarScanBaseUrl: string;

  constructor(
    protected readonly env: BridgeEnvironment,
    protected readonly chainList: Chain[],
    protected readonly skipStatusProvider: SkipStatusProvider,
    /**
     * Optional. Resolves Solana-signed transfers Skip can't: a tx that never
     * landed is invisible to Skip, so without this it stays pending.
     */
    protected readonly checkSolanaSignature?: SolanaSignatureCheck
  ) {
    this.axelarScanBaseUrl =
      env === "mainnet"
        ? "https://axelarscan.io"
        : "https://testnet.axelarscan.io";
  }

  async trackTxStatus(snapshot: TxSnapshot): Promise<void> {
    const {
      sendTxHash,
      fromChain: { chainId: fromChainId },
    } = snapshot;

    await poll({
      fn: async () => {
        const tx = {
          // a later step of a multi-tx route is signed on an intermediate
          // chain; its status must be polled there, not on the from chain
          chainID: (snapshot.trackingChainId ?? fromChainId).toString(),
          txHash: sendTxHash,
          env: this.env,
        };

        const isSolanaSigned = tx.chainID === "solana";

        // A Solana tx that never landed is invisible to Skip, so check the
        // chain first: it is the only proof of a dropped or failed tx.
        if (isSolanaSigned && this.checkSolanaSignature) {
          const outcome = await this.checkSolanaSignature({
            signature: sendTxHash,
            recentBlockhash: snapshot.solanaRecentBlockhash,
          });
          if (outcome === "failed" || outcome === "dropped") {
            return { id: sendTxHash, status: "failed" as const };
          }
        }

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
          })
          // For a Solana-signed tx, Skip not knowing it yet (or erroring)
          // is not an outcome: keep polling so the chain check above can
          // still resolve it, rather than stopping on the error.
          .catch((error) => {
            if (isSolanaSigned) return undefined;
            throw error;
          });

        return {
          id: sendTxHash,
          status: txStatus ? toTransferStatus(txStatus.state) : "pending",
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
        if (s) this.receiveConclusiveStatus(sendTxHash, s);
      });
  }

  makeExplorerUrl(snapshot: TxSnapshot): string {
    const {
      sendTxHash,
      fromChain: { chainId: fromChainId },
      toChain: { chainId: toChainId },
    } = snapshot;

    // After a multi-tx route advances, sendTxHash is the intermediate
    // chain's (cosmos) tx, even when the transfer originated on an EVM
    // chain: the explorer must be the tracking chain's, or the link would
    // be an AxelarScan GMP URL wrapping a cosmos hash.
    const explorerChainId = snapshot.trackingChainId ?? fromChainId;

    // A Solana-origin transfer's hash is a Solana signature until (for a
    // multi-tx route) it advances onto the intermediate chain. Solana isn't
    // in the cosmos chain list, so it needs its own explorer.
    if (explorerChainId === "solana") {
      return `https://solscan.io/tx/${sendTxHash}`;
    }

    if (
      snapshot.trackingChainId === undefined &&
      (typeof fromChainId === "number" || typeof toChainId === "number")
    ) {
      // EVM transfer
      return `${this.axelarScanBaseUrl}/gmp/${sendTxHash}`;
    } else {
      const chain = this.chainList.find(
        (chain) => chain.chain_id === explorerChainId
      );

      // Chain may no longer be in the registry (e.g. a delisted chain in an
      // old saved snapshot). The explorer link is cosmetic, so degrade to no
      // link rather than throwing into the transaction history render path,
      // but keep a breadcrumb so an unexpected missing chain is still visible.
      if (!chain) {
        console.warn(
          `[SkipTransferStatus] Cannot build explorer URL, chain not found: ${explorerChainId}`
        );
        return "";
      }

      if (chain.explorers.length === 0) {
        // attempt to link to mintscan since this is an IBC transfer
        return `https://www.mintscan.io/${chain.chain_name}/txs/${sendTxHash}`;
      }

      return chain.explorers[0].txPage.replace("{txHash}", sendTxHash);
    }
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
        "Skip transfer finished poll but neither succeeded or failed"
      );
    }
  }
}
