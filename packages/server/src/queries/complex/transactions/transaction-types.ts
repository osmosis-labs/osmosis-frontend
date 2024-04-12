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
  messages: Message[];
  ingested_at: string;
  metadata: Metadata[];
  prices: Price[];
}

export interface Message {
  sender: string;
  routes: Route[];
  token_in_denom: string;
  token_out_min_amount: string;
  "@type": string;
}

export interface Route {
  pools: Pool[];
  token_in_amount: string;
}

export interface Pool {
  pool_id: string;
  token_out_denom: string;
}

export interface Metadata {
  type: string;
  value: MetadataValue[];
}

export interface MetadataValue {
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
  tokenIn: Token;
  tokenOut: Token;
}

export interface Token {
  denom: string;
  amount: string;
  usd: number;
}

export interface Price {
  denom: string;
  symbol: string;
  price_usd: number;
  price_date: string;
  exponent: number;
}
