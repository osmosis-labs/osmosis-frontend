import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const assetsRouter = createTRPCRouter({
  getAssets: publicProcedure.query(({}) => {
    return {
      greeting: `Hello ${userAddress}`,
    };
  }),
});
