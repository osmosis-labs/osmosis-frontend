import { AppCurrency } from "@keplr-wallet/types";
import { AccountWithCosmwasm, AccountWithCosmos } from "@keplr-wallet/stores";

export interface IbcTransferSender {
  account: AccountWithCosmos;
  chainId: string;
  channelId: string;
  /** If provided, the transfer is assumed to be CW20 token. */
  contractTransfer?: {
    contractAddress: string;
    cosmwasmAccount: AccountWithCosmwasm;
    ics20ContractAddress: string;
  };
}

export type IbcTransferCounterparty = Omit<
  IbcTransferSender,
  "contractTransfer"
>;

export interface IbcBroadcastEvent {
  txHash: string;
  sourceChainId: string;
  destChainId: string;
  amount: { amount: string; currency: AppCurrency };
  sender: string;
  recipient: string;
}

export interface IbcFullfillmentEvent extends IbcBroadcastEvent {
  sourceChannelId: string;
  destChannelId: string;
  sequence: string;
  timeoutHeight?: string;
  timeoutTimestamp?: string;
}
