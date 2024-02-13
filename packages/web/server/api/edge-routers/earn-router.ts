import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getEarnStrategies,
  getStrategyBalance,
} from "~/server/queries/complex/earn/strategies";

export default createTRPCRouter({
  getEarnStrategies: publicProcedure.query(async () => {
    const res = await getEarnStrategies();
    return res;
  }),
  getStrategyBalance: publicProcedure
    .input(z.object({ strategyId: z.string(), userOsmoAddress: z.string() }))
    .query(async ({ input: { strategyId, userOsmoAddress } }) => {
      const res = await getStrategyBalance(strategyId, userOsmoAddress);
      return res;
    }),
});
