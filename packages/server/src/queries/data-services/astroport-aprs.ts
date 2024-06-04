import { apiClient } from "@osmosis-labs/utils";

type PoolApr = {
  pool_id: string;
  swap_fees: number;
  superfluid: number;
  osmosis: number;
  boost: number;
  total_apr: number;
};

/** Queries numia for a breakdown of APRs per pool. */
export function queryAstroportPoolAprs(): Promise<PoolApr[]> {
  const url = new URL("/osmosis-pools", "https://api.astroport.fi/api");
  return apiClient(url.toString());
}
