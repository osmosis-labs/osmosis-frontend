import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { search, SearchSchema } from "~/utils/search";

import { PoolRawResponse } from "../../osmosis";
import { getPoolFromSidecar, getPoolsFromSidecar } from "./providers/sidecar";

const allPooltypes = [
  "concentrated",
  "weighted",
  "stable",
  "cosmwasm-transmuter",
  "cosmwasm",
] as const;
export type PoolType = (typeof allPooltypes)[number];

export type Pool = {
  id: string;
  type: PoolType;
  raw: Omit<PoolRawResponse, "@type">;
  reserveCoins: CoinPretty[];
  totalFiatValueLocked: PricePretty;
};

/** Async function that provides simplified pools from any data source.
 *  Should handle caching in the provider. */
export type PoolsProvider = () => Promise<Pool[]>;
export type PoolProvider = (params: { poolId: string }) => Promise<Pool>;

export const PoolFilterSchema = z.object({
  /** Search pool ID, or denoms. */
  search: SearchSchema.optional(),
  /** Filter pool by minimum required USD liquidity. */
  minLiquidityUsd: z.number().optional(),
  /** Only include pools of given type. */
  types: z.array(z.enum(allPooltypes)).optional(),
});

/** Params for filtering pools. */
export type PoolFilter = z.infer<typeof PoolFilterSchema>;

const searchablePoolKeys = ["id", "coinDenoms"];

export async function getPool({
  poolId,
  poolProvider = getPoolFromSidecar,
}: {
  poolId: string;
  poolProvider?: PoolProvider;
}): Promise<Pool | undefined> {
  return await poolProvider({ poolId });
}

/** Fetches cached pools from node and returns them as a more useful and simplified TS type.
 *  Pools are filtered by isValidPool, which checks if the pool has at least 2 valid and listed assets.
 *  Preforms no default sorting.
 *  Params can be used to filter the results by a fuzzy search on the id, type, or coin denoms, as well as a specific id or type. */
export async function getPools(
  params?: PoolFilter,
  poolsProvider: PoolsProvider = getPoolsFromSidecar
): Promise<Pool[]> {
  let pools = await poolsProvider();

  if (params?.types || params?.minLiquidityUsd) {
    pools = pools.filter(
      ({ type, totalFiatValueLocked }) =>
        (params?.types ? params.types.includes(type) : true) &&
        (params?.minLiquidityUsd
          ? totalFiatValueLocked.toDec().gte(new Dec(params.minLiquidityUsd))
          : true)
    );
  }

  // add denoms so user can search them
  let denomPools = pools.map((pool) => {
    return {
      ...pool,
      coinDenoms: pool.reserveCoins.flatMap((coin) => [
        coin.denom,
        coin.currency.coinMinimalDenom,
      ]),
    };
  });

  if (params?.search) {
    denomPools = search(denomPools, searchablePoolKeys, params.search);
  }

  return denomPools;
}
