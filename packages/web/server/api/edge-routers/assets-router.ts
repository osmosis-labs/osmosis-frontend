import { PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { RecommendedSwapDenoms } from "~/config/feature-flag";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  Asset,
  AssetFilterSchema,
  getAsset,
  getAssetHistoricalPrice,
  getAssetMarketInfo,
  getAssetPrice,
  getUserAssetInfo,
  mapGetAssetMarketInfos,
  mapGetUserAssetInfos,
} from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
import {
  AvailableRangeValues,
  TimeFrame,
} from "~/server/queries/imperator/token-historical-chart";
import { compareDec, compareDefinedMember } from "~/utils/compare";
import { createSortSchema, sort } from "~/utils/sort";

import { maybeCachePaginatedItems } from "../pagination";
import { InfiniteQuerySchema } from "../zod-types";

const GetInfiniteAssetsInputSchema = InfiniteQuerySchema.and(
  AssetFilterSchema
).and(UserOsmoAddressSchema);

export const assetsRouter = createTRPCRouter({
  getAsset: publicProcedure
    .input(
      z
        .object({
          findMinDenomOrSymbol: z.string(),
        })
        .and(UserOsmoAddressSchema)
    )
    .query(async ({ input: { findMinDenomOrSymbol, userOsmoAddress } }) => {
      const asset = await getAsset({ anyDenom: findMinDenomOrSymbol });

      if (!asset) throw new Error("Asset not found " + findMinDenomOrSymbol);

      return await getUserAssetInfo({
        asset,
        userOsmoAddress,
      });
    }),
  getAssets: publicProcedure
    .input(GetInfiniteAssetsInputSchema)
    .query(
      async ({
        input: { search, userOsmoAddress, limit, cursor, onlyVerified },
      }) =>
        maybeCachePaginatedItems({
          getFreshItems: () =>
            mapGetUserAssetInfos({
              search,
              userOsmoAddress,
              onlyVerified,
              sortFiatValueDirection: "desc",
            }),
          cacheKey: JSON.stringify({ search, userOsmoAddress, onlyVerified }),
          cursor,
          limit,
        })
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
  getAssetInfo: publicProcedure
    .input(
      z
        .object({
          findMinDenomOrSymbol: z.string(),
        })
        .and(UserOsmoAddressSchema)
    )
    .query(async ({ input: { findMinDenomOrSymbol, userOsmoAddress } }) => {
      const asset = await getAsset({ anyDenom: findMinDenomOrSymbol });

      if (!asset) throw new Error("Asset not found " + findMinDenomOrSymbol);

      const userAsset = await getUserAssetInfo({ asset, userOsmoAddress });
      const userMarketInfoAsset = await getAssetMarketInfo({
        asset: userAsset,
      });

      return {
        ...userAsset,
        ...userMarketInfoAsset,
      };
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
          onlyPositiveBalances: z.boolean().default(false).optional(),
        })
      )
    )
    .query(
      ({
        input: {
          search,
          onlyVerified,
          userOsmoAddress,
          preferredDenoms,
          sort: sortInput,
          onlyPositiveBalances,
          cursor,
          limit,
        },
      }) =>
        maybeCachePaginatedItems({
          getFreshItems: async () => {
            const isDefaultSort = !sortInput && !search;

            let assets;
            assets = await mapGetAssetMarketInfos({
              search,
              onlyVerified,
            });

            assets = await mapGetUserAssetInfos({
              assets,
              userOsmoAddress,
              sortFiatValueDirection: isDefaultSort
                ? "desc"
                : !search && sortInput && sortInput.keyPath === "usdValue"
                ? sortInput.direction
                : undefined,
            });

            if (onlyPositiveBalances) {
              assets = assets.filter((asset) =>
                asset.amount?.toDec().isPositive()
              );
            }

            // Default sort (no sort provided):
            //  1. preferred denoms (from `preferredDenoms`)
            //  2. fiat balance descending (from `mapGetUserAssetInfos`)
            //  3. Market cap
            if (isDefaultSort) {
              assets = assets.sort((assetA, assetB) => {
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
                return 0;
              });
            }

            if (sortInput && sortInput.keyPath !== "usdValue") {
              assets = sort(assets, sortInput.keyPath, sortInput.direction);
            }

            // Can be searching and/or sorting
            return assets;
          },
          cacheKey: JSON.stringify({
            search,
            onlyVerified,
            userOsmoAddress,
            preferredDenoms,
            sort: sortInput,
            onlyPositiveBalances,
          }),
          cursor,
          limit,
        })
    ),
  getAssetHistoricalPrice: publicProcedure
    .input(
      z.object({
        coinDenom: z.string(),
        timeFrame: z.union([
          z.object({
            custom: z.object({
              timeFrame: z
                .number()
                .refine((tf) => AvailableRangeValues.includes(tf as TimeFrame)),
              numRecentFrames: z.number().optional(),
            }),
          }),
          z.enum(["1H", "1D", "1W", "1M"]),
        ]),
      })
    )
    .query(({ input: { coinDenom, timeFrame } }) =>
      getAssetHistoricalPrice({
        coinDenom,
        ...(typeof timeFrame === "string"
          ? { timeFrame }
          : (timeFrame.custom as {
              timeFrame: TimeFrame;
              numRecentFrames?: number;
            })),
      })
    ),
});
