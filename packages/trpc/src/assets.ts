import { PricePretty } from "@keplr-wallet/unit";
import {
  AssetFilterSchema,
  AvailableRangeValues,
  AvailableTimeDurations,
  captureErrorAndReturn,
  createSortSchema,
  CursorPaginationSchema,
  DEFAULT_VS_CURRENCY,
  getAsset,
  getAssetCoingeckoCoin,
  getAssetHistoricalPrice,
  getAssetListingDate,
  getAssetMarketActivity,
  getAssetPrice,
  getAssets,
  getAssetWithUserBalance,
  getAssetWithVariants,
  getBridgeAsset,
  getCoinGeckoCoinMarketChart,
  getMarketAsset,
  getPoolAssetPairHistoricalPrice,
  getUpcomingAssets,
  getUserAssetsTotal,
  mapGetAssetsWithUserBalances,
  mapGetMarketAssets,
  maybeCachePaginatedItems,
  TimeDuration,
  TimeFrame,
} from "@osmosis-labs/server";
import { compareCommon, isNil, sort } from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { UserOsmoAddressSchema } from "./parameter-types";

const GetInfiniteAssetsInputSchema =
  CursorPaginationSchema.merge(AssetFilterSchema);

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
  getCanonicalAssetWithVariants: publicProcedure
    .input(
      z.object({
        findMinDenomOrSymbol: z.string(),
      })
    )
    .query(async ({ input: { findMinDenomOrSymbol }, ctx }) =>
      getAssetWithVariants({ ...ctx, anyDenom: findMinDenomOrSymbol })
    ),
  getAssetPrice: publicProcedure
    .input(
      z.object({
        coinMinimalDenom: z.string(),
      })
    )
    .query(async ({ input: { coinMinimalDenom } }) => {
      const price = await getAssetPrice(coinMinimalDenom);

      return new PricePretty(DEFAULT_VS_CURRENCY, price);
    }),
  getAssetWithPrice: publicProcedure
    .input(
      z.object({
        findMinDenomOrSymbol: z.string(),
      })
    )
    .query(async ({ input: { findMinDenomOrSymbol }, ctx }) => {
      const asset = getAsset({ ...ctx, anyDenom: findMinDenomOrSymbol });
      const price = await getAssetPrice(asset.coinMinimalDenom);

      return {
        ...asset,
        currentPrice: new PricePretty(DEFAULT_VS_CURRENCY, price),
      };
    }),
  getMarketAsset: publicProcedure
    .input(
      z.object({
        findMinDenomOrSymbol: z.string(),
      })
    )
    .query(async ({ input: { findMinDenomOrSymbol }, ctx }) => {
      const asset = getAsset({
        ...ctx,
        anyDenom: findMinDenomOrSymbol,
      });

      const userAsset = await getAssetWithUserBalance({
        ...ctx,
        asset,
      });
      const userMarketAsset = await getMarketAsset({
        ...ctx,
        extended: true,
        asset: userAsset,
      });

      return {
        ...userAsset,
        ...userMarketAsset,
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
          ...ctx,
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
  getCoingeckoCoin: publicProcedure
    .input(
      z.object({
        coinGeckoId: z.string(),
      })
    )
    .query(({ input: { coinGeckoId } }) =>
      getAssetCoingeckoCoin({ coinGeckoId })
    ),
  getUserBridgeAsset: publicProcedure
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

        const bridgeAsset = getBridgeAsset(ctx.assetLists, asset);

        return await getAssetWithUserBalance({
          ...ctx,
          asset: bridgeAsset,
          userOsmoAddress,
        });
      }
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
                  getAssetPrice(asset.coinMinimalDenom)
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
        coinMinimalDenom: z.string(),
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
    .query(({ input: { coinMinimalDenom, timeFrame } }) =>
      getAssetHistoricalPrice({
        coinMinimalDenom,
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
  getImmersiveBridgeAssets: publicProcedure
    .input(
      GetInfiniteAssetsInputSchema.omit({
        categories: true,
        onlyVerified: true,
      })
        .merge(UserOsmoAddressSchema)
        .merge(
          z.object({
            variantsNotToBeExcluded: z.array(z.string()),
            prioritizedDenoms: z.array(z.string()),
            deprioritizedDenoms: z.array(z.string()),
            type: z.union([z.literal("deposit"), z.literal("withdraw")]),
          })
        )
    )
    .query(
      ({
        input: {
          search,
          userOsmoAddress,
          limit,
          cursor,
          includePreview,
          variantsNotToBeExcluded,
          prioritizedDenoms,
          deprioritizedDenoms,
          type,
        },
        ctx,
      }) =>
        maybeCachePaginatedItems({
          getFreshItems: async () => {
            let assets = await mapGetAssetsWithUserBalances({
              ...ctx,
              search,
              // Only get balances for withdraw
              userOsmoAddress:
                type === "withdraw" ? userOsmoAddress : undefined,
              sortFiatValueDirection: "desc",
              includePreview,
            });

            if (type === "withdraw") {
              const hasBalance = assets.some((asset) =>
                asset.amount?.toDec().isPositive()
              );

              assets = hasBalance
                ? assets
                    // Filter out all assets without amount
                    .filter((asset) => !isNil(asset.amount))
                : assets; // display all assets if no balance
            } else {
              // deposit

              assets = assets
                // Filter out all asset variants to encourage users to deposit and convert to the canonical asset
                .filter((asset) => {
                  if (
                    !isNil(asset.variantGroupKey) &&
                    !variantsNotToBeExcluded.includes(
                      asset.variantGroupKey as (typeof variantsNotToBeExcluded)[number]
                    )
                  ) {
                    return asset.variantGroupKey === asset.coinMinimalDenom;
                  }

                  return true;
                });
            }

            let marketAssets = await Promise.all(
              assets.map((asset) =>
                getAssetMarketActivity(asset)
                  .catch((e) => captureErrorAndReturn(e, undefined))
                  .then((marketAsset) => ({
                    ...asset,
                    volume24h: marketAsset ? marketAsset.volume24h : 0,
                  }))
              )
            );

            // avoid sorting while searching
            if (search) return assets;

            // Sort by volume 24h desc
            marketAssets = sort(marketAssets, "volume24h");

            // Sort by prioritized denoms
            return marketAssets
              .sort((a, b) => {
                const aIndex = prioritizedDenoms.indexOf(
                  a.coinDenom as (typeof prioritizedDenoms)[number]
                );
                const bIndex = prioritizedDenoms.indexOf(
                  b.coinDenom as (typeof prioritizedDenoms)[number]
                );

                if (aIndex === -1 && bIndex === -1) return 0; // Both not prioritized
                if (aIndex === -1) return 1; // a is not prioritized, b is
                if (bIndex === -1) return -1; // b is not prioritized, a is

                return aIndex - bIndex; // Both are prioritized, sort by their index
              })
              .sort((a, b) => {
                // Both not prioritized, check for deprioritized
                const aDeprioritizedIndex = deprioritizedDenoms.indexOf(
                  a.coinDenom as (typeof deprioritizedDenoms)[number]
                );
                const bDeprioritizedIndex = deprioritizedDenoms.indexOf(
                  b.coinDenom as (typeof deprioritizedDenoms)[number]
                );

                if (aDeprioritizedIndex === -1 && bDeprioritizedIndex === -1)
                  return 0; // Both not deprioritized
                if (aDeprioritizedIndex === -1) return -1; // a is not deprioritized, b is
                if (bDeprioritizedIndex === -1) return 1; // b is not deprioritized, a is

                return aDeprioritizedIndex - bDeprioritizedIndex; // Both are deprioritized, sort by their index
              }) as typeof assets;
          },
          cacheKey: JSON.stringify({
            search,
            userOsmoAddress,
            includePreview,
            variantsToBeExcluded: variantsNotToBeExcluded,
            prioritizedDenoms,
          }),
          cursor,
          limit,
        })
    ),
});
