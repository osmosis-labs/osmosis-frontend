import { apiClient } from "@osmosis-labs/utils";

import { TIMESERIES_DATA_URL } from "../../env";
import { PoolToken } from "./filtered-pools";

export interface ImperatorToken extends PoolToken {
  liquidity: number;
  volume_24h: number;
  volume_24h_change: number;
  price_7d_change: number;
}

export async function queryAllTokens(): Promise<ImperatorToken[]> {
  // collect params
  const url = new URL("/tokens/v2/all", TIMESERIES_DATA_URL);

  return await apiClient<ImperatorToken[]>(url.toString());
}
