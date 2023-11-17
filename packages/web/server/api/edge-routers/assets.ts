import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAssets } from "~/server/queries/complex/assets";
import {
  SearchSchema,
  SortSchema,
} from "~/server/queries/complex/parameter-types";

const GetAssetsSchema = z.object({
  userOsmoAddress: z.string().startsWith("osmo"),
  search: SearchSchema.optional(),
  sort: SortSchema.optional(),
});

export const assetsRouter = createTRPCRouter({
  getAssets: publicProcedure
    .input(GetAssetsSchema)
    .query(({ input: { search, sort } }) => getAssets({ ...search, ...sort })),
  getUserAssets: publicProcedure
    .input(
      GetAssetsSchema.extend({
        userOsmoAddress: z.string().startsWith("osmo"),
      })
    )
    .query(async ({ input: { search, sort, userOsmoAddress } }) => {
      const assets = await getAssets({ ...search, ...sort });

      return assets;
    }),
});
