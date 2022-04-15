import { AppCurrency } from "@keplr-wallet/types";
import {
  AccountSetBaseSuper,
  CosmosAccount,
  CosmwasmAccount,
} from "@keplr-wallet/stores";

export interface IbcTransferSender {
  account: AccountSetBaseSuper & CosmosAccount;
  chainId: string;
  channelId: string;
  /** If provided, the transfer is assumed to be CW20 token. */
  contractTransfer?: {
    contractAddress: string;
    cosmwasmAccount: AccountSetBaseSuper & CosmwasmAccount;
    ics20ContractAddress: string;
  };
}

export type IbcTransferCounterparty = Omit<
  IbcTransferSender,
  "contractTransfer"
> & {
  /** If provided, will override the counterparty account address. */
  bech32AddressOverride?: string;
};

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
