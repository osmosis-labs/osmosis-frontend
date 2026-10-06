import { apiClient } from "@osmosis-labs/utils";

import { HISTORICAL_DATA_URL } from "../../env";

export interface TokenData {
  price: number | null;
  denom: string;
  symbol: string;
  main: boolean;
  liquidity: number | null;
  liquidity_24h_change: number | null;
  volume_24h: number | null;
  volume_24h_change: number | null;
  name: string;
  price_1h_change: number | null;
  price_24h_change: number | null;
  price_7d_change: number | null;
  exponent: number;
  display: string;
  coingecko_id: string | null;
  coingecko_mcap: number | null;
}

export async function queryAllTokenData(): Promise<TokenData[]> {
  // collect params
  const url = new URL("/tokens/v2/all", HISTORICAL_DATA_URL);
  return await apiClient<TokenData[]>(url.toString());
}
