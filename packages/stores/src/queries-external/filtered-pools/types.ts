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

export function objToQueryParams(filters: object): string {
  return Object.entries(filters)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

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

export type FilteredPools = {
  pagination: {
    next_offset: number;
    total_pools: number;
  };
  pools: {
    main: boolean;
    type:
      | "osmosis.gamm.v1beta1.Pool"
      | "osmosis.gamm.poolmodels.stableswap.v1beta1.Pool"
      | "osmosis.concentratedliquidity.v1beta1.Pool";
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
  }[];
};
