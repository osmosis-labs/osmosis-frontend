import { apiClient } from "@osmosis-labs/utils";

import { PRICES_API_URL } from ".";

interface CoingeckoSearchCoin {
  id?: string;
  name?: string;
  api_symbol?: string;
  symbol?: string;
  market_cap_rank?: number;
  thumb?: string;
  large?: string;
}

interface CoingeckoSearchExchange {
  id: string;
  name: string;
  year_established: number;
  country: string;
  description: string;
  url: string;
  image: string;
  has_trading_incentive: boolean;
  trust_score: number;
  trust_score_rank: number;
  trade_volume_24h_btc: number;
  trade_volume_24h_btc_normalized: number;
}

interface CoingeckoSearchResult {
  coins?: CoingeckoSearchCoin[];
  exchanges?: CoingeckoSearchExchange[];
  categories?: string[];
  nfts?: string[];
}

export function queryCoingeckoSearch(query: string) {
  const url = new URL("/api/v3/search", PRICES_API_URL);
  url.searchParams.append("query", query);
  return apiClient<CoingeckoSearchResult>(url.toString());
}
