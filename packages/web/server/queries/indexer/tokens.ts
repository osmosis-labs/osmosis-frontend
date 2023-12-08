import { apiClient } from "@osmosis-labs/utils";

import { IMPERATOR_TIMESERIES_DEFAULT_BASEURL } from ".";
import { PoolToken } from "./filtered-pools";

export interface ImperatorToken extends PoolToken {
  liquidity: number;
  volume_24h: number;
  volume_24h_change: number;
  price_7d_change: number;
}

/** Fetches filtered and paginated pools. */
export async function queryAllTokens(): Promise<ImperatorToken[]> {
  // collect params
  const url = new URL("/tokens/v2/all", IMPERATOR_TIMESERIES_DEFAULT_BASEURL);

  return await apiClient<ImperatorToken[]>(url.toString());
}
