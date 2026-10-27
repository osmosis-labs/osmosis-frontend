import { getPortfolioAssets, getPortfolioOverTime } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const portfolioRouter = createTRPCRouter({
  getPortfolioOverTime: publicProcedure
    .input(
      z.object({
        address: z.string().startsWith("osmo"),
        range: z.enum(["1d", "7d", "1mo", "1y", "all"]),
      })
    )
    .query(({ input: { address, range } }) =>
      getPortfolioOverTime({
        address,
        range,
      })
    ),
  getPortfolioAssets: publicProcedure
    .input(
      z.object({
        address: z.string().startsWith("osmo"),
      })
    )
    .query(({ input: { address }, ctx: { assetLists, chainList } }) =>
      getPortfolioAssets({
        address,
        assetLists,
        chainList,
      })
    ),
});
