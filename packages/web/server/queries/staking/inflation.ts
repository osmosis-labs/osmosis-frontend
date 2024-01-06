import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_URL } from ".";

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
  const url = new URL(NUMIA_URL);

  url.searchParams.append("start_date", startDate);
  url.searchParams.append("end_date", endDate);

  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_NUMIA_API_KEY}`,
  };

  return apiClient<StakingAprResponse[]>(url.toString(), { headers });
}
