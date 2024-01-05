import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAverageStakingApr } from "~/server/queries/complex/numia/get-average-staking-apr";

export const numiaRouter = createTRPCRouter({
  getStakingApr: publicProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input: { startDate, endDate } }) => {
      const res = await getAverageStakingApr({ startDate, endDate });
      return res;
    }),
});
