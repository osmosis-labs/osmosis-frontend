import { apiClient } from "@osmosis-labs/utils";

import { IMPERATOR_TIMESERIES_DEFAULT_BASEURL } from ".";

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
  const url = new URL("/fees/v1/pools", IMPERATOR_TIMESERIES_DEFAULT_BASEURL);
  throw new Error("Not implemented");
  return apiClient<PoolFees>(url.toString());
}
