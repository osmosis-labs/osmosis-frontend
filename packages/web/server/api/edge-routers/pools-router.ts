import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getPool, PoolFilterSchema } from "~/server/queries/complex/pools";
import {
  IncentivePoolFilterSchema,
  mapGetPoolIncentives,
} from "~/server/queries/complex/pools/incentives";
import { mapGetPoolMarketMetrics } from "~/server/queries/complex/pools/market";
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

export const poolsRouter = createTRPCRouter({
  getPool: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId } }) => getPool(poolId)),
  getMarketIncentivePools: publicProcedure
    .input(
      GetInfinitePoolsSchema.and(
        z.object({
          sort: createSortSchema(marketIncentivePoolsSortKeys)
            .optional()
            .default({ keyPath: "totalFiatValueLocked" }),
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
            const marketPools = await mapGetPoolMarketMetrics({
              search,
              minLiquidityUsd,
              types,
            });
            const marketIncentivePools = await mapGetPoolIncentives({
              pools: marketPools,
              incentiveTypes,
            });

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
});
