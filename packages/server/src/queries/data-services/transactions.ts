import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_BASE_URL } from "../../env";

interface Route {
  pools: Pool[];
  token_in_amount: string;
}

interface Pool {
  pool_id: string;
  token_out_denom: string;
}

interface Info {
  tokenIn: Token;
  tokenOut: Token;
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

interface Message {
  sender: string;
  routes: Route[];
  token_in_denom: string;
  token_out_min_amount: string;
  "@type": string;
}

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

export async function queryTransactions({
  address,
  page,
  pageSize,
}: {
  address: string;
  page: string;
  pageSize: string;
}): Promise<Transaction[]> {
  const url = new URL(`/v2/txs/${address}`, NUMIA_BASE_URL);

  url.searchParams.append("page", page);
  url.searchParams.append("pageSize", pageSize);

  const headers = {
    Authorization: `Bearer ${process.env.NUMIA_API_KEY}`,
  };

  return apiClient<Transaction[]>(url.toString(), { headers });
}
