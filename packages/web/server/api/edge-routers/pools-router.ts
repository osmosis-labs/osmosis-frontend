import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PoolFilterSchema } from "~/server/queries/complex/pools";
import { mapGetPoolIncentives } from "~/server/queries/complex/pools/incentives";
import { mapGetPoolMarketMetrics } from "~/server/queries/complex/pools/market";
import { createSortSchema, sort } from "~/utils/sort";

import { maybeCachePaginatedItems } from "../pagination";
import { InfiniteQuerySchema } from "../zod-types";

const GetInfinitePoolsSchema = InfiniteQuerySchema.and(PoolFilterSchema);

export const poolsRouter = createTRPCRouter({
  getMarketIncentivePools: publicProcedure
    .input(
      GetInfinitePoolsSchema.and(
        z.object({
          sort: createSortSchema([
            "totalFiatValueLocked",
            "feesSpent7dUsd",
            "feesSpent24hUsd",
            "volume7dUsd",
            "volume24hUsd",
            "aprBreakdown.total",
          ] as const)
            .optional()
            .default({ keyPath: "totalFiatValueLocked" }),
        })
      )
    )
    .query(
      async ({ input: { search, sort: sortInput, type, cursor, limit } }) =>
        maybeCachePaginatedItems({
          getFreshItems: async () => {
            const marketPools = await mapGetPoolMarketMetrics({ search, type });
            const marketIncentivePools = await mapGetPoolIncentives({
              pools: marketPools,
            });

            return sort(
              marketIncentivePools,
              sortInput.keyPath,
              sortInput.direction
            );
          },
          cacheKey: JSON.stringify({ search, sortInput, type }),
          cursor,
          limit,
        })
    ),
});
