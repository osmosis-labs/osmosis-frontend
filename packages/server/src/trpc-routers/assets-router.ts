import { PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import {
  AssetFilterSchema,
  getAsset,
  getAssetHistoricalPrice,
  getAssetMarketActivity,
  getAssetPrice,
  getAssetWithUserBalance,
  getMarketAsset,
  getPoolAssetPairHistoricalPrice,
  getUserAssetsTotalValue,
  mapGetAssetsWithUserBalances,
  mapGetMarketAssets,
} from "../queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "../queries/complex/assets/config";
import { getCoinGeckoCoinMarketChart } from "../queries/complex/assets/price/historical";
import { UserOsmoAddressSchema } from "../queries/complex/parameter-types";
import {
  AvailableRangeValues,
  AvailableTimeDurations,
  TimeFrame,
} from "../queries/data-services";
import { TimeDuration } from "../queries/data-services";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { captureErrorAndReturn } from "../utils/error";
import { maybeCachePaginatedItems } from "../utils/pagination";
import { createSortSchema, sort } from "../utils/sort";
import { InfiniteQuerySchema } from "../utils/zod-types";

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
    .input(GetInfiniteAssetsInputSchema.merge(UserOsmoAddressSchema))
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
            }),
          cacheKey: JSON.stringify({
            search,
            userOsmoAddress,
            onlyVerified,
            includePreview,
            categories,
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
          /** List of symbols or min denoms to be lifted to front of results if not searching or sorting. */
          preferredDenoms: z.array(z.string()).optional(),
          sort: createSortSchema([
            "currentPrice",
            "marketCap",
            "volume24h",
          ] as const).optional(),
        })
      )
    )
    .query(
      ({
        input: {
          search,
          onlyVerified,
          preferredDenoms,
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
            const isDefaultSort = !sortInput && !search;

            let assets = await mapGetMarketAssets({
              ...ctx,
              search,
              onlyVerified,
              includePreview,
              categories,
            });

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

                return 0;
              });
            }

            if (sortInput) {
              assets = sort(assets, sortInput.keyPath, sortInput.direction);
            }

            // Can be searching and/or sorting
            return assets;
          },
          cacheKey: JSON.stringify({
            search,
            onlyVerified,
            preferredDenoms,
            sort: sortInput,
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
          /** List of symbols or min denoms to be lifted to front of results if not searching or sorting. */
          preferredDenoms: z.array(z.string()).optional(),
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
          preferredDenoms,
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
            const isDefaultSort = !sortInput && !search;

            let assets = await mapGetAssetsWithUserBalances({
              ...ctx,
              search,
              categories,
              userOsmoAddress,
              includePreview,
              sortFiatValueDirection: isDefaultSort
                ? "desc"
                : !search && sortInput && sortInput.keyPath === "usdValue"
                ? sortInput.direction
                : undefined,
            });

            // Filter out assets with zero balance if not searching
            if (!search) {
              assets = assets.filter((asset) =>
                asset.amount?.toDec().isPositive()
              );
            }

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

                return 0;
              });
            }

            let priceAssets = await Promise.all(
              assets.map(async (asset) => {
                const [currentPrice, priceChange24h] = await Promise.all([
                  getAssetPrice({ ...ctx, asset })
                    .then(
                      (price) => new PricePretty(DEFAULT_VS_CURRENCY, price)
                    )
                    .catch((e) =>
                      captureErrorAndReturn(
                        e,
                        new PricePretty(DEFAULT_VS_CURRENCY, 0)
                      )
                    ),
                  getAssetMarketActivity({
                    coinDenom: asset.coinDenom,
                  }).then((activity) => activity?.price24hChange),
                ]);

                return {
                  ...asset,
                  currentPrice,
                  priceChange24h,
                };
              })
            );

            if (sortInput && sortInput.keyPath !== "usdValue") {
              priceAssets = sort(
                priceAssets,
                sortInput.keyPath,
                sortInput.direction
              );
            }

            return priceAssets;
          },
          cacheKey: JSON.stringify({
            search,
            onlyVerified,
            userOsmoAddress,
            preferredDenoms,
            sort: sortInput,
            categories,
            includePreview,
          }),
          cursor,
          limit,
        })
    ),
  getUserAssetsTotalValue: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(({ input, ctx }) => getUserAssetsTotalValue({ ...ctx, ...input })),
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
});
