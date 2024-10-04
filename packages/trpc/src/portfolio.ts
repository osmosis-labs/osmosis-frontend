import { getPortfolioOverTime } from "@osmosis-labs/server";
import { getAllocation, getHasAssetVariants } from "@osmosis-labs/server";
import { ChartPortfolioOverTimeResponse } from "@osmosis-labs/server/src/queries/complex/portfolio/portfolio";
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
    .query(
      async ({
        input: { address, range },
      }): Promise<ChartPortfolioOverTimeResponse[]> => {
        const res = await getPortfolioOverTime({
          address,
          range,
        });
        return res;
      }
    ),
  getAllocation: publicProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .query(async ({ input: { address }, ctx }) => {
      const res = await getAllocation({
        address,
        assetLists: ctx.assetLists,
      });
      return res;
    }),

  getHasAssetVariants: publicProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .query(async ({ input: { address }, ctx }) => {
      const res = await getHasAssetVariants({
        address,
        assetLists: ctx.assetLists,
      });
      return res;
    }),
});
