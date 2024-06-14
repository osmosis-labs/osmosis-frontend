import {
  CursorPaginationSchema,
  getChain,
  maybeCachePaginatedItems,
} from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const chainsRouter = createTRPCRouter({
  getChain: publicProcedure
    .input(
      z.object({
        findChainNameOrId: z.string(),
      })
    )
    .query(async ({ input: { findChainNameOrId }, ctx }) =>
      getChain({
        ...ctx,
        chainNameOrId: findChainNameOrId,
      })
    ),
  getChains: publicProcedure
    .input(
      CursorPaginationSchema.merge(z.object({ search: z.string().optional() }))
    )
    .query(async ({ input: { cursor, limit, search }, ctx }) =>
      maybeCachePaginatedItems({
        cacheKey: "chains",
        getFreshItems: () =>
          Promise.resolve(
            ctx.chainList.filter((chain) => {
              return search
                ? chain.chain_name.includes(search) ||
                    chain.pretty_name.includes(search)
                : true;
            })
          ),
        cursor,
        limit,
      })
    ),
});
