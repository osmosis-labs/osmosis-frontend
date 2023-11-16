import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const assetsRouter = createTRPCRouter({
  getAssets: publicProcedure.query(({ ctx: { userAddress } }) => {
    console.log({ userAddress });
    return {
      greeting: `Hello ${userAddress}`,
    };
  }),
});
