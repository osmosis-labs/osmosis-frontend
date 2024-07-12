import {
  getTokenInfo,
  querySwapAdBanners,
  TokenCMSData,
} from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const cmsRouter = createTRPCRouter({
  getSwapAdBanners: publicProcedure.query(async () => {
    return querySwapAdBanners();
  }),
  getTokenInfos: publicProcedure
    .input(
      z.object({
        coinDenom: z.string(),
        langs: z.array(z.string()),
      })
    )
    .query(async ({ input: { coinDenom, langs } }) => {
      const results = await Promise.all(
        langs.map(async (lang) => {
          try {
            const res = await getTokenInfo(coinDenom, lang);

            return [lang, res];
          } catch (error) {}

          return [lang, null];
        })
      );

      return Object.fromEntries(results) as { [key: string]: TokenCMSData };
    }),
});
