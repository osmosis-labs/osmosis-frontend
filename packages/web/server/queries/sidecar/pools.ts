import { apiClient } from "@osmosis-labs/utils";

import { PoolRawResponse } from "../osmosis";
import { SIDECAR_BASE_URL } from ".";

export type PoolsResponse = {
  /** Sidecar returns the same pool models as the node. */
  underlying_pool: PoolRawResponse;
  sqs_model: {
    total_value_locked_uosmo: string;
    balances: {
      denom: string;
      amount: string;
    }[];
    pool_denoms: string[];
    spread_factor: string;
  };
}[];

export async function queryPools() {
  const url = new URL("/pools/all", SIDECAR_BASE_URL);
  return await apiClient<PoolsResponse>(url.toString());
}
