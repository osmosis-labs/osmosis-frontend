import { AssetList, Chain } from "@osmosis-labs/types";
import { CoinPretty, PricePretty, RatePretty } from "@osmosis-labs/unit";
import { z } from "zod";

import { IS_TESTNET } from "../../../env";
import { CursorPaginationSchema } from "../../../utils/pagination";
import { SearchSchema } from "../../../utils/search";
import { SortSchema } from "../../../utils/sort";
import { PoolRawResponse } from "../../osmosis";
import { PoolIncentives } from "./incentives";
import { getPoolsFromSidecar } from "./providers";

const allPooltypes = [
  "concentrated",
  "weighted",
  "stable",
  "cosmwasm-transmuter",
  "cosmwasm-astroport-pcl",
  "cosmwasm-whitewhale",
  "cosmwasm",
] as const;

export type PoolType = (typeof allPooltypes)[number];

const FILTERABLE_IDS = IS_TESTNET ? [] : ["2159"];

// PoolMarketMetrics is a partial type that contains the market metrics of a pool.
type PoolMarketMetrics = Partial<{
  volume7dUsd: PricePretty;
  volume24hUsd: PricePretty;
  volume24hChange: RatePretty;
  feesSpent24hUsd: PricePretty;
  feesSpent7dUsd: PricePretty;
}>;

export type Pool = {
  id: string;
  type: PoolType;
  raw: Omit<PoolRawResponse, "@type">;
  spreadFactor: RatePretty;
  reserveCoins: CoinPretty[];
  totalFiatValueLocked: PricePretty;
  incentives?: PoolIncentives;
  market?: PoolMarketMetrics;
};

/** Represents a list of pools with a total count. */
export type PoolProviderResponse = {
  data: Pool[];
  total: number; // Total number of pools
  nextCursor: number | undefined; // Next cursor for pagination
};

/** Async function that provides simplified pools from any data source.
 *  Should handle caching in the provider. */
export type PoolProvider = (params: {
  assetLists: AssetList[];
  chainList: Chain[];
  poolIds?: string[];
  minLiquidityUsd?: number;
}) => Promise<PoolProviderResponse>;

export const PoolFilterSchema = z.object({
  poolIds: z.array(z.string()).optional(),
  notPoolIds: z.array(z.string()).optional(),
  /** Search pool ID, or denoms. */
  search: SearchSchema.optional(),
  /** Filter pool by minimum required USD liquidity. */
  minLiquidityUsd: z.number().optional(),
  /** Only include pools of given type. */
  types: z.array(z.enum(allPooltypes)).optional(),
  /** Only include pools of provided incentive types */
  incentives: z.array(z.string()).optional(),
  /** Search using exact match with pools denoms */
  denoms: z.array(z.string()).optional(),
  /** Sort results by keyPath and direction */
  sort: SortSchema.optional(),
  /** Paginate pools */
  pagination: CursorPaginationSchema.optional(),
});

/** Params for filtering pools. */
export type PoolFilter = z.infer<typeof PoolFilterSchema>;

// Inferred type just for pagination
export type PaginationType = z.infer<typeof PoolFilterSchema>["pagination"];

// Inferred type just for sort
export type SortType = z.infer<typeof PoolFilterSchema>["sort"];

// Inferred type just for search
export type SearchType = z.infer<typeof PoolFilterSchema>["search"];

// const searchablePoolKeys = ["id", "coinDenoms", "poolNameByDenom"];

/** Get's an individual pool by ID.
 *  @throws If pool not found. */
export async function getPool({
  assetLists,
  chainList,
  poolId,
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  poolId: string;
}): Promise<Pool> {
  const pools = await getPools({ assetLists, chainList, poolIds: [poolId] });
  const pool = pools.items.find(({ id }) => id === poolId);
  if (!pool) throw new Error(poolId + " not found");
  return pool;
}

/** Fetches pools and returns them as a more useful and simplified TS type.
 *  Pools are filtered by isValidPool, which checks if the pool has at least 2 valid and listed assets.
 *  Preforms no default sorting.
 *  Params can be used to filter the results by a fuzzy search on the id, type, or coin denoms, as well as a specific id or type. */
export async function getPools(
  params: Partial<PoolFilter> & { assetLists: AssetList[]; chainList: Chain[] },
  poolProvider: PoolProvider = getPoolsFromSidecar
): Promise<{
  items: Pool[];
  total: number;
  nextCursor: number | undefined;
}> {
  params.notPoolIds = !params.notPoolIds ? FILTERABLE_IDS : params.notPoolIds;

  const pools = await poolProvider(params);

  return {
    items: pools.data,
    total: pools.total,
    nextCursor: pools.nextCursor,
  };
}

export * from "./bonding";
export * from "./env";
export * from "./incentives";
export * from "./providers";
export * from "./share";
export * from "./superfluid";
export * from "./transmuter";
export * from "./user";
