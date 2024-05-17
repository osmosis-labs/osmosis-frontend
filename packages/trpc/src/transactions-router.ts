import { getTransactions } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from ".";

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
});
