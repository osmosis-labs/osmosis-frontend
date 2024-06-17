import { querySwapAdBanners } from "@osmosis-labs/server";

import { createTRPCRouter, publicProcedure } from "./api";

export const cmsRouter = createTRPCRouter({
  getSwapAdBanners: publicProcedure.query(async () => {
    return querySwapAdBanners();
  }),
});
