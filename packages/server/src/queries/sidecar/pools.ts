import { apiClient } from "@osmosis-labs/utils";

import { SIDECAR_BASE_URL } from "../../env";
import {
  ConcentratedPoolRawResponse,
  CosmwasmPoolRawResponse,
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "../osmosis";

// overwrite types from node pool type

export type ChainWeightedPool = Omit<
  WeightedPoolRawResponse,
  "id" | "@type"
> & {
  id: number;
};
export type ChainStablePool = Omit<
  StablePoolRawResponse,
  "id" | "@type" | "scaling_factors"
> & {
  id: number;
  scaling_factors: number[];
};
export type ChainConcentratedPool = Omit<
  ConcentratedPoolRawResponse,
  "id" | "@type" | "current_tick" | "tick_spacing" | "exponent_at_price_one"
> & {
  id: number;
  current_tick: number;
  tick_spacing: number;
  exponent_at_price_one: number;
};
export type ChainCosmwasmPool = Omit<
  CosmwasmPoolRawResponse,
  "pool_id" | "code_id" | "@type"
> & {
  pool_id: number;
  code_id: number;
};

/** For some reason the shape is the same but the IDs are changed to number
 *  and the type URL is removed. */
export type ChainPool =
  | ChainWeightedPool
  | ChainStablePool
  | ChainConcentratedPool
  | ChainCosmwasmPool;

export type PoolsResponse = {
  /** Sidecar returns the same pool models as the node. */
  chain_model: ChainPool;
  balances: {
    denom: string;
    amount: string;
  }[];
  spread_factor: string;
}[];

export async function queryPools({ poolIds }: { poolIds?: string[] } = {}) {
  const url = new URL(
    poolIds ? `/pools?IDs=${poolIds.join(",")}` : "/pools",
    SIDECAR_BASE_URL
  );
  return await apiClient<PoolsResponse>(url.toString());
}
