import { apiClient } from "@osmosis-labs/utils";

import {
  ConcentratedPoolRawResponse,
  CosmwasmPoolRawResponse,
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "../osmosis";
import { SIDECAR_BASE_URL } from ".";

// overwrite types from node pool type

export type UnderlyingWeightedPool = Omit<
  WeightedPoolRawResponse,
  "id" | "@type"
> & {
  id: number;
};
export type UnderlyingStablePool = Omit<
  StablePoolRawResponse,
  "id" | "@type" | "scaling_factors"
> & {
  id: number;
  scaling_factors: number[];
};
export type UnderlyingConcentratedPool = Omit<
  ConcentratedPoolRawResponse,
  "id" | "@type" | "current_tick" | "tick_spacing" | "exponent_at_price_one"
> & {
  id: number;
  current_tick: number;
  tick_spacing: number;
  exponent_at_price_one: number;
};
export type UnderlyingCosmwasmPool = Omit<
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
  return await apiClient<PoolsResponse>(url.toString());
}
