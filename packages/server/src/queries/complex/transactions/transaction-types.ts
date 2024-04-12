import { CoinPretty, PricePretty } from "@keplr-wallet/unit";

export interface Transaction {
  _id: string;
  hash: string;
  chainId: string;
  schemaVersion: number;
  blockTimestamp: string;
  index: number;
  height: number;
  code: number;
  info: string;
  gasWanted: number;
  gasUsed: number;
  codespace: string;
  addressIndex: string[];
  messageTypes: string[];
  memo: string;
  messages: TransactionMessage[];
  ingested_at: string;
  metadata: TransactionMetadata[];
  prices: TransactionPrice[];
}

export interface TransactionMessage {
  sender: string;
  routes: TransactionRoute[];
  token_in_denom: string;
  token_out_min_amount: string;
  "@type": string;
}

export interface TransactionRoute {
  pools: TransactionPool[];
  token_in_amount: string;
}

export interface TransactionPool {
  pool_id: string;
  token_out_denom: string;
}

export interface TransactionMetadata {
  type: string;
  value: TransactionMetadataValue[];
}

export interface TransactionMetadataValue {
  txType: string;
  txMessageIndex: number;
  txFee: TxFee[];
  txInfo: TxInfo;
}

export interface TxFee {
  denom: string;
  amount: string;
  usd: number;
}

export interface TxInfo {
  tokenIn: TransactionToken;
  tokenOut: TransactionToken;
}

export interface TransactionToken {
  denom: string;
  amount: string;
  usd: number;
}

export interface TransactionPrice {
  denom: string;
  symbol: string;
  price_usd: number;
  price_date: string;
  exponent: number;
}

export interface MappedTransactionMetadata {
  value: {
    txFee: {
      token: CoinPretty;
      usd: PricePretty;
    }[];
    txInfo: {
      tokenIn: {
        token: CoinPretty;
        usd: PricePretty;
      };
      tokenOut: {
        token: CoinPretty;
        usd: PricePretty;
      };
    };
    txType: string;
    txMessageIndex: number;
  }[];
  type: string;
}
[];

export interface MappedTransaction {
  id: string;
  hash: string;
  blockTimestamp: string;
  code: number;
  metadata: MappedTransactionMetadata[];
}
