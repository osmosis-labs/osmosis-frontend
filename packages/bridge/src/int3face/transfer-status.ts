import { queryTx, Tx, TxEvent } from "@osmosis-labs/server";
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
    const {
      sendTxHash,
      fromChain: { chainId: fromChainId },
    } = snapshot;

    await poll({
      fn: async () => {
        let status: TransferStatus | undefined;

        const ibcDetails = await this.getIbcTransferDetails({
          sendTxHash,
          fromChainId,
        })

        if (!ibcDetails) {
          return {
            id: snapshot.sendTxHash,
            status: "connection-error",
          } as BridgeTransferStatus;
        } else if (typeof ibcDetails === "string") {
          return {
            id: snapshot.sendTxHash,
            status: "failed",
          } as BridgeTransferStatus;
        }

        const { sourceChannelId, destChannelId, sequence } = ibcDetails;
        const transferId = `${sourceChannelId}::${destChannelId}::${sequence}`

        const data = await getTransferStatus(sendTxHash, this.env, transferId);
        const transferStatus = data?.transfer?.status

        if (!transferStatus) {
          /** The information about the transfer is still missing, try again */
          return;
        } else if (
          [
            Int3faceTransferStatus.TRANSACTION_STATUS_FAILED,
            Int3faceTransferStatus.TRANSACTION_STATUS_UNSPECIFIED,
          ].includes(transferStatus)
        ) {
          status = "failed";
        } else if (
          transferStatus === Int3faceTransferStatus.TRANSACTION_STATUS_PENDING
        ) {
          status = "pending";
        } else if (
          transferStatus === Int3faceTransferStatus.TRANSACTION_STATUS_FINALIZED
        ) {
          status = "success";
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

  async getIbcTransferDetails ({
    sendTxHash,
    fromChainId,
  }: {
    sendTxHash: string;
    fromChainId: string | number;
  }) {
    try {
      if (typeof fromChainId === "number") {
        throw new Error(
          "Unexpected numerical chain ID for cosmos tx: " + fromChainId
        );
      }

      // Get initiating IBC tx
      const { tx_response } = await queryTx({
        chainId: fromChainId,
        chainList: this.chainList,
        txHash: sendTxHash,
      });

      if (tx_response.code) {
        console.error("IBC transfer status: initial tx failed:", sendTxHash);
        return "failed";
      }

      const msgEvents = parseMsgTransferEvents(tx_response);

      if (!msgEvents) {
        console.error("IBC transfer status: no IBC events found:", sendTxHash);
        return "failed";
      }

      return {
        sourceChannelId: msgEvents.sourceChannelId,
        destChannelId: msgEvents.destChannelId,
        sequence: msgEvents.sequence,
      }
    } catch (e) {
      console.error("Unexpected failure when tracing IBC transfer status", e);
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

    if (!chain) throw new Error("Chain not found: " + fromChainId);
    if (chain.explorers.length === 0) {
      // attempt to link to mintscan since this is an IBC transfer
      return `https://www.mintscan.io/${chain.chain_name}/txs/${sendTxHash}`;
    }

    return chain.explorers[0].tx_page.replace("{txHash}", sendTxHash);
  }
}

// Note: this is the same function from ibc/transfer-status.ts (Should be exported and used in both places if needed)
/** Extract IBC-related events from the initial tx containing MsgTransfer message. */
function parseMsgTransferEvents(tx: Tx["tx_response"]) {
  // prefer raw log. If present, the tx.events are likely base64 encoded. If not present, tx.events are likely decoded.
  const events =
    tx.raw_log !== ""
      ? (JSON.parse(tx.raw_log)[0].events as TxEvent[])
      : tx.events;
  for (const event of events) {
    if (event.type === "send_packet") {
      const attributes = event.attributes;
      const sourceChannelAttr = attributes.find(
        (attr) => attr.key === "packet_src_channel"
      );
      const sourceChannelId = sourceChannelAttr
        ? sourceChannelAttr.value.toString()
        : undefined;
      const destChannelAttr = attributes.find(
        (attr) => attr.key === "packet_dst_channel"
      );
      const destChannelId = destChannelAttr ? destChannelAttr.value : undefined;
      const sequenceAttr = attributes.find(
        (attr) => attr.key === "packet_sequence"
      );
      const sequence = sequenceAttr ? sequenceAttr.value : undefined;
      const timeoutHeightAttr = attributes.find(
        (attr) => attr.key === "packet_timeout_height"
      );
      const timeoutHeight = timeoutHeightAttr
        ? timeoutHeightAttr.value
        : undefined;

      if (sourceChannelId && destChannelId && sequence && timeoutHeight) {
        return {
          txHash: tx.txhash,
          sourceChannelId,
          destChannelId,
          sequence,
          timeoutHeight,
        };
      }
    }
  }
}
