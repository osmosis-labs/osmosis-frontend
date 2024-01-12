import { apiClient } from "@osmosis-labs/utils";

import {
  ConcentratedPoolRawResponse,
  CosmwasmPoolRawResponse,
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "../osmosis";
import { SIDECAR_BASE_URL } from ".";

// overwrite types from node pool type

type UnderlyingWeightedPool = Omit<WeightedPoolRawResponse, "id" | "@type"> & {
  id: number;
};
type UnderlyingStablePool = Omit<StablePoolRawResponse, "id" | "@type"> & {
  id: number;
};
type UnderlyingConcentratedPool = Omit<
  ConcentratedPoolRawResponse,
  "id" | "@type"
> & {
  id: number;
};
type UnderlyingCosmwasmPool = Omit<
  CosmwasmPoolRawResponse,
  "pool_id" | "code_id" | "@type"
> & {
  pool_id: number;
  code_id: number;
};

/** For some reason the shape is the same but the IDs are changed to number
 *  and the type URL is removed. */
export type UnderlyingPool =
  | UnderlyingWeightedPool
  | UnderlyingStablePool
  | UnderlyingConcentratedPool
  | UnderlyingCosmwasmPool;

export type PoolsResponse = {
  /** Sidecar returns the same pool models as the node. */
  underlying_pool: UnderlyingPool;
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
  return await apiClient<PoolResponse[]>(url.toString());
}
