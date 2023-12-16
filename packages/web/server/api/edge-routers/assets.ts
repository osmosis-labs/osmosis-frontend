import { PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { RecommendedSwapDenoms } from "~/config/feature-flag";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  Asset,
  getAsset,
  getAssetHistoricalPrice,
  getAssetPrice,
  getAssets,
  mapGetAssetMarketInfos,
  mapGetUserAssetInfos,
  MaybeUserAssetInfo,
} from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
import {
  AvailableRangeValues,
  TimeFrame,
} from "~/server/queries/indexer/token-historical-chart";
import { compareDec, compareDefinedMember } from "~/utils/compare";
import { SearchSchema } from "~/utils/search";
import { createSortSchema, sort } from "~/utils/sort";

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
          /** List of symbols or min denoms to be lifted to front of results if not searching or sorting. */
          preferredDenoms: z.array(z.string()).optional(),
          /** List of asset list categories to filter results by. */
          assetCategoriesFilter: z.array(z.string()).optional(),
          sort: createSortSchema([
            "currentPrice",
            "marketCap",
            "usdValue",
          ] as const).optional(),
        })
      )
    )
    .query(
      async ({
        input: {
          sort: sortInput,
          search,
          userOsmoAddress,
          preferredDenoms,
          cursor,
          limit,
        },
      }) => {
        /** Default sort (no sort provided):
         *  1. fiat balance descending (from `mapGetUserAssetInfos`)
         *  2. preferred denoms
         *  3. Market cap */
        const isDefaultSort = !sortInput;

        let assets;
        const start = Date.now();
        assets = await mapGetAssetMarketInfos({
          search,
        });
        console.log("mapGetAssetMarketInfos", Date.now() - start);

        assets = await mapGetUserAssetInfos({
          assets,
          userOsmoAddress,
          sortFiatValueDirection: isDefaultSort
            ? "desc"
            : !search && sortInput && sortInput.keyPath === "usdValue"
            ? sortInput.direction
            : undefined,
        });

        // Add default sorting
        if (isDefaultSort) {
          // Preferred denom default sort, with user fiat balance sorting included from `mapGetUserAssetInfos`
          assets = assets.sort((assetA, assetB) => {
            // Leave fiat balance sorting from `mapGetUserAssetInfos` in place
            const usdValueDefinedCompare = compareDefinedMember(
              assetA,
              assetB,
              "usdValue"
            );
            if (usdValueDefinedCompare) return usdValueDefinedCompare;

            // Sort by market cap
            const marketCapDefinedCompare = compareDefinedMember(
              assetA,
              assetB,
              "marketCap"
            );
            if (marketCapDefinedCompare) return marketCapDefinedCompare;
            if (assetA.marketCap && assetB.marketCap) {
              const marketCapCompare = compareDec(
                assetA.marketCap.toDec(),
                assetB.marketCap.toDec()
              );
              if (marketCapCompare) return marketCapCompare;
            }

            const isAPreferred =
              preferredDenoms &&
              (preferredDenoms.includes(assetA.coinDenom) ||
                preferredDenoms.includes(assetA.coinMinimalDenom));
            const isBPreferred =
              preferredDenoms &&
              (preferredDenoms.includes(assetB.coinDenom) ||
                preferredDenoms.includes(assetB.coinMinimalDenom));

            if (isAPreferred && !isBPreferred) return -1;
            if (!isAPreferred && isBPreferred) return 1;
            return 0;
          });
        }

        if (sortInput && sortInput.keyPath !== "usdValue") {
          assets = sort(assets, sortInput.keyPath, sortInput.direction);
        }

        // Can be searching and/or sorting
        return maybeCursorPaginatedItems(assets, cursor, limit);
      }
    ),
  getAssetHistoricalPrice: publicProcedure
    .input(
      z.object({
        coinDenom: z.string(),
        fidelity: z.union([
          z.object({
            custom: z.object({
              timeFrameMinutes: z
                .number()
                .refine((tf) => AvailableRangeValues.includes(tf as TimeFrame)),
              numRecentFrames: z.number().optional(),
            }),
          }),
          z.enum(["1H", "1D", "1W", "1M"]),
        ]),
      })
    )
    .query(({ input: { coinDenom, fidelity } }) => {
      if (typeof fidelity === "string") {
        let timeFrameMinutes;
        switch (fidelity) {
          case "1H":
            timeFrameMinutes = 5 as TimeFrame; // 5 minute bars
          case "1D":
            timeFrameMinutes = 60 as TimeFrame; // 1 hour bars
          case "1W":
            timeFrameMinutes = 720 as TimeFrame; // 12 hour bars
          case "1M":
            timeFrameMinutes = 1440 as TimeFrame; // 1 day bars
        }
        timeFrameMinutes = timeFrameMinutes as TimeFrame;

        let numRecentFrames;
        if (fidelity === "1H") {
          numRecentFrames = 12; // Last hour of prices in 5 bars of minutes
        } else if (fidelity === "1D") {
          numRecentFrames = 24; // Last day of prices with bars of 60 minutes
        } else if (fidelity === "1W") {
          numRecentFrames = 14; // Last week of prices with bars of 12 hours
        } else if (fidelity === "1M") {
          numRecentFrames = 30; // Last month of prices with bars as 1 day
        }

        return getAssetHistoricalPrice({
          coinDenom,
          timeFrameMinutes,
          numRecentFrames,
        });
      }

      return getAssetHistoricalPrice({
        coinDenom,
        ...(fidelity.custom as {
          timeFrameMinutes: TimeFrame;
          numRecentFrames?: number;
        }),
      });
    }),
});
