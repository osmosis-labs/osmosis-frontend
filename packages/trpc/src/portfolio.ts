import { getAllocation } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const portfolioRouter = createTRPCRouter({
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
});
