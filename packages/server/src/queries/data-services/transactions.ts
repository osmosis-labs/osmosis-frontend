import { apiClient } from "@osmosis-labs/utils";

import { HISTORICAL_DATA_URL } from "../../env";

interface Route {
  pools: Pool[];
  token_in_amount: string;
}

interface Pool {
  pool_id: string;
  token_out_denom: string;
}

interface Info {
  /** Present on `swap` metadata. */
  tokenIn: Token;
  tokenOut: Token;
  /** Present on `ibc_send` / `ibc_received` metadata. */
  token?: Token;
  /** Chain name (chain registry) of the next hop, on `ibc_send`. */
  chain_to?: string;
  /** Chain name (chain registry) of the previous hop, on `ibc_received`. */
  chain_from?: string;
}

interface Token {
  denom: string;
  amount: string;
  usd: number;
}

interface Fee {
  denom: string;
  amount: string;
  usd: number;
}

interface Value {
  txType: string;
  txMessageIndex: number;
  txFee: Fee[];
  txInfo: Info;
}

interface Price {
  denom: string;
  symbol: string;
  price_usd: number;
  price_date: string;
  exponent: number;
}

export interface Metadata {
  type: string;
  value: Value[];
}

/** Decoded tx message. Fields depend on `@type`. */
export interface Message {
  "@type": string;
  sender?: string;
  routes?: Route[];
  token_in_denom?: string;
  token_out_min_amount?: string;
  [key: string]: unknown;
}

export interface Transaction {
  _id: string;
  hash: string;
  chainId: string;
  schemaVersion: number;
  blockTimestamp: string;
  index: number;
  height: number;
  fee?: { denom: string; amount: string }[];
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

export async function queryTransactions({
  address,
  page,
  pageSize,
  messageTypes,
}: {
  address: string;
  page: string;
  pageSize: string;
  messageTypes: string[];
}): Promise<Transaction[]> {
  const url = new URL(`/v2/txs/${address}`, HISTORICAL_DATA_URL);

  url.searchParams.append("page", page);
  url.searchParams.append("pageSize", pageSize);
  if (messageTypes.length > 0) {
    url.searchParams.append("messageTypes", messageTypes.join(","));
  }

  const headers = {
    Authorization: `Bearer ${process.env.NUMIA_API_KEY}`,
  };

  return apiClient<Transaction[]>(url.toString(), { headers });
}
