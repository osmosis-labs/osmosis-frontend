import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_INDEXER_BASEURL } from ".";

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
  const url = new URL("/fees/v1/pools", NUMIA_INDEXER_BASEURL);
  return apiClient<PoolFees>(url.toString());
}
