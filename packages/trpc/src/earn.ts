import {
  getStrategies,
  getStrategyAnnualPercentages,
  getStrategyBalance,
  getStrategyTVL,
} from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const earnRouter = createTRPCRouter({
  getStrategyBalance: publicProcedure
    .input(z.object({ strategyId: z.string(), userOsmoAddress: z.string() }))
    .query(async ({ input: { strategyId, userOsmoAddress } }) => {
      const res = await getStrategyBalance(strategyId, userOsmoAddress);
      return res;
    }),
  getStrategyAnnualPercentages: publicProcedure
    .input(z.object({ aprUrl: z.string() }))
    .query(async ({ input: { aprUrl } }) => {
      const res = await getStrategyAnnualPercentages(aprUrl);
      return res;
    }),
  getStrategyTVL: publicProcedure
    .input(z.object({ tvlUrl: z.string() }))
    .query(async ({ input: { tvlUrl } }) => {
      const res = await getStrategyTVL(tvlUrl);
      return res;
    }),
  getStrategies: publicProcedure.query(({ ctx }) => getStrategies(ctx)),
});
