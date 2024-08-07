import { queryTx, Tx, TxEvent } from "@osmosis-labs/server";
import { PollingStatusSubscription, TxTracer } from "@osmosis-labs/tx";
import { AssetList, Chain } from "@osmosis-labs/types";
import { ChainIdHelper } from "@osmosis-labs/utils";

import {
  GetTransferStatusParams,
  TransferStatus,
  TransferStatusProvider,
  TransferStatusReceiver,
} from "../interface";
import { IbcBridgeProvider } from ".";

export type IbcTransferStatus = "pending" | "complete" | "timeout" | "refunded";

export class IbcTransferStatusProvider implements TransferStatusProvider {
  readonly keyPrefix = IbcBridgeProvider.ID;
  readonly sourceDisplayName = "IBC Transfer";
  public statusReceiverDelegate?: TransferStatusReceiver;

  /** `chainId` => `PollingStatusSubscription` */
  protected blockSubscriberMap: Map<string, PollingStatusSubscription> =
    new Map();

  constructor(
    protected readonly chainList: Chain[],
    protected readonly assetLists: AssetList[],
    /**
     * The maximum time to wait for any known resolution from status and/or websocket connections.
     * This is not related to the block height IBC timeout on chain, but rather is a catch all
     * fallback to prevent indefinite waiting when there's some unforseen issue
     * getting conclusive statuses from chain(s).
     * Default: 60 seconds.
     */
    protected readonly connectionTimeoutMs = 60 * 1000
  ) {}

  async trackTxStatus(serializedParamsOrHash: string): Promise<void> {
    try {
      const { sendTxHash, fromChainId, toChainId } = JSON.parse(
        serializedParamsOrHash
      ) as GetTransferStatusParams;

      if (typeof fromChainId === "number") {
        throw new Error(
          "Unexpected numerical chain ID for cosmos tx: " + fromChainId
        );
      }

      if (typeof toChainId === "number") {
        throw new Error(
          "Unexpected numerical chain ID for cosmos tx: " + toChainId
        );
      }

      // Get initiating IBC tx to extract event info for tracing
      const { tx_response } = await queryTx({
        chainId: fromChainId,
        chainList: this.chainList,
        txHash: sendTxHash,
      });

      if (tx_response.code) {
        console.error("IBC transfer status: initial tx failed:", sendTxHash);
        return this.pushNewStatus(serializedParamsOrHash, "failed");
      }

      const msgEvents = parseMsgTransferEvents(tx_response);

      if (!msgEvents) {
        console.error("IBC transfer status: no IBC events found:", sendTxHash);
        return this.pushNewStatus(serializedParamsOrHash, "failed");
      }

      await this.traceStatus({
        sourceChainId: fromChainId,
        sourceChannelId: msgEvents.sourceChannelId,
        destChainId: toChainId,
        destChannelId: msgEvents.destChannelId,
        destTimeoutHeight: msgEvents.timeoutHeight,
        sequence: msgEvents.sequence,
        serializedParamsOrHash,
      });
    } catch (e) {
      console.error("Unexpected failure when tracing IBC transfer status", e);
      this.pushNewStatus(serializedParamsOrHash, "connection-error");
    }
  }

  /**
   * Starts the necessary block polling subscriptions and tx query websocket connections to
   * look for key tx events or block heights that indicate the status of an IBC transfer.
   *
   * @throws If there's any unexpected error, perhaps with connection, registry, or query issues.
   */
  protected async traceStatus({
    sourceChainId,
    sourceChannelId,
    destChainId,
    destChannelId,
    destTimeoutHeight,
    sequence,
    serializedParamsOrHash,
  }: {
    sourceChainId: string;
    sourceChannelId: string;
    destChainId: string;
    destChannelId: string;
    destTimeoutHeight: string;
    sequence: string;
    serializedParamsOrHash: string;
  }): Promise<void> {
    const destBlockSubscriber = this.getBlockSubscriber(destChainId);
    const subscriptions: Promise<
      "timeout" | "received" | "connection-error"
    >[] = [];
    let timeoutUnsubscriber: (() => void) | undefined;

    // poll for timeout
    if (!destTimeoutHeight.endsWith("-0")) {
      const timeoutPromise = new Promise<"timeout">((resolve) => {
        const { promise, unsubscriber } = this.pollTimeoutHeight(
          destBlockSubscriber,
          destTimeoutHeight
        );

        // used for cleanup
        let timeout: ReturnType<typeof setTimeout> | undefined;
        timeoutUnsubscriber = () => {
          clearTimeout(timeout);
          unsubscriber();
        };

        promise.then((avgBlockTimeMs) => {
          // Even though the block is reached to the timeout height,
          // the receiving packet event could be delivered before the block timeout if the network connection is unstable.
          // This it not the chain issue itself, just an issue from the frontend connection: it it impossible to ensure the network status entirely.
          // To reduce this problem, just wait an additional block height even if the block is reached to the timeout height.
          timeout = setTimeout(() => resolve("timeout"), avgBlockTimeMs);
        });
      });

      subscriptions.push(timeoutPromise);
    } else {
      throw new Error(
        "Invalid destination timeout height: " + destTimeoutHeight
      );
    }

    // assume unkonwn connection error, either to status or websocket endpoint(s), if a basic IBC transfer takes longer than 1 minute
    subscriptions.push(
      new Promise<"connection-error">((resolve) => {
        setTimeout(() => resolve("connection-error"), this.connectionTimeoutMs);
      })
    );

    const packetReceivedTracer = new TxTracer(this.getChainRpcUrl(destChainId));
    const receivedPromise = packetReceivedTracer
      .traceTx({
        // Should use the dst channel.
        // Because src channel is agnostic to the counterparty chain's channel sequence,
        // it can be duplicated on the counterparty chain.
        // The sequence from the initiating tx is used to uniquely identify this IBC transfer.
        "recv_packet.packet_dst_channel": destChannelId,
        "recv_packet.packet_sequence": sequence,
      })
      .then(() => "received" as const);
    subscriptions.push(receivedPromise);

    // wait for the timeout or the packet received first, or propagate any unexpected error
    const result = await Promise.race(subscriptions).finally(() => {
      // remove the subscription and close the trace regardless of how promises resolved
      timeoutUnsubscriber?.();
      packetReceivedTracer.close();
    });

    // If the TxTracer finds the packet received tx before the timeout height, the raced promise would return the tx itself.
    // But, if the timeout is faster than the packet received, the raced promise would return undefined because the `traceTimeoutHeight` method returns nothing.
    switch (result) {
      case "received":
        return this.pushNewStatus(serializedParamsOrHash, "success");
      case "connection-error":
        return this.pushNewStatus(serializedParamsOrHash, "connection-error");
    }

    // If the packet timed out, wait until the packet timeout sent to the source chain.
    const timeoutTracer = new TxTracer(this.getChainRpcUrl(sourceChainId));
    await timeoutTracer
      .traceTx({
        "timeout_packet.packet_src_channel": sourceChannelId,
        "timeout_packet.packet_sequence": sequence,
      })
      .finally(() => timeoutTracer.close());

    this.pushNewStatus(serializedParamsOrHash, "refunded");
  }

  /**
   * Wraps events coming from a block subscriber in a promise that resolves
   * when the timeout height is met (or, if the version has upgraded).
   *
   * `timeoutHeight` should be formatted as `{chain_version}-{block_height}`
   *
   * @returns A promise that resolves to the average block time if the timeout height is met or more rarely when the chain version is incremented. Also an unsubscriber that is required to stop the polling when called.
   */
  protected pollTimeoutHeight(
    statusSubscriber: PollingStatusSubscription,
    timeoutHeight: string
  ): {
    unsubscriber: () => void;
    promise: Promise<number>;
  } {
    const chainVersion = parseInt(timeoutHeight.split("-")[0]);
    const timeoutBlockHeight = parseInt(timeoutHeight.split("-")[1]);

    let resolver: (value: number) => void;
    const promise = new Promise<number>((resolve) => {
      resolver = resolve;
    });
    const unsubscriber = statusSubscriber.subscribe((data, avgBlockTimeMs) => {
      const chainId = data?.result?.node_info?.network;
      if (chainId && ChainIdHelper.parse(chainId).version > chainVersion) {
        resolver(avgBlockTimeMs);
        return;
      }
      // timeout reached
      const blockHeight = data?.result?.sync_info?.latest_block_height;
      const timeoutReached =
        blockHeight && parseInt(blockHeight) > timeoutBlockHeight;
      if (timeoutReached) {
        resolver(avgBlockTimeMs);
        return;
      }
    });

    return {
      promise,
      unsubscriber,
    };
  }

  protected getBlockSubscriber(chainId: string): PollingStatusSubscription {
    if (!this.blockSubscriberMap.has(chainId)) {
      this.blockSubscriberMap.set(
        chainId,
        new PollingStatusSubscription(this.getChainRpcUrl(chainId))
      );
    }

    // eslint-disable-next-line
    return this.blockSubscriberMap.get(chainId)!;
  }

  protected getChainRpcUrl(chainId: string): string {
    const chain = this.chainList.find((chain) => chain.chain_id === chainId);
    if (!chain) {
      throw new Error("Chain not found: " + chainId);
    }

    const rpc = chain.apis.rpc[0].address;

    if (!rpc) {
      throw new Error("RPC address not found for chain: " + chainId);
    }

    return rpc;
  }

  /** Sends a status to the receiver with prefix key prepended. */
  protected pushNewStatus(
    serializedParamsOrHash: string,
    status: TransferStatus
  ) {
    return this.statusReceiverDelegate?.receiveNewTxStatus(
      `${this.keyPrefix}${serializedParamsOrHash}`,
      status
    );
  }

  makeExplorerUrl(serializedParamsOrKey: string): string {
    const { fromChainId, sendTxHash } = JSON.parse(
      serializedParamsOrKey
    ) as GetTransferStatusParams;

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
