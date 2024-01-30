import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_INDEXER_BASEURL } from ".";
import { PoolToken } from "./filtered-pools";

export interface ImperatorToken extends PoolToken {
  liquidity: number;
  volume_24h: number;
  volume_24h_change: number;
  price_7d_change: number;
}

export async function queryAllTokens(): Promise<ImperatorToken[]> {
  // collect params
  const url = new URL("/tokens/v2/all", NUMIA_INDEXER_BASEURL);

  return await apiClient<ImperatorToken[]>(url.toString());
}
