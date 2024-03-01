import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
import {
  getPool,
  getPools,
  PoolFilterSchema,
} from "~/server/queries/complex/pools";
import {
  getCachedPoolIncentivesMap,
  IncentivePoolFilterSchema,
  isIncentivePoolFiltered,
} from "~/server/queries/complex/pools/incentives";
import { getCachedPoolMarketMetricsMap } from "~/server/queries/complex/pools/market";
import { getSuperfluidPoolIds } from "~/server/queries/complex/pools/superfluid";
import { getUserPools } from "~/server/queries/complex/pools/user";
import { createSortSchema, sort } from "~/utils/sort";

import { maybeCachePaginatedItems } from "../pagination";
import { InfiniteQuerySchema } from "../zod-types";

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

/**
 * This router is run on another edge api route since these queries are too expensive
 * and are slowing the other queries down because of JS single threaded nature. Client calls are still
 * the same. The separation is strictly on the server and automatically handled on trpc link.
 *
 * @see /web/utils/trpc.ts
 */
export const poolsRouter = createTRPCRouter({
  getPool: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId } }) => getPool({ poolId })),
  getUserPools: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input: { userOsmoAddress } }) =>
      getUserPools(userOsmoAddress).then((pools) => sort(pools, "userValue"))
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
      }) =>
        maybeCachePaginatedItems({
          getFreshItems: async () => {
            const poolsPromise = getPools({ search, minLiquidityUsd, types });
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
  getSuperfluidPoolIds: publicProcedure.query(getSuperfluidPoolIds),
  getPoolMarketMetrics: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId } }) =>
      getCachedPoolMarketMetricsMap().then((map) => map.get(poolId))
    ),
});
