import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getStrategiesCMSData,
  getStrategyAPR,
  getStrategyBalance,
  getStrategyTVL,
} from "~/server/queries/complex/earn/strategies";

export default createTRPCRouter({
  getStrategyBalance: publicProcedure
    .input(z.object({ strategyId: z.string(), userOsmoAddress: z.string() }))
    .query(async ({ input: { strategyId, userOsmoAddress } }) => {
      const res = await getStrategyBalance(strategyId, userOsmoAddress);
      return res;
    }),
  getStrategyAPR: publicProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ input: { strategyId } }) => {
      const res = await getStrategyAPR(strategyId);
      return res;
    }),
  getStrategyTVL: publicProcedure
    .input(z.object({ strategyId: z.string() }))
    .query(async ({ input: { strategyId } }) => {
      const res = await getStrategyTVL(strategyId);
      return res;
    }),
  getStrategiesCMSData: publicProcedure.query(
    async () => await getStrategiesCMSData()
  ),
});
