import { PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { RecommendedSwapDenoms } from "~/config/feature-flag";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  Asset,
  getAsset,
  getAssetPrice,
  getAssets,
  mapGetUserAssetData,
  MaybeUserAsset,
} from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import {
  SearchSchema,
  SortSchema,
  UserOsmoAddressSchema,
} from "~/server/queries/complex/parameter-types";

import { maybeCursorPaginatedItems } from "../utils";
import { InfiniteQuerySchema } from "../zod-types";

const GetInfiniteAssetsInputSchema = InfiniteQuerySchema.extend({
  search: SearchSchema.optional(),
  sort: SortSchema.optional(),
}).and(UserOsmoAddressSchema);

export const assetsRouter = createTRPCRouter({
  getAssets: publicProcedure
    .input(
      GetInfiniteAssetsInputSchema.and(
        z.object({
          findMinDenomOrSymbol: z.string().optional(),
        })
      )
    )
    .query(
      async ({
        input: {
          search,
          sort,
          findMinDenomOrSymbol,
          userOsmoAddress,
          limit,
          cursor,
        },
      }): Promise<{ items: MaybeUserAsset[]; nextCursor: number }> => {
        const assets = await getAssets({
          search,
          sort,
          findMinDenomOrSymbol,
        });

        if (!userOsmoAddress)
          return maybeCursorPaginatedItems(assets, cursor, limit);

        const userAssets = await mapGetUserAssetData({
          assets,
          userOsmoAddress,
          sort,
          search,
        });

        return maybeCursorPaginatedItems(userAssets, cursor, limit);
      }
    ),
  getAssetPrice: publicProcedure
    .input(
      z.object({
        coinMinimalDenom: z.string(),
      })
    )
    .query(async ({ input: { coinMinimalDenom } }) => {
      const price = await getAssetPrice({
        asset: { coinMinimalDenom },
      });

      if (!price) throw new Error("Price not available " + coinMinimalDenom);

      return new PricePretty(DEFAULT_VS_CURRENCY, price);
    }),
  getRecommendedAssets: publicProcedure.query(async () => {
    const assets = await Promise.all(
      RecommendedSwapDenoms.map((denom) => getAsset({ anyDenom: denom }))
    );

    return assets.filter((a): a is Asset => !!a);
  }),
  getAssetInfos: publicProcedure
    .input(
      GetInfiniteAssetsInputSchema.and(
        z.object({ userFavoriteDenoms: z.array(z.string()).optional() })
      )
    )
    .query(async () => {
      // TODO:
      // Get user assets with search and sort
      // Map all assets and add asset price, price change, and market cap (all PricePretty)
      // If no search and sort (default sort):
      //      Look at userFavoriteDenoms and push to front of list, sorted by balance

      throw new Error("Not implemented");
    }),
});
