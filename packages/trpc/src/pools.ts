import {
  createSortSchema,
  CursorPaginationSchema,
  getCachedPoolIncentivesMap,
  getCachedTransmuterTotalPoolLiquidity,
  getPool,
  getPools,
  getSharePool,
  getSharePoolBondDurations,
  getSuperfluidPoolIds,
  getUserPools,
  getUserSharePools,
  IncentivePoolFilterSchema,
  maybeCachePaginatedItems,
  PoolFilterSchema,
} from "@osmosis-labs/server";
import { sort } from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { UserOsmoAddressSchema } from "./parameter-types";

const GetInfinitePoolsSchema = CursorPaginationSchema.and(PoolFilterSchema).and(
  IncentivePoolFilterSchema
);

const marketIncentivePoolsSortKeys = [
  "totalFiatValueLocked",
  "market.feesSpent7dUsd",
  "market.feesSpent24hUsd",
  "market.volume7dUsd",
  "market.volume24hUsd",
  "incentives.aprBreakdown.total.upper",
] as const;
export type MarketIncentivePoolSortKey =
  (typeof marketIncentivePoolsSortKeys)[number];

export const poolsRouter = createTRPCRouter({
  getUserPools: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input: { userOsmoAddress }, ctx }) =>
      getUserPools({ ...ctx, bech32Address: userOsmoAddress }).then((pools) =>
        sort(pools, "userValue")
      )
    ),
  getUserSharePool: publicProcedure
    .input(
      z.object({ poolId: z.string() }).merge(UserOsmoAddressSchema.required())
    )
    .query(async ({ input: { poolId, userOsmoAddress }, ctx }) =>
      getUserSharePools({
        ...ctx,
        bech32Address: userOsmoAddress,
        poolIds: [poolId],
      }).then((pools) => pools[0] ?? null)
    ),
  getUserSharePools: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input: { userOsmoAddress }, ctx }) =>
      getUserSharePools({ ...ctx, bech32Address: userOsmoAddress }).then(
        (pools) => sort(pools, "totalValue")
      )
    ),
  getSharePoolBondDurations: publicProcedure
    .input(
      z
        .object({
          poolId: z.string(),
        })
        .merge(UserOsmoAddressSchema)
    )
    .query(async ({ input: { poolId, userOsmoAddress }, ctx }) =>
      getSharePoolBondDurations({
        ...ctx,
        poolId,
        bech32Address: userOsmoAddress,
      })
    ),
  getPools: publicProcedure
    .input(
      GetInfinitePoolsSchema.and(
        z.object({
          sort: createSortSchema(marketIncentivePoolsSortKeys).default({
            keyPath: "totalFiatValueLocked",
          }),
        })
      )
    )
    .query(
      async ({
        input: {
          search,
          minLiquidityUsd,
          sort: sortInput,
          denoms,
          types,
          incentiveTypes,
          cursor,
          limit,
        },
        ctx,
      }) =>
        maybeCachePaginatedItems({
          getFreshItems: async () => {
            const pools = await getPools({
              ...ctx,
              search,
              minLiquidityUsd,
              types,
              denoms,
            });

            if (search) return pools;
            else return sort(pools, sortInput.keyPath, sortInput.direction);
          },
          cacheKey: JSON.stringify({
            search,
            sortInput,
            minLiquidityUsd,
            types,
            denoms,
            incentiveTypes,
          }),
          cursor,
          limit,
        })
    ),
  getSuperfluidPoolIds: publicProcedure.query(({ ctx }) =>
    getSuperfluidPoolIds(ctx)
  ),
  getPoolIncentives: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId } }) =>
      getCachedPoolIncentivesMap().then((map) => map.get(poolId) ?? null)
    ),
  getTransmuterTotalPoolLiquidity: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(({ ctx, input: { contractAddress } }) =>
      getCachedTransmuterTotalPoolLiquidity(
        contractAddress,
        ctx.chainList,
        ctx.assetLists
      )
    ),
});

// Local router queries for pools.
export const poolsLocalRouter = createTRPCRouter({
  getSharePool: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId }, ctx }) => getSharePool({ ...ctx, poolId })),
  getPool: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId }, ctx }) => getPool({ ...ctx, poolId })),
});
