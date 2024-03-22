import { apiClient } from "@osmosis-labs/utils";

import { TIMESERIES_DATA_URL } from "../../env";

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
  const url = new URL("/tokens/v2/mcap", TIMESERIES_DATA_URL);

  return await apiClient<TokenMarketCap[]>(url.toString());
}
