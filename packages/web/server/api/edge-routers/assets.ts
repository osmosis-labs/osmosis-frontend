import { PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { RecommendedSwapDenoms } from "~/config/feature-flag";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  Asset,
  getAsset,
  getAssetPrice,
  getAssets,
  mapGetAssetMarketInfos,
  mapGetUserAssetInfos,
  MaybeUserAssetInfo,
} from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
import { SearchSchema } from "~/server/utils/search";
import { SortSchema } from "~/server/utils/sort";

import { maybeCursorPaginatedItems } from "../utils";
import { InfiniteQuerySchema } from "../zod-types";

const GetInfiniteAssetsInputSchema = InfiniteQuerySchema.extend({
  search: SearchSchema.optional(),
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
        input: { search, findMinDenomOrSymbol, userOsmoAddress, limit, cursor },
      }): Promise<{
        items: (Asset & MaybeUserAssetInfo)[];
        nextCursor: number;
      }> => {
        const assets = await getAssets({
          search,
          findMinDenomOrSymbol,
        });

        if (!userOsmoAddress)
          return maybeCursorPaginatedItems(assets, cursor, limit);

        const userAssets = await mapGetUserAssetInfos({
          assets,
          userOsmoAddress,
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
        z.object({
          /** List of symbol or min denom to be lifted to front of results. */
          preferredDenoms: z.array(z.string()).optional(),
          /** List of asset list categories to filter results by. */
          assetCategoriesFilter: z.array(z.string()).optional(),
          sort: SortSchema.optional(),
        })
      )
    )
    .query(async ({ input: { search, userOsmoAddress, preferredDenoms } }) => {
      let assets = await mapGetAssetMarketInfos({
        search,
      });

      if (userOsmoAddress) {
        assets = await mapGetUserAssetInfos({
          userOsmoAddress,
          assets,
        });
      }

      if (preferredDenoms && !search) {
      }

      return [];
    }),
});
