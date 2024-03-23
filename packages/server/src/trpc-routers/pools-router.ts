import { z } from "zod";

import { UserOsmoAddressSchema } from "../queries/complex/parameter-types";
import { getPool, getPools, PoolFilterSchema } from "../queries/complex/pools";
import { getSharePoolBondDurations } from "../queries/complex/pools/bonding";
import {
  getCachedPoolIncentivesMap,
  IncentivePoolFilterSchema,
  isIncentivePoolFiltered,
} from "../queries/complex/pools/incentives";
import { getCachedPoolMarketMetricsMap } from "../queries/complex/pools/market";
import { getSharePool } from "../queries/complex/pools/share";
import { getSuperfluidPoolIds } from "../queries/complex/pools/superfluid";
import { getUserPools, getUserSharePools } from "../queries/complex/pools/user";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { maybeCachePaginatedItems } from "../utils/pagination";
import { createSortSchema, sort } from "../utils/sort";
import { InfiniteQuerySchema } from "../utils/zod-types";

const GetInfinitePoolsSchema = InfiniteQuerySchema.and(PoolFilterSchema).and(
  IncentivePoolFilterSchema
);

const marketIncentivePoolsSortKeys = [
  "totalFiatValueLocked",
  "feesSpent7dUsd",
  "feesSpent24hUsd",
  "volume7dUsd",
  "volume24hUsd",
  "aprBreakdown.total",
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
          types,
          incentiveTypes,
          cursor,
          limit,
        },
        ctx,
      }) =>
        maybeCachePaginatedItems({
          getFreshItems: async () => {
            const poolsPromise = getPools({
              ...ctx,
              search,
              minLiquidityUsd,
              types,
            });
            const incentivesPromise = getCachedPoolIncentivesMap();
            const marketMetricsPromise = getCachedPoolMarketMetricsMap();

            /** Get remote data via concurrent requests, if needed. */
            const [pools, incentives, marketMetrics] = await Promise.all([
              poolsPromise,
              incentivesPromise,
              marketMetricsPromise,
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

            // won't sort if searching
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
});
