import { apiClient } from "@osmosis-labs/utils";

import { IMPERATOR_TIMESERIES_DEFAULT_BASEURL } from ".";

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
  const url = new URL("/tokens/v2/mcap", IMPERATOR_TIMESERIES_DEFAULT_BASEURL);

  return await apiClient<TokenMarketCap[]>(url.toString());
}
