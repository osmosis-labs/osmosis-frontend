import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { AssetList, Chain } from "@osmosis-labs/types";
import { z } from "zod";

import { IS_TESTNET } from "../../../env";
import { search, SearchSchema } from "../../../utils/search";
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

/** Async function that provides simplified pools from any data source.
 *  Should handle caching in the provider. */
export type PoolProvider = (params: {
  assetLists: AssetList[];
  chainList: Chain[];
  poolIds?: string[];
  minLiquidityUsd?: number;
  withMarketIncentives?: boolean;
}) => Promise<Pool[]>;

export const PoolFilterSchema = z.object({
  poolIds: z.array(z.string()).optional(),
  /** Search pool ID, or denoms. */
  search: SearchSchema.optional(),
  /** Filter pool by minimum required USD liquidity. */
  minLiquidityUsd: z.number().optional(),
  /** Only include pools of given type. */
  types: z.array(z.enum(allPooltypes)).optional(),
  /** Search using exact match with pools denoms */
  denoms: z.array(z.string()).optional(),
  /** Include market incentive data. */
  withMarketIncentives: z.boolean().optional(),
});

/** Params for filtering pools. */
export type PoolFilter = z.infer<typeof PoolFilterSchema>;

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
  const pool = pools.find(({ id }) => id === poolId);
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
): Promise<Pool[]> {
  let pools = await poolProvider(params);

  if (params?.types) {
    pools = pools.filter(({ type }) =>
      params?.types ? params.types.includes(type) : true
    );
  }

  // Note: we do not want to filter the pools if we are in testnet because we do not have accurate pricing
  // information.
  if (params?.minLiquidityUsd && !IS_TESTNET) {
    pools = pools.filter(({ totalFiatValueLocked }) =>
      params?.minLiquidityUsd
        ? totalFiatValueLocked.toDec().gte(new Dec(params.minLiquidityUsd))
        : true
    );
  }

  // add denoms so user can search them
  let denomPools = pools.map((pool) => ({
    ...pool,
    coinDenoms: pool.reserveCoins.flatMap((coin) => [
      coin.denom,
      coin.currency.coinMinimalDenom,
    ]),
    poolNameByDenom: pool.reserveCoins.map(({ denom }) => denom).join("/"),
    coinNames: pool.reserveCoins.map((coin) => [
      // @ts-ignore
      coin.currency.coinName,
    ]),
  }));

  const denoms = params.denoms;
  if (denoms) {
    denomPools = denomPools.filter((denomPool) =>
      denomPool.coinDenoms.some((denom) => denoms.includes(denom))
    );
  }

  if (params?.search) {
    // search for an exact match of coinMinimalDenom or pool ID
    const coinDenomsOrIdMatches = search(
      denomPools,
      ["coinDenoms", "id"],
      params.search,
      0.0 // Exact match
    );

    // if not exact match for coinMinimalDenom or pool ID, search by poolNameByDenom (ex: OSMO/USDC) or coinName (ex: Bitcoin)
    if (coinDenomsOrIdMatches.length > 0) {
      denomPools = coinDenomsOrIdMatches;
    } else {
      const poolNameByDenomMatches = search(
        denomPools,
        ["poolNameByDenom", "coinNames"],
        params.search
      );

      denomPools = poolNameByDenomMatches;
    }
  }

  return denomPools;
}

export * from "./bonding";
export * from "./env";
export * from "./incentives";
export * from "./providers";
export * from "./route-token-out-given-in";
export * from "./share";
export * from "./superfluid";
export * from "./transmuter";
export * from "./user";
