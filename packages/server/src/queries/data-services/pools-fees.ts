import { apiClient } from "@osmosis-labs/utils";

import { TIMESERIES_DATA_URL } from "../../env";

export interface PoolFees {
  last_update_at: number;
  data: {
    pool_id: string;
    volume_24h: number;
    volume_7d: number;
    fees_spent_24h: number;
    fees_spent_7d: number;
    fees_percentage: string;
  }[];
}

export function queryPoolsFees(): Promise<PoolFees> {
  const url = new URL("/fees/v1/pools", TIMESERIES_DATA_URL);
  return apiClient<PoolFees>(url.toString());
}
