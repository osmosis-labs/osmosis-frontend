import {
  createSortSchema,
  CursorPaginationSchema,
  getCachedPoolIncentivesMap,
  getCachedPoolMarketMetricsMap,
  getCachedTransmuterTotalPoolLiquidity,
  getPool,
  getPools,
  getSharePool,
  getSharePoolBondDurations,
  getSuperfluidPoolIds,
  getUserPools,
  getUserSharePools,
  IncentivePoolFilterSchema,
  isIncentivePoolFiltered,
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
  "feesSpent7dUsd",
  "feesSpent24hUsd",
  "volume7dUsd",
  "volume24hUsd",
  "aprBreakdown.total.upper",
] as const;
export type MarketIncentivePoolSortKey =
  (typeof marketIncentivePoolsSortKeys)[number];

export const poolsRouter = createTRPCRouter({
  getPool: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId }, ctx }) => getPool({ ...ctx, poolId })),
  getSharePool: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId }, ctx }) => getSharePool({ ...ctx, poolId })),
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
  getMarketIncentivePools: publicProcedure
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
            const [pools, incentives, marketMetrics] = await Promise.all([
              getPools({
                ...ctx,
                search,
                minLiquidityUsd,
                types,
                denoms,
              }),
              getCachedPoolIncentivesMap(),
              getCachedPoolMarketMetricsMap(),
            ]);

            const marketIncentivePools = pools
              .map((pool) => {
                const incentivesForPool = incentives.get(pool.id);
                const metricsForPool = marketMetrics.get(pool.id) ?? {};

                const isIncentiveFiltered =
                  incentivesForPool &&
                  isIncentivePoolFiltered(incentivesForPool, {
                    incentiveTypes,
                  });

                if (isIncentiveFiltered) return;

                return {
                  ...pool,
                  ...incentivesForPool,
                  ...metricsForPool,
                };
              })
              .filter((pool): pool is NonNullable<typeof pool> => !!pool);

            if (search) return marketIncentivePools;
            else
              return sort(
                marketIncentivePools,
                sortInput.keyPath,
                sortInput.direction
              );
          },
          cacheKey: JSON.stringify({
            search,
            sortInput,
            minLiquidityUsd,
            types,
            incentiveTypes,
          }),
          cursor,
          limit,
        })
    ),
  getSuperfluidPoolIds: publicProcedure.query(({ ctx }) =>
    getSuperfluidPoolIds(ctx)
  ),
  getPoolMarketMetrics: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId } }) =>
      getCachedPoolMarketMetricsMap().then((map) => map.get(poolId) ?? null)
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
