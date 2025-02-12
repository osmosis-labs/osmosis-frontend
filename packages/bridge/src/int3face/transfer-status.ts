import { Chain } from "@osmosis-labs/types";
import { poll } from "@osmosis-labs/utils";

import type {
  BridgeEnvironment,
  BridgeTransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
  TxSnapshot,
} from "../interface";
import { getTransferStatus, Int3faceTransferStatus } from "./queries";
import { Int3faceProviderId } from "./utils";

export class Int3faceTransferStatusProvider implements TransferStatusProvider {
  readonly providerId = Int3faceProviderId;
  readonly sourceDisplayName = "Int3face Bridge";
  public statusReceiverDelegate?: TransferStatusReceiver;

  constructor(
    protected readonly chainList: Chain[],
    readonly env: BridgeEnvironment
  ) {}

  /** Request to start polling a new transaction. */
  async trackTxStatus(snapshot: TxSnapshot): Promise<void> {
    const { sendTxHash } = snapshot;

    await poll({
      fn: async () => {
        const data = await getTransferStatus(sendTxHash, this.env)
        let status;

        if (!data) {
          status = 'connection-error'
        } else if ([Int3faceTransferStatus.TRANSACTION_STATUS_FAILED, Int3faceTransferStatus.TRANSACTION_STATUS_UNSPECIFIED].includes(data.status)) {
          status = 'failed'
        } else if (data.status === Int3faceTransferStatus.TRANSACTION_STATUS_PENDING) {
          status = 'pending'
        } else if (data.status === Int3faceTransferStatus.TRANSACTION_STATUS_FINALIZED) {
          status = 'success'
        }

        return {
          id: snapshot.sendTxHash,
          status,
        } as BridgeTransferStatus;

      },
      validate: (incomingStatus) => incomingStatus !== undefined,
      interval: 30_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .then((s) => {
        if (s) this.receiveConclusiveStatus(sendTxHash, s);
      })
      .catch((e) => console.error(`Polling Int3face has failed`, e));
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
        "Int3face transfer finished poll but neither succeeded or failed"
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

    // Todo: add testnet also after running locally

    if (!chain) throw new Error("Chain not found: " + fromChainId);
    if (chain.explorers.length === 0) {
      return `https://sochain.com/tx/DOGE/${sendTxHash}`;
    }

    return chain.explorers[0].tx_page.replace("{txHash}", sendTxHash);
  }
}
