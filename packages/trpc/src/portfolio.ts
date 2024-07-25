import { getPortfolioOverTime } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const portfolioRouter = createTRPCRouter({
  getPortfolioOverTime: publicProcedure
    .input(
      z.object({
        address: z.string(),
        range: z.enum(["1d", "7d", "1mo", "1y", "all"]),
      })
    )
    .query(async ({ input: { address, range } }) => {
      const res = await getPortfolioOverTime({
        address,
        range,
      });
      return res;
    }),
});
