import { apiClient } from "@osmosis-labs/utils";

import { IS_TESTNET, SIDECAR_BASE_URL } from "../../env";
import {
  PaginationType,
  SearchType,
  SortType,
} from "../../queries/complex/pools";
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

export type SQSMetaResponse = {
  total_items: number;
  next_cursor: number | undefined;
};

export type SQSGetPoolsResponse = {
  data: SqsPool[];
  meta: SQSMetaResponse;
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

type PoolType = {
  [key: string]: number;
};

// Define the mapping of PoolType enums to integers
const PoolTypeEnum: PoolType = {
  weighted: 0, // Maps to Balancer
  stable: 1, // Maps to Stableswap
  concentrated: 2, // Maps to Concentrated
  cosmwasm: 3, // Maps to CosmWasm
};

// Function to retrieve integer values from the filter types
export const getPoolTypeIntegers = (filters: string[]): number[] => {
  return filters
    .map((filter) => PoolTypeEnum[filter] ?? -1) // Use -1 for undefined mappings
    .filter((value) => value !== -1); // Exclude invalid mappings
};

type IncentiveType = Record<string, number>;

// Define the mapping of IncentiveType enums to integers
const IncentiveType: IncentiveType = {
  superfluid: 0, // Maps to Superfluid
  osmosis: 1, // Maps to Osmosis
  boost: 2, // Maps to Boost
  none: 3, // Maps to None
};

// Function to retrieve integer values from the incentive filters
export const getIncentiveTypeIntegers = (filters: string[]): number[] =>
  filters.reduce<number[]>((result, filter) => {
    const value = IncentiveType[filter];
    if (value !== undefined) {
      result.push(value);
    }
    return result;
  }, []);

export async function queryPools({
  poolIds,
  notPoolIds,
  types,
  incentives,
  denoms,
  minLiquidityCap,
  withMarketIncentives,
  search,
  pagination,
  sort,
}: {
  poolIds?: string[];
  notPoolIds?: string[];
  types?: string[];
  incentives?: string[];
  denoms?: string[];
  minLiquidityCap?: string;
  withMarketIncentives?: boolean;
  search?: SearchType;
  pagination?: PaginationType;
  sort?: SortType;
} = {}) {
  const url = new URL("/pools", SIDECAR_BASE_URL);
  const params = new URLSearchParams();

  if (poolIds) {
    params.append("filter[id]", poolIds.join(","));
  }

  if (notPoolIds) {
    params.append("filter[id][not_in]", notPoolIds.join(","));
  }

  if (types) {
    params.append("filter[type]", getPoolTypeIntegers(types).join(","));
  }

  if (incentives) {
    params.append(
      "filter[incentive]",
      getIncentiveTypeIntegers(incentives).join(",")
    );
  }

  if (denoms) {
    params.append("filter[denom]", denoms.join(","));
  }

  // Note: we do not want to filter the pools if we are in testnet because we do not have accurate pricing
  // information.
  if (minLiquidityCap && !IS_TESTNET) {
    params.append("filter[min_liquidity_cap]", minLiquidityCap);
  }

  if (withMarketIncentives) {
    params.append("filter[with_market_incentives]", "true");
  }

  if (search) {
    if (search.query != null) {
      params.append("filter[search]", search.query.toString());
    }
  }

  if (pagination) {
    if (pagination.cursor != null) {
      params.append("page[cursor]", pagination.cursor.toString());
    }
    if (pagination.limit != null) {
      params.append("page[size]", pagination.limit.toString());
    }
  }

  if (sort) {
    const keyPathWithDirection =
      sort.direction === "desc" ? `-${sort.keyPath}` : sort.keyPath;
    params.append("sort", keyPathWithDirection);
  }

  url.search = params.toString();

  return apiClient<SQSGetPoolsResponse>(url.toString()).then((response) => {
    // When next_cursor is -1 that means we have reached the end of the list
    if (response.meta.next_cursor === -1) {
      response.meta.next_cursor = undefined;
    }
    return response;
  });
}
