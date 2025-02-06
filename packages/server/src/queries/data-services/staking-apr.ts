import { apiClient } from "@osmosis-labs/utils";

import { HISTORICAL_DATA_URL, NUMIA_API_KEY } from "../../env";

interface StakingAprResponse {
  labels: string;
  apr: number;
}

export async function queryStakingApr({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}): Promise<StakingAprResponse[]> {
  const url = new URL("/apr", HISTORICAL_DATA_URL);

  url.searchParams.append("start_date", startDate);
  url.searchParams.append("end_date", endDate);

  const headers = {
    Authorization: `Bearer ${NUMIA_API_KEY}`,
  };

  return apiClient<StakingAprResponse[]>(url.toString(), { headers });
}
