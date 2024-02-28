import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getEarnStrategies,
  getStrategyAPY,
  getStrategyBalance,
  getStrategyTVL,
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
  getStrategyAPY: publicProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ input: { strategyId } }) => {
      const res = await getStrategyAPY(strategyId);
      return res;
    }),
  getStrategyTVL: publicProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ input: { strategyId } }) => {
      const res = await getStrategyTVL(strategyId);
      return res;
    }),
});
