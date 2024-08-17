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

export type SQSAprData = {
  swap_fees: {
    upper?: number;
    lower?: number;
  };
  superfluid: {
    upper?: number;
    lower?: number;
  };
  osmosis: {
    upper?: number;
    lower?: number;
  };
  boost: {
    upper?: number;
    lower: number;
  };
  total_apr: {
    upper?: number;
    lower?: number;
  };
};

export type SQSPoolFeesData = {
  pool_id?: string;
  volume_24h?: number;
  volume_7d?: number;
  fees_spent_24h?: number;
  fees_spent_7d?: number;
  fees_percentage?: string;
};

export type SqsPool = {
  /** Sidecar returns the same pool models as the node. */
  chain_model: ChainPool;
  balances: {
    denom: string;
    amount: string;
  }[];
  spread_factor: string;
  /** Int: capitalization in USD. Will be `"0"` if liquidity_cap_error is present. */
  liquidity_cap: string;
  liquidity_cap_error: string;

  apr_data?: SQSAprData;
  fees_data?: SQSPoolFeesData;
};

export function queryPools({
  poolIds,
  minLiquidityCap,
  withMarketIncentives,
}: {
  poolIds?: string[];
  minLiquidityCap?: string;
  withMarketIncentives?: boolean;
} = {}) {
  const url = new URL("/pools", SIDECAR_BASE_URL);
  const params = new URLSearchParams();

  if (poolIds) {
    params.append("IDs", poolIds.join(","));
  }
  if (minLiquidityCap) {
    params.append("min_liquidity_cap", minLiquidityCap);
  }
  if (withMarketIncentives) {
    params.append("with_market_incentives", "true");
  }

  url.search = params.toString();
  return apiClient<SqsPool[]>(url.toString());
}
