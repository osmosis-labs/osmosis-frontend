import { getAllocation } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

// osmo140p7pef5hlkewuuramngaf5j6s8dlynth5zm06
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
