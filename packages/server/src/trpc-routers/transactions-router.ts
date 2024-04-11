import { z } from "zod";

import { getTransactions } from "../queries/complex/transactions/transactions";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const transactionsRouter = createTRPCRouter({
  getTransactions: publicProcedure
    .input(
      z.object({
        address: z.string(),
        page: z.number().optional(),
        pageSize: z.number().optional(),
      })
    )
    .query(async ({ input: { address, page, pageSize } }) => {
      const res = await getTransactions({ address, page, pageSize });
      return res;
    }),
});
