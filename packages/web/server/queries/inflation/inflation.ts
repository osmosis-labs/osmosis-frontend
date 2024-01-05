import { apiClient } from "@osmosis-labs/utils";

// import { PRICES_API_URL } from "~/server/queries/coingecko";

const NUMIA_URL =
  "https://public-osmosis-api.numia.xyz/apr?start_date=2024-01-04&end_date=2024-02-05";

interface Response {
  labels: string;
  apr: number;
}
[];

export async function queryInflationApr(date: string): Promise<Response> {
  const url = new URL(NUMIA_URL);

  const today = "2024-01-04";
  const yesterday = "2024-02-05";

  url.searchParams.append("start_date", yesterday);
  url.searchParams.append("end_date", today);

  return apiClient<Response>(url.toString());
}
