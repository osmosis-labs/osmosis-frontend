import { PRICES_API_URL } from "~/queries/coingecko";

interface SimplePriceResponse {
  [coin: string]: {
    /**
     * price of coin for this currency
     */
    [currency: string]: number;
  };
}

export async function querySimplePrice(
  ids: string[],
  vsCurrencies: string[] = ["usd"]
): Promise<SimplePriceResponse> {
  const url = new URL("/api/v3/simple/price", PRICES_API_URL);

  const idsString = ids.join(",");
  const vsCurrenciesString = vsCurrencies.join(",");

  url.searchParams.append("ids", idsString);
  url.searchParams.append("vs_currencies", vsCurrenciesString);

  const response = await fetch(url.toString());
  return (await response.json()) as SimplePriceResponse;
}
