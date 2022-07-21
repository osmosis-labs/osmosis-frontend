import {
  AccountSetBase,
  CosmosAccount,
  CosmwasmAccount,
} from "@keplr-wallet/stores";

export interface IbcTransferSender {
  account: AccountSetBase & CosmosAccount;
  chainId: string;
  channelId: string;

  /** If provided, the transfer is assumed to be CW20 token. */
  contractTransfer?: {
    contractAddress: string;
    cosmwasmAccount: AccountSetBase & CosmwasmAccount;
    ics20ContractAddress: string;
  };
}

export type IbcTransferCounterparty = Omit<
  IbcTransferSender,
  "account" | "contractTransfer"
> & {
  /** If provided, will override the counterparty account address. */
  account: (AccountSetBase & CosmosAccount) | string;
};
