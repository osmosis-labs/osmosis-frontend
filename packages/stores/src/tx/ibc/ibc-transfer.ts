import { AmountConfig } from "@keplr-wallet/hooks";
import { Buffer } from "buffer";

import { DeliverTxResponse, TxEvent } from "../../account";
import { IBCTransferHistory, UncommitedHistory } from "../../ibc-history";
import { IbcTransferCounterparty, IbcTransferSender } from "./types";

/** Use to perform a standard IBC transfer from `sender` to `counterparty`. Supports CW20 transfers (deposits). */
export async function basicIbcTransfer(
  /** Where the tokens originate. */
  sender: IbcTransferSender,
  /** Where the tokens should end up. */
  counterparty: IbcTransferCounterparty,
  amountConfig: AmountConfig,
  /** Handle when the IBC trasfer successfully broadcast to relayers. */
  onBroadcasted?: (event: Omit<UncommitedHistory, "createdAt">) => void,
  /** Handle IBC transfer events containing `send_packet` event type. */
  onFulfill?: (event: Omit<IBCTransferHistory, "status" | "createdAt">) => void,
  /** Initial tx failed. */
  onFailure?: (txHash: string, code: number) => void
) {
  if (
    !sender.account?.isReadyToSendTx ||
    (!(typeof counterparty.account === "string") &&
      !counterparty.account?.address)
  )
    return;

  const recipient =
    typeof counterparty.account === "string"
      ? counterparty.account
      : counterparty.account?.address ?? "";

  // process & report ibc transfer events
  const decodedTxEvents = {
    onBroadcasted: (txHash: Uint8Array) =>
      onBroadcasted?.({
        txHash: Buffer.from(txHash).toString("hex"),
        sourceChainId: sender.chainId,
        destChainId: counterparty.chainId,
        amount: {
          amount: amountConfig.amount,
          currency: amountConfig.sendCurrency,
        },
        sender: sender.account?.address ?? "",
        recipient,
      }),
    onFulfill: (tx: DeliverTxResponse) => {
      if (!tx.code) {
        const events = JSON.parse(tx?.rawLog ?? "{}")[0]?.events as
          | TxEvent[]
          | undefined;

        for (const event of events ?? []) {
          if (event.type === "send_packet") {
            const attributes = event.attributes;
            const sourceChannelAttr = attributes.find(
              (attr) => attr.key === "packet_src_channel"
            );
            const sourceChannel = sourceChannelAttr
              ? sourceChannelAttr.value.toString()
              : undefined;
            const destChannelAttr = attributes.find(
              (attr) => attr.key === "packet_dst_channel"
            );
            const destChannel = destChannelAttr
              ? destChannelAttr.value
              : undefined;
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
            const timeoutTimestampAttr = attributes.find(
              (attr) => attr.key === "packet_timeout_timestamp"
            );
            const timeoutTimestamp = timeoutTimestampAttr
              ? timeoutTimestampAttr.value
              : undefined;

            if (sourceChannel && destChannel && sequence) {
              onFulfill?.({
                txHash: tx.transactionHash,
                sourceChainId: sender.chainId,
                sourceChannelId: sourceChannel,
                destChainId: counterparty.chainId,
                destChannelId: destChannel,
                sequence,
                sender: sender.account?.address ?? "",
                recipient,
                amount: {
                  amount: amountConfig.amount,
                  currency: amountConfig.sendCurrency,
                },
                timeoutHeight,
                timeoutTimestamp,
              });
            }
          }
        }
      } else {
        onFailure?.(tx.transactionHash, tx.code as number);
      }
    },
  };

  // check if tokens transfer via contract
  if (sender.contractTransfer) {
    const { contractAddress, cosmwasmAccount, ics20ContractAddress } =
      sender.contractTransfer;

    const msg = {
      channel: sender.channelId,
      remote_address: recipient,
      // 15 min
      timeout: 900,
    };

    await cosmwasmAccount?.cosmwasm.sendExecuteContractMsg(
      "ibcTransfer" as any,
      contractAddress,
      {
        send: {
          contract: ics20ContractAddress,
          amount: amountConfig.getAmountPrimitive().amount,
          msg: Buffer.from(JSON.stringify(msg)).toString("base64"),
        },
      },
      [],
      decodedTxEvents
    );
  } else {
    // perform standard IBC token transfer
    await sender.account?.cosmos.sendIBCTransferMsg(
      {
        portId: "transfer",
        channelId: sender.channelId,
        counterpartyChainId: counterparty.chainId,
      },
      amountConfig.amount,
      amountConfig.sendCurrency,
      recipient,
      decodedTxEvents
    );
  }
}
