import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getPools, PoolFilterSchema } from "~/server/queries/complex/pools";
import { getIncentivizedPool } from "~/server/queries/complex/pools/incentives";
import { getPoolMarketMetric } from "~/server/queries/complex/pools/market";

import { maybeCachePaginatedItems } from "../pagination";
import { InfiniteQuerySchema } from "../zod-types";

const GetInfinitePoolsSchema = InfiniteQuerySchema.and(PoolFilterSchema);

export const poolsRouter = createTRPCRouter({
  getMarketIncentivePools: publicProcedure
    .input(GetInfinitePoolsSchema)
    .query(async ({ input: { search, id, type, cursor, limit } }) =>
      maybeCachePaginatedItems({
        getFreshItems: async () => {
          const pools = await getPools({ search, id, type });

          return await Promise.all(
            pools.map(async (pool) => ({
              ...pool,
              ...((await getPoolMarketMetric(pool.id)) ?? {}),
              ...((await getIncentivizedPool(pool.id)) ?? {}),
            }))
          );
        },
        cacheKey: JSON.stringify({ search, id, type }),
        cursor,
        limit,
      })
    ),
});
