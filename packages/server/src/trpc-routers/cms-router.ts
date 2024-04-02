import { querySwapAdBanners } from "../queries";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const cmsRouter = createTRPCRouter({
  getSwapAdBanners: publicProcedure.query(async () => {
    return querySwapAdBanners();
  }),
});
