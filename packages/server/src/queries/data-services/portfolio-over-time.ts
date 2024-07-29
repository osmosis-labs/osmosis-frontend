import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_BASE_URL } from "../../env";

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
  const url = new URL("/users/portfolio/over_time", NUMIA_BASE_URL);

  url.searchParams.append("address", address);
  url.searchParams.append("range", range);

  const headers = {
    Authorization: `Bearer ${process.env.NUMIA_API_KEY}`,
  };

  return apiClient<PortfolioOverTimeResponse[]>(url.toString(), { headers });
}
