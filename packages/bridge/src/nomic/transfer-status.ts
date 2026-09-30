import { Chain } from "@osmosis-labs/types";
import { getNomicRelayerUrl, isNil, poll } from "@osmosis-labs/utils";

import type {
  BridgeEnvironment,
  BridgeTransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
  TxSnapshot,
} from "../interface";
import { NomicProviderId } from "./utils";

const POLL_INTERVAL_MS = 30_000;

export class NomicTransferStatusProvider implements TransferStatusProvider {
  readonly providerId = NomicProviderId;
  readonly sourceDisplayName = "Nomic Bridge";
  public statusReceiverDelegate?: TransferStatusReceiver;

  constructor(
    protected readonly chainList: Chain[],
    readonly env: BridgeEnvironment
  ) {}

  /** Request to start polling a new transaction. */
  async trackTxStatus(snapshot: TxSnapshot): Promise<void> {
    const { sendTxHash } = snapshot;

    if (!snapshot.nomicCheckpointIndex) {
      throw new Error("Nomic checkpoint index is required. Skipping tracking.");
    }

    // This provider is constructed at app start to resume pending transfers;
    // load nomic-bitcoin (and its bitcoinjs-lib copy) only once one needs tracking.
    // Callers don't await this method, so a rejected import would surface as an
    // unhandled rejection and leave the transfer pending for the session. Retry
    // the load on the polling interval instead.
    let nomic: typeof import("nomic-bitcoin");
    try {
      nomic = await import("nomic-bitcoin");
    } catch (e) {
      console.error("Failed to load nomic-bitcoin, retrying", e);
      setTimeout(() => this.trackTxStatus(snapshot), POLL_INTERVAL_MS);
      return;
    }

    await poll({
      fn: async () => {
        const checkpoint = await nomic.getCheckpoint(
          {
            relayers: getNomicRelayerUrl({ env: this.env }),
            bitcoinNetwork: this.env === "mainnet" ? "bitcoin" : "testnet",
          },
          snapshot.nomicCheckpointIndex!
        );

        if (isNil(checkpoint.txid)) {
          return;
        }

        return {
          id: snapshot.sendTxHash,
          status: "success",
        } as BridgeTransferStatus;
      },
      validate: (incomingStatus) => incomingStatus !== undefined,
      interval: POLL_INTERVAL_MS,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .then((s) => {
        if (s) this.receiveConclusiveStatus(sendTxHash, s);
      })
      .catch((e) => console.error(`Polling Nomic has failed`, e));
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
        "Nomic transfer finished poll but neither succeeded or failed"
      );
    }
  }

  makeExplorerUrl(snapshot: TxSnapshot): string {
    const {
      sendTxHash,
      fromChain: { chainId: fromChainId },
    } = snapshot;

    const chain = this.chainList.find(
      (chain) => chain.chain_id === fromChainId
    );

    // Chain may no longer be in the registry (e.g. a delisted chain in an old
    // saved snapshot). The explorer link is cosmetic, so degrade to no link
    // rather than throwing into the transaction history render path, but keep
    // a breadcrumb so an unexpected missing chain is still visible.
    if (!chain) {
      console.warn(
        `[NomicTransferStatus] Cannot build explorer URL, chain not found: ${fromChainId}`
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
