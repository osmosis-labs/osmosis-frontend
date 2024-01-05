import { apiClient } from "@osmosis-labs/utils";

// import { PRICES_API_URL } from "~/server/queries/coingecko";

const NUMIA_URL = "https://public-osmosis-api.numia.xyz/apr";

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

  return apiClient<StakingAprResponse[]>(url.toString());
}
