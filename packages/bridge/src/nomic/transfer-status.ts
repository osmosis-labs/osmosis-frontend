import { Chain } from "@osmosis-labs/types";
import { getNomicRelayerUrl, isNil, poll } from "@osmosis-labs/utils";
import { getCheckpoint } from "nomic-bitcoin";

import type {
  BridgeEnvironment,
  BridgeTransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
  TxSnapshot,
} from "../interface";
import { NomicProviderId } from "./utils";

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

    await poll({
      fn: async () => {
        const checkpoint = await getCheckpoint(
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
      interval: 30_000,
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

    if (!chain) throw new Error("Chain not found: " + fromChainId);
    if (chain.explorers.length === 0) {
      // attempt to link to mintscan since this is an IBC transfer
      return `https://www.mintscan.io/${chain.chain_name}/txs/${sendTxHash}`;
    }

    return chain.explorers[0].tx_page.replace("{txHash}", sendTxHash);
  }
}
