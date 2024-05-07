import { PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import {
  AssetFilterSchema,
  getAsset,
  getAssetHistoricalPrice,
  getAssetListingDate,
  getAssetMarketActivity,
  getAssetPrice,
  getAssets,
  getAssetWithUserBalance,
  getMarketAsset,
  getPoolAssetPairHistoricalPrice,
  getUpcomingAssets,
  getUserAssetsTotal,
  mapGetAssetsWithUserBalances,
  mapGetMarketAssets,
} from "../queries/complex/assets";
import { getBridgeAsset } from "../queries/complex/assets/bridge";
import { DEFAULT_VS_CURRENCY } from "../queries/complex/assets/config";
import { getCoinGeckoCoinMarketChart } from "../queries/complex/assets/price/historical";
import { UserOsmoAddressSchema } from "../queries/complex/parameter-types";
import {
  AvailableRangeValues,
  AvailableTimeDurations,
  TimeDuration,
  TimeFrame,
} from "../queries/data-services";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  captureErrorAndReturn,
  compareCommon,
  createSortSchema,
  InfiniteQuerySchema,
  maybeCachePaginatedItems,
  sort,
} from "../utils";

const GetInfiniteAssetsInputSchema =
  InfiniteQuerySchema.merge(AssetFilterSchema);

export const assetsRouter = createTRPCRouter({
  getUserAsset: publicProcedure
    .input(
      z
        .object({
          findMinDenomOrSymbol: z.string(),
        })
        .merge(UserOsmoAddressSchema)
    )
    .query(
      async ({ input: { findMinDenomOrSymbol, userOsmoAddress }, ctx }) => {
        const asset = getAsset({
          ...ctx,
          anyDenom: findMinDenomOrSymbol,
        });

        return await getAssetWithUserBalance({
          ...ctx,
          asset,
          userOsmoAddress,
        });
      }
    ),
  getUserAssets: publicProcedure
    .input(
      GetInfiniteAssetsInputSchema.merge(UserOsmoAddressSchema).merge(
        z.object({
          // Optional poolId to filter assets by pool
          poolId: z.string().optional(),
        })
      )
    )
    .query(
      async ({
        input: {
          search,
          userOsmoAddress,
          limit,
          cursor,
          onlyVerified,
          includePreview,
          categories,
          poolId,
        },
        ctx,
      }) =>
        maybeCachePaginatedItems({
          getFreshItems: () =>
            mapGetAssetsWithUserBalances({
              ...ctx,
              search,
              userOsmoAddress,
              onlyVerified,
              sortFiatValueDirection: "desc",
              includePreview,
              categories,
              poolId,
            }),
          cacheKey: JSON.stringify({
            search,
            userOsmoAddress,
            onlyVerified,
            includePreview,
            categories,
            poolId,
          }),
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
    .query(async ({ input: { coinMinimalDenom }, ctx }) => {
      const price = await getAssetPrice({
        ...ctx,
        asset: { coinMinimalDenom },
      });

      return new PricePretty(DEFAULT_VS_CURRENCY, price);
    }),
  getAssetWithPrice: publicProcedure
    .input(
      z.object({
        coinMinimalDenom: z.string(),
      })
    )
    .query(async ({ input: { coinMinimalDenom }, ctx }) => {
      const [asset, price] = await Promise.all([
        getAsset({ ...ctx, anyDenom: coinMinimalDenom }),
        getAssetPrice({
          ...ctx,
          asset: { coinMinimalDenom },
        }),
      ]);

      return {
        ...asset,
        currentPrice: new PricePretty(DEFAULT_VS_CURRENCY, price),
      };
    }),
  getUserMarketAsset: publicProcedure
    .input(
      z
        .object({
          findMinDenomOrSymbol: z.string(),
        })
        .merge(UserOsmoAddressSchema)
    )
    .query(
      async ({ input: { findMinDenomOrSymbol, userOsmoAddress }, ctx }) => {
        const asset = getAsset({
          ...ctx,
          anyDenom: findMinDenomOrSymbol,
        });

        const userAsset = await getAssetWithUserBalance({
          ...ctx,
          asset,
          userOsmoAddress,
        });
        const userMarketAsset = await getMarketAsset({
          asset: userAsset,
        });

        return {
          ...userAsset,
          ...userMarketAsset,
        };
      }
    ),
  getMarketAssets: publicProcedure
    .input(
      GetInfiniteAssetsInputSchema.merge(
        z.object({
          sort: createSortSchema([
            "currentPrice",
            "priceChange1h",
            "priceChange24h",
            "priceChange7d",
            "marketCap",
            "volume24h",
          ] as const).optional(),
          watchListDenoms: z.array(z.string()).optional(),
        })
      )
    )
    .query(
      ({
        input: {
          search,
          onlyVerified,
          sort: sortInput,
          watchListDenoms,
          categories,
          cursor,
          limit,
          includePreview,
        },
        ctx,
      }) =>
        maybeCachePaginatedItems({
          getFreshItems: async () => {
            const assets = await mapGetMarketAssets({
              ...ctx,
              search,
              onlyVerified,
              includePreview,
              categories,
            });

            // sorting
            if (sortInput) {
              // user sorting

              return sort(assets, sortInput.keyPath, sortInput.direction);
            } else {
              // default sorting, maybe with watchlist

              if (watchListDenoms) {
                // default sort watchlist to top
                return assets.sort((a, b) => {
                  // 1. watchlist denoms sorted by volume 24h desc
                  if (
                    watchListDenoms.includes(a.coinDenom) &&
                    watchListDenoms.includes(b.coinDenom)
                  )
                    return compareCommon(a.volume24h, b.volume24h);
                  if (watchListDenoms.includes(a.coinDenom)) return -1;
                  if (watchListDenoms.includes(b.coinDenom)) return 1;

                  // 2. rest of the assets by volume 24h desc
                  return compareCommon(a.volume24h, b.volume24h);
                });
              } else {
                // default sort by volume24h desc
                return sort(assets, "volume24h");
              }
            }
          },
          cacheKey: JSON.stringify({
            search,
            onlyVerified,
            sort: sortInput,
            watchListDenoms,
            categories,
            includePreview,
          }),
          cursor,
          limit,
        })
    ),
  getUserBridgeAssets: publicProcedure
    .input(
      GetInfiniteAssetsInputSchema.merge(UserOsmoAddressSchema).merge(
        z.object({
          sort: createSortSchema([
            "currentPrice",
            "priceChange24h",
            "usdValue",
          ] as const).optional(),
        })
      )
    )
    .query(
      ({
        input: {
          search,
          onlyVerified,
          userOsmoAddress,
          sort: sortInput,
          categories,
          cursor,
          limit,
          includePreview,
        },
        ctx,
      }) =>
        maybeCachePaginatedItems({
          getFreshItems: async () => {
            let assets = await mapGetAssetsWithUserBalances({
              ...ctx,
              search,
              categories,
              userOsmoAddress,
              includePreview,
            });

            if (!search)
              assets = assets.filter((asset) =>
                asset.amount?.toDec().isPositive()
              );

            let priceAssets = await Promise.all(
              assets.map(async (asset) => {
                const [currentPrice, priceChange24h] = await Promise.all([
                  getAssetPrice({ ...ctx, asset })
                    .then(
                      (price) => new PricePretty(DEFAULT_VS_CURRENCY, price)
                    )
                    .catch((e) => captureErrorAndReturn(e, undefined)),
                  getAssetMarketActivity(asset).then(
                    (activity) => activity?.price24hChange
                  ),
                ]);

                return {
                  ...asset,
                  currentPrice,
                  priceChange24h,
                };
              })
            );

            if (sortInput) {
              priceAssets = sort(
                priceAssets,
                sortInput.keyPath,
                sortInput.direction
              );
            }

            const bridgeAssets = priceAssets.map((asset) =>
              getBridgeAsset(ctx.assetLists, asset)
            );

            return bridgeAssets;
          },
          cacheKey: JSON.stringify({
            search,
            onlyVerified,
            userOsmoAddress,
            sort: sortInput,
            categories,
            includePreview,
          }),
          cursor,
          limit,
        })
    ),
  getUserAssetsTotal: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(({ input, ctx }) => getUserAssetsTotal({ ...ctx, ...input })),
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
      }).catch((e) => captureErrorAndReturn(e, []))
    ),
  getCoingeckoAssetHistoricalPrice: publicProcedure
    .input(
      z.object({
        /**
         * Coingecko ID
         */
        id: z.string(),
        timeFrame: z.union([
          z.object({
            custom: z.object({
              from: z.number().int().min(0),
              to: z.number().int().min(0),
            }),
          }),
          z.enum(["1h", "1d", "7d", "1mo", "1y", "all"]),
        ]),
      })
    )
    .query(({ input: { id, timeFrame } }) =>
      getCoinGeckoCoinMarketChart({
        id,
        timeFrame: typeof timeFrame === "string" ? timeFrame : timeFrame.custom,
      })
    ),
  getAssetPairHistoricalPrice: publicProcedure
    .input(
      z.object({
        poolId: z.string(),
        quoteCoinMinimalDenom: z.string(),
        baseCoinMinimalDenom: z.string(),
        timeDuration: z
          .string()
          .refine((td) => AvailableTimeDurations.includes(td as TimeDuration)),
      })
    )
    .query(
      ({
        input: {
          poolId,
          quoteCoinMinimalDenom,
          baseCoinMinimalDenom,
          timeDuration,
        },
      }) =>
        getPoolAssetPairHistoricalPrice({
          poolId,
          quoteCoinMinimalDenom,
          baseCoinMinimalDenom,
          timeDuration: timeDuration as TimeDuration,
        }).catch((e) =>
          captureErrorAndReturn(e, { prices: [], min: 0, max: 0 })
        )
    ),
  getTopNewAssets: publicProcedure
    .input(
      z.object({
        topN: z.number().int().positive().default(3),
      })
    )
    .query(async ({ input: { topN }, ctx }) => {
      const assets = getAssets({
        ...ctx,
        onlyVerified: true,
        categories: ["new"],
      });

      const marketAssets = await Promise.all(
        assets.map(async (asset) => {
          const marketAsset = await getAssetMarketActivity(asset).catch((e) =>
            captureErrorAndReturn(e, undefined)
          );

          const listingDate = getAssetListingDate({
            assetLists: ctx.assetLists,
            coinMinimalDenom: asset.coinMinimalDenom,
          });

          return {
            ...asset,
            listingDate,
            priceChange24h: marketAsset?.price24hChange,
          };
        })
      );

      return sort(
        marketAssets.filter((asset) => asset.priceChange24h !== undefined),
        "listingDate"
      ).slice(0, topN);
    }),
  getTopGainerAssets: publicProcedure
    .input(
      z.object({
        topN: z.number().int().positive().default(3),
      })
    )
    .query(async ({ input: { topN }, ctx }) => {
      const assets = getAssets({
        ...ctx,
        onlyVerified: true,
      });

      const marketAssets = await Promise.all(
        assets.map(async (asset) => {
          const marketAsset = await getAssetMarketActivity(asset).catch((e) =>
            captureErrorAndReturn(e, undefined)
          );

          return {
            ...asset,
            priceChange24h: marketAsset?.price24hChange,
          };
        })
      );

      return sort(
        marketAssets.filter((asset) => asset.priceChange24h !== undefined),
        "priceChange24h"
      ).slice(0, topN);
    }),
  getTopUpcomingAssets: publicProcedure
    .input(
      z.object({
        topN: z.number().int().positive().default(3),
      })
    )
    .query(({ input: { topN } }) =>
      getUpcomingAssets().then((upcomingAssets) =>
        upcomingAssets.slice(0, topN)
      )
    ),
});
