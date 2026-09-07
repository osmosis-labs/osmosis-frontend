import { apiClient } from "@osmosis-labs/utils";

import { HISTORICAL_DATA_URL } from "../../env";

export interface PortfolioCurrentResponse {
  usd: number;
}

/**
 * Queries the Numia API for a user's current portfolio value
 */
export async function queryPortfolioCurrent({
  address,
}: {
  address: string;
}): Promise<PortfolioCurrentResponse> {
  const url = new URL("/users/portfolio/current", HISTORICAL_DATA_URL);

  url.searchParams.append("address", address);

  const headers = {
    Authorization: `Bearer ${process.env.NUMIA_API_KEY}`,
  };

  return await apiClient<PortfolioCurrentResponse>(url.toString(), {
    headers,
  });
}
