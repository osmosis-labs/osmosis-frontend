import { getTransactions } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const transactionsRouter = createTRPCRouter({
  getTransactions: publicProcedure
    .input(
      z.object({
        address: z.string(),
        page: z.string().optional(),
        pageSize: z.string().optional(),
      })
    )
    .query(async ({ input: { address, page, pageSize }, ctx }) => {
      const res = await getTransactions({
        address,
        page,
        pageSize,
        assetLists: ctx.assetLists,
      });
      return res;
    }),

  getTransactionsInfinite: publicProcedure
    .input(
      z.object({
        address: z.string(),
        cursor: z.number().nullish(), // cursor for infinite query
        limit: z.number().optional(), // limit per page
      })
    )
    .query(async ({ input: { address, cursor, limit }, ctx }) => {
      const res = await getTransactions({
        address,
        pageSize: limit ? String(limit) : "50",
        assetLists: ctx.assetLists,
        page: cursor ? String(cursor) : "0",
      });

      return {
        items: res.transactions,
        nextCursor: res.hasNextPage ? (cursor ?? 0) + 1 : undefined,
      };
    }),
});
