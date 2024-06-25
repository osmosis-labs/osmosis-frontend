import { apiClient } from "@osmosis-labs/utils";

import { PRICES_API_URL } from ".";

export type CoingeckoVsCurrencies = "usd";

interface SimplePriceResponse {
  /**
   * price of coin for this currency
   */
  [coinGeckoId: string]: Partial<Record<CoingeckoVsCurrencies, number>> &
    Partial<Record<"usd_24h_vol", number>>;
}

export async function querySimplePrice(
  ids: string[],
  vsCurrencies: CoingeckoVsCurrencies[] = ["usd"],
  includeVolume: boolean = true
): Promise<SimplePriceResponse> {
  const url = new URL("/api/v3/simple/price", PRICES_API_URL);

  const idsString = ids.join(",");
  const vsCurrenciesString = vsCurrencies.join(",");

  url.searchParams.append("ids", idsString);
  url.searchParams.append("include_24hr_vol", includeVolume ? "true" : "false");
  url.searchParams.append("vs_currencies", vsCurrenciesString);

  return apiClient<SimplePriceResponse>(url.toString());
}

export async function querySimpleTokenPrice(
  id: string,
  contractAddresses: string,
  vsCurrencies: CoingeckoVsCurrencies[] = ["usd"],
  includeVolume: boolean = true
): Promise<SimplePriceResponse> {
  const url = new URL(`/api/v3/simple/token_price/${id}`, PRICES_API_URL);

  const vsCurrenciesString = vsCurrencies.join(",");

  url.searchParams.append("vs_currencies", vsCurrenciesString);
  url.searchParams.append("include_24hr_vol", includeVolume ? "true" : "false");
  url.searchParams.append("contract_addresses", contractAddresses);

  return apiClient<SimplePriceResponse>(url.toString());
}
