import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_INDEXER_BASEURL } from ".";

type PoolApr = {
  pool_id: string;
  swap_fees: number;
  superfluid: number;
  osmosis: number;
  boost: number;
  total_apr: number;
};

/** Queries numia for a breakdown of APRs per pool. */
export function queryPoolAprs(): Promise<PoolApr[]> {
  const url = new URL("/pools_apr", NUMIA_INDEXER_BASEURL);
  return apiClient(url.toString());
}
