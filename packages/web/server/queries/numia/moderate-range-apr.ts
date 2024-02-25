import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_BASE_URL } from ".";

type PoolApr = {
  pool_id: string;
  swap_fees: number;
  superfluid: number;
  osmosis: number;
  boost: number;
  total_apr: number;
};

/** Queries numia for a breakdown of APRs per pool. */
export function queryModerateRangeApr(): Promise<PoolApr[]> {
  const url = new URL("/pools_apr_moderate_range", NUMIA_BASE_URL);
  return apiClient(url.toString());
}

// /** Queries numia for a breakdown of APRs per pool. */
// export function queryModerateRangeAprPool({
//   poolId,
// }: {
//   poolId: string;
// }): Promise<PoolApr> {
//   const url = new URL("/pools_apr_moderate_range", NUMIA_BASE_URL);

//   url.searchParams.append("pool", poolId);

//   return apiClient<PoolApr>(url.toString());
// }
