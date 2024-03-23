import { PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import {
  AssetFilterSchema,
  getAsset,
  getAssetHistoricalPrice,
  getAssetPrice,
  getMarketAsset,
  getPoolAssetPairHistoricalPrice,
  getUserAssetCoin,
  getUserAssetsBreakdown,
  mapGetMarketAssets,
  mapGetUserAssetCoins,
} from "../queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "../queries/complex/assets/config";
import { getCoinGeckoCoinMarketChart } from "../queries/complex/assets/price/providers/coingecko";
import { UserOsmoAddressSchema } from "../queries/complex/parameter-types";
import {
  AvailableRangeValues,
  AvailableTimeDurations,
  TimeFrame,
} from "../queries/data-services";
import { TimeDuration } from "../queries/data-services";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { compareDec, compareMemberDefinition } from "../utils/compare";
import { captureErrorAndReturn } from "../utils/error";
import { maybeCachePaginatedItems } from "../utils/pagination";
import { createSortSchema, sort } from "../utils/sort";
import { InfiniteQuerySchema } from "../utils/zod-types";

const GetInfiniteAssetsInputSchema = InfiniteQuerySchema.merge(
  AssetFilterSchema
).merge(UserOsmoAddressSchema);

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

        return await getUserAssetCoin({
          ...ctx,
          asset,
          userOsmoAddress,
        });
      }
    ),
  getUserAssets: publicProcedure
    .input(GetInfiniteAssetsInputSchema)
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
            mapGetUserAssetCoins({
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
  getMarketAsset: publicProcedure
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

        const userAsset = await getUserAssetCoin({
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
  getUserMarketAssets: publicProcedure
    .input(
      GetInfiniteAssetsInputSchema.merge(
        z.object({
          /** List of symbols or min denoms to be lifted to front of results if not searching or sorting. */
          preferredDenoms: z.array(z.string()).optional(),
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

            let assets;
            assets = await mapGetMarketAssets({
              ...ctx,
              search,
              onlyVerified,
              includePreview,
              categories,
            });

            assets = await mapGetUserAssetCoins({
              ...ctx,
              assets,
              userOsmoAddress,
              includePreview,
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

                // Sort by market cap as long as there's no user fiat balance
                // Assets with fiat balances will remain sorted as they are
                if (!assetA.usdValue && !assetB.usdValue) {
                  const marketCapDefinedCompare = compareMemberDefinition(
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
            categories,
            includePreview,
          }),
          cursor,
          limit,
        })
    ),
  getUserAssetsBreakdown: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(({ input, ctx }) => getUserAssetsBreakdown({ ...ctx, ...input })),
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
