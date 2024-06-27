import { apiClient } from "@osmosis-labs/utils";

import { PRICES_API_URL } from ".";

export type CoingeckoVsCurrencies = "usd";

interface SimplePriceResponse {
  /**
   * price of coin for this currency
   */
  [coinGeckoId: string]: Partial<Record<CoingeckoVsCurrencies, number>>;
}

export async function querySimplePrice(
  ids: string[],
  vsCurrencies: CoingeckoVsCurrencies[] = ["usd"]
): Promise<SimplePriceResponse> {
  const url = new URL("/api/v3/simple/price", PRICES_API_URL);

  const idsString = ids.join(",");
  const vsCurrenciesString = vsCurrencies.join(",");

  url.searchParams.append("ids", idsString);
  url.searchParams.append("vs_currencies", vsCurrenciesString);

  return apiClient<SimplePriceResponse>(url.toString());
}
