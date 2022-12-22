import { Dec, Int, DecUtils } from "@keplr-wallet/unit";
import { PoolRaw } from "../../queries/pools";

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

export function makePoolRawFromFilteredPool(
  filteredPool: FilteredPools["pools"][0]
): PoolRaw {
  const base = {
    "@type": `/${filteredPool.type}`,
    id: filteredPool.pool_id.toString(),
    pool_params: {
      exit_fee: filteredPool.exit_fees.toString(),
      swap_fee: filteredPool.swap_fees.toString(),
      smooth_weight_change_params: null,
    },
    total_shares: filteredPool.total_shares,
  };

  if (filteredPool.type === "osmosis.gamm.v1beta1.Pool") {
    return {
      ...base,
      pool_assets: filteredPool.pool_tokens.map((token) => ({
        token: {
          denom: token.denom,
          amount: floatNumberToStringInt(token.amount, token.exponent),
        },
        weight: token.weight_or_scaling.toString(),
      })),
      total_weight: filteredPool.total_weight_or_scaling.toString(),
    };
  }

  if (filteredPool.type === "osmosis.gamm.poolmodels.stableswap.v1beta1.Pool") {
    return {
      ...base,
      pool_liquidity: filteredPool.pool_tokens.map((token) => ({
        denom: token.denom,
        amount: floatNumberToStringInt(token.amount, token.exponent),
      })),
      scaling_factors: filteredPool.pool_tokens.map((token) =>
        token.weight_or_scaling.toString()
      ),
      scaling_factor_controller: "", // TOOD: add scaling factor controller in imperator query
    };
  }

  throw new Error(
    "Filtered imperator pool not properly serialized as either a balancer or stable pool."
  );
}

function floatNumberToStringInt(number: number, exponent: number): string {
  return new Int(
    new Dec(number.toString())
      .mul(DecUtils.getTenExponentN(exponent))
      .truncate()
      .toString()
  ).toString();
}
