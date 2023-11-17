import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const assetsRouter = createTRPCRouter({
  getAssets: publicProcedure.query(({}) => {
    return {
      greeting: `Hello ${Math.random()}`,
    };
  }),
  getUserAssets: publicProcedure
    .input(
      z.object({
        userOsmoAddress: z.string().startsWith("osmo"),
      })
    )
    .query(() => {}),
});
