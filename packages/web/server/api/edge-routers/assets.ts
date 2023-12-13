import { PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { RecommendedSwapDenoms } from "~/config/feature-flag";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  Asset,
  getAsset,
  getAssetPrice,
  getAssets,
  mapGetUserAssetInfo,
  MaybeUserAssetInfo,
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
      }): Promise<{
        items: (Asset & MaybeUserAssetInfo)[];
        nextCursor: number;
      }> => {
        const assets = await getAssets({
          search,
          sort,
          findMinDenomOrSymbol,
        });

        if (!userOsmoAddress)
          return maybeCursorPaginatedItems(assets, cursor, limit);

        const userAssets = await mapGetUserAssetInfo({
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
        z.object({
          preferredDenoms: z.array(z.string()).optional(),
          assetCategoryKeywords: z.array(z.string()).optional(),
        })
      )
    )
    .query(
      async ({
        input: {
          sort,
          search,
          userOsmoAddress,
          preferredDenoms,
          assetCategoryKeywords,
        },
      }) => {
        // TODO:
        // Get user assets with search and sort
        // Map all assets and add asset price, price change, and market cap (all PricePretty)
        // If no search and sort (default sort):
        //      Look at preferredDenoms and push to front of list, sorted by balance
        //      Look at assetCategoryKeywords and filter by matches

        let assets = await getAssets({ sort, search });

        if (userOsmoAddress)
          assets = await mapGetUserAssetInfo({
            userOsmoAddress,
            assets,
            sort,
            search,
          });

        throw new Error("Not implemented");
      }
    ),
});
