import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_INDEXER_BASEURL } from ".";

export interface TokenData {
  price: number;
  denom: string;
  symbol: string;
  main: boolean;
  liquidity: number;
  liquidity_24h_change: number;
  volume_24h: number;
  volume_24h_change: number;
  name: string;
  price_24h_change: number;
  exponent: number;
  display: string;
}

export async function queryTokenData({
  coinDenom,
}: {
  coinDenom: string;
}): Promise<TokenData> {
  // collect params
  const url = new URL(`/tokens/v2/${coinDenom}`, NUMIA_INDEXER_BASEURL);

  // for some reason it returns in an array format, but let's return the first item
  return (await apiClient<TokenData[]>(url.toString()))?.[0];
}

export async function queryAllTokenData(): Promise<TokenData[]> {
  // collect params
  const url = new URL("/tokens/v2/all", NUMIA_INDEXER_BASEURL);
  return await apiClient<TokenData[]>(url.toString());
}
