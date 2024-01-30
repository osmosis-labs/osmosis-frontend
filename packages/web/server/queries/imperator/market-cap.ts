import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_INDEXER_BASEURL } from ".";

export interface TokenMarketCap {
  /**
   * Coin denom in upper case.
   * E.g. "ATOM", "LUNC", "CRO"
   */
  symbol: string;
  market_cap: number;
}

export async function queryTokenMarketCaps(): Promise<TokenMarketCap[]> {
  // collect params
  const url = new URL("/tokens/v2/mcap", NUMIA_INDEXER_BASEURL);

  return await apiClient<TokenMarketCap[]>(url.toString());
}
