import {
  getTokenInfo,
  queryAppStore,
  querySwapAdBanners,
} from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const cmsRouter = createTRPCRouter({
  getAppStore: publicProcedure.query(async () => {
    return queryAppStore();
  }),
  getSwapAdBanners: publicProcedure.query(async () => {
    return querySwapAdBanners();
  }),
  getTokenInfos: publicProcedure
    .input(
      z.object({
        coinMinimalDenom: z.string(),
      })
    )
    .query(async ({ input: { coinMinimalDenom } }) => {
      return await getTokenInfo(coinMinimalDenom);
    }),
});
