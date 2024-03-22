import { apiClient } from "@osmosis-labs/utils";

import { authHeaders, DETAILS_API_URL } from ".";

export type CoingeckoActiveCoin = { id: string; symbol: string; name: string };

/** Returns CoinGecko coin IDs supported by CoinGecko. */
export async function queryCoingeckoCoinIds() {
  const url = new URL("/api/v3/coins/list", DETAILS_API_URL);

  return apiClient<CoingeckoActiveCoin[]>(url.toString(), {
    headers: authHeaders,
  });
}
