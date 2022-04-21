import { AppCurrency } from "@keplr-wallet/types";

export interface UncommitedHistory {
  // Hex encoded.
  readonly txHash: string;
  readonly sourceChainId: string;
  readonly destChainId: string;
  readonly recipient: string;
  readonly amount: {
    currency: AppCurrency;
    amount: string;
  };
  readonly sender: string;
  readonly createdAt: string;
}

export type IBCTransferHistoryStatus =
  | "pending"
  | "complete"
  | "timeout"
  | "refunded";

export interface IBCTransferHistory {
  // Hex encoded.
  readonly txHash: string;
  readonly sourceChainId: string;
  readonly sourceChannelId: string;
  readonly destChainId: string;
  readonly destChannelId: string;
  readonly sequence: string;
  readonly sender: string;
  readonly recipient: string;
  readonly amount: {
    currency: AppCurrency;
    amount: string;
  };
  status: IBCTransferHistoryStatus;
  // timeoutHeight should be formed as the `{chain_version}-{block_height}`
  readonly timeoutHeight?: string;
  readonly timeoutTimestamp?: string;
  readonly createdAt: string;
}
