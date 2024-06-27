import { apiClient } from "@osmosis-labs/utils";

import { TIMESERIES_DATA_URL } from "../../env";

export type PoolToken = {
  name: string;
  denom: string;
  price: number;
  amount: number;
  symbol: string;
  display: string;
  percent: number;
  exponent: number;
  coingecko_id: string;
  price_24h_change: number;
  weight_or_scaling: number;
};

export type FilteredPoolsResponse = {
  pagination: {
    next_offset: number;
    total_pools: number;
  };
  pools: {
    main: boolean;
    type:
      | "osmosis.gamm.v1beta1.Pool"
      | "osmosis.gamm.poolmodels.stableswap.v1beta1.Pool"
      | "osmosis.concentratedliquidity.v1beta1.Pool"
      | "osmosis.cosmwasmpool.v1beta1.CosmWasmPool";
    pool_id: number;

    // share pool
    exit_fees: number;
    liquidity: number;
    swap_fees: number;
    volume_7d: number;
    volume_24h: number;
    pool_tokens: PoolToken[] | { asset0: PoolToken; asset1: PoolToken };
    total_shares: {
      denom: string;
      amount: string;
    };
    volume_24h_change: number;
    liquidity_24h_change: number;
    total_weight_or_scaling: number;

    scaling_factor_controller?: string;

    // concentrated liquidity
    current_tick_liquidity: string;
    current_tick: string;
    tick_spacing: string;
    current_sqrt_price: string;
    spread_factor: string;
    exponent_at_price_one: string;
    address: string;

    // cosmwasm pool
    contract_address: string;
    instantiate_msg: string;
    code_id: string;
  }[];
};

export type Filters = {
  /** In USD. */
  min_liquidity: number;
  order_key: "liquidity" | "volume_24h" | "volume_7d";
  order_by: "asc" | "desc";
};

export type Pagination = {
  offset: number;
  limit: number;
};

/** Fetches filtered and paginated pools. */
export async function queryFilteredPools(
  filters?: Partial<Filters>,
  pagination?: Partial<Pagination>
): Promise<FilteredPoolsResponse> {
  // collect params
  const url = new URL("/stream/pool/v1/all", TIMESERIES_DATA_URL);
  const queryParams = new URLSearchParams();
  if (filters)
    Object.entries(filters).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });
  if (pagination)
    Object.entries(pagination).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });
  url.search = queryParams.toString();

  return await apiClient<FilteredPoolsResponse>(url.toString());
}
