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

export type FilteredPools = {
  pagination: {
    next_offset: number;
    total_pools: number;
  };
  pools: {
    main: boolean;
    type:
      | "osmosis.gamm.v1beta1.Pool"
      | "osmosis.gamm.poolmodels.stableswap.v1beta1.Pool";
    pool_id: number;
    exit_fees: number;
    liquidity: number;
    swap_fees: number;
    volume_7d: number;
    volume_24h: number;
    pool_tokens: {
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
    }[];
    total_shares: {
      denom: string;
      amount: string;
    };
    volume_24h_change: number;
    liquidity_24h_change: number;
    total_weight_or_scaling: number;
  }[];
};
