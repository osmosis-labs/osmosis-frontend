import { AccountStore, CosmosAccount, CosmwasmAccount } from "../../account";

export interface IbcTransferSender {
  account: ReturnType<AccountStore<[CosmosAccount]>["getWallet"]>;
  chainId: string;
  channelId: string;

  /** If provided, the transfer is assumed to be CW20 token. */
  contractTransfer?: {
    contractAddress: string;
    cosmwasmAccount: ReturnType<AccountStore<[CosmwasmAccount]>["getWallet"]>;
    ics20ContractAddress: string;
  };
}

export type IbcTransferCounterparty = Omit<
  IbcTransferSender,
  "account" | "contractTransfer"
> & {
  /** If provided, will override the counterparty account address. */
  account: ReturnType<AccountStore<[CosmosAccount]>["getWallet"]> | string;
};
