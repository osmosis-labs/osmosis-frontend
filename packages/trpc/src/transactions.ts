import { getTransactions, TRANSACTION_TYPES } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const transactionsRouter = createTRPCRouter({
  getTransactions: publicProcedure
    .input(
      z.object({
        address: z.string(),
        page: z.string().optional(),
        pageSize: z.string().optional(),
        /** Only these transaction types; all by default. */
        types: z.array(z.enum(TRANSACTION_TYPES)).optional(),
      })
    )
    .query(async ({ input: { address, page, pageSize, types }, ctx }) => {
      const res = await getTransactions({
        address,
        page,
        pageSize,
        types,
        assetLists: ctx.assetLists,
        chainList: ctx.chainList,
      });
      return res;
    }),
});
