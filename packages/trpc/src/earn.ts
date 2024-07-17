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
    .input(
      z.object({
        strategyId: z.string(),
        balanceUrl: z.string().optional(),
        userOsmoAddress: z.string(),
      })
    )
    .query(async ({ input: { strategyId, userOsmoAddress, balanceUrl } }) => {
      const res = await getStrategyBalance(
        strategyId,
        userOsmoAddress,
        balanceUrl
      );
      return res;
    }),
  getStrategyAnnualPercentages: publicProcedure
    .input(z.object({ strategyId: z.string(), aprUrl: z.string() }))
    .query(async ({ input: { strategyId, aprUrl } }) => {
      const res = await getStrategyAnnualPercentages(strategyId, aprUrl);
      return res;
    }),
  getStrategyTVL: publicProcedure
    .input(z.object({ strategyId: z.string(), tvlUrl: z.string() }))
    .query(async ({ input: { strategyId, tvlUrl } }) => {
      const res = await getStrategyTVL(strategyId, tvlUrl);
      return res;
    }),
  getStrategies: publicProcedure.query(({ ctx }) => getStrategies(ctx)),
});
