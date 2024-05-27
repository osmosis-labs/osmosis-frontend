import { querySwapAdBanners } from "../queries/github/swap-ad-banners";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const cmsRouter = createTRPCRouter({
  getSwapAdBanners: publicProcedure.query(async () => {
    return querySwapAdBanners();
  }),
});
