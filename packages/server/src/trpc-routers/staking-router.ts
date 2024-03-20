import { z } from "zod";

import { getAverageStakingApr } from "../queries/complex/staking/apr";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const stakingRouter = createTRPCRouter({
  getApr: publicProcedure
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
