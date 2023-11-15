import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const AssetsEdgeRouter = createTRPCRouter({
  assets: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  userAssets: publicProcedure
    .input(z.object({ bech32Address: z.string() }))
    .query(({ input }) => {}),
});
