import { apiClient } from "@osmosis-labs/utils";

import { HISTORICAL_DATA_URL } from "../../env";

export interface PortfolioOverTimeResponse {
  timestamp: string;
  usd: number;
}

export async function queryPortfolioOverTime({
  address,
  range,
}: {
  address: string;
  range: string;
}): Promise<PortfolioOverTimeResponse[]> {
  const url = new URL("/users/portfolio/over_time", HISTORICAL_DATA_URL);

  url.searchParams.append("address", address);
  url.searchParams.append("range", range);

  const headers = {
    Authorization: `Bearer ${process.env.NUMIA_API_KEY}`,
  };

  return apiClient<PortfolioOverTimeResponse[]>(url.toString(), { headers });
}
