import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getEarnStrategies } from "~/server/queries/complex/earn/strategies";

export const earnRouter = createTRPCRouter({
  getEarnStrategies: publicProcedure.query(async () => {
    const res = await getEarnStrategies();
    return res;
  }),
});
