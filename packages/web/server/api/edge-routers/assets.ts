import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAssetPrice, getAssets } from "~/server/queries/complex/assets";
import {
  SearchSchema,
  SortSchema,
} from "~/server/queries/complex/parameter-types";
import { queryBalances } from "~/server/queries/cosmos";

import { maybeCursorPaginatedItems } from "../utils";
import { InfiniteQuerySchema } from "../zod-types";

const GetAssetsSchema = InfiniteQuerySchema.extend({
  userOsmoAddress: z.string().startsWith("osmo"),
  search: SearchSchema.optional(),
  sort: SortSchema.optional(),
});

type UserAsset = Awaited<ReturnType<typeof getAssets>>[number] & {
  amount: string;
  usdValue: string;
};

export const assetsRouter = createTRPCRouter({
  getAssets: publicProcedure
    .input(GetAssetsSchema)
    .query(async ({ input: { search, sort, limit, cursor } }) => {
      const assets = await getAssets({ ...search, ...sort });
      return maybeCursorPaginatedItems(assets, cursor, limit);
    }),
  getUserAssets: publicProcedure
    .input(
      GetAssetsSchema.extend({
        userOsmoAddress: z.string().startsWith("osmo"),
      })
    )
    .query(
      async ({ input: { search, sort, userOsmoAddress, limit, cursor } }) => {
        const assets = await getAssets({ ...search, ...sort });

        const { balances } = await queryBalances(userOsmoAddress);

        const eventualUserAssets = assets
          .map(async (asset) => {
            const balance = balances.find((a) => a.denom === asset.base);

            if (!balance) return;

            const value = await getAssetPrice({ asset });

            return {
              ...asset,
              amount: balance.amount,
              usdValue: value ?? "0",
            };
          })
          .filter((a): a is Promise<UserAsset> => !!a);

        const userAssets = await Promise.all(eventualUserAssets);
        return maybeCursorPaginatedItems(userAssets, cursor, limit);
      }
    ),
});
