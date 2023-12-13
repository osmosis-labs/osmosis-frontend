import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { RecommendedSwapDenoms } from "~/config/feature-flag";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  calcAssetValue,
  getAsset,
  getAssetPrice,
  getAssets,
} from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import {
  SearchSchema,
  SortSchema,
} from "~/server/queries/complex/parameter-types";
import { queryBalances } from "~/server/queries/cosmos";

import { maybeCursorPaginatedItems } from "../utils";
import { InfiniteQuerySchema } from "../zod-types";

export type Asset = Awaited<ReturnType<typeof getAssets>>[number];

/** An Asset with basic user info included. */
export type MaybeUserAsset = Asset &
  Partial<{
    amount: CoinPretty;
    usdValue: PricePretty;
  }>;

export const assetsRouter = createTRPCRouter({
  getAssets: publicProcedure
    .input(
      InfiniteQuerySchema.extend({
        search: SearchSchema.optional(),
        sort: SortSchema.optional(),
        findMinDenomOrSymbol: z.string().optional(),
        userOsmoAddress: z.string().startsWith("osmo").optional(),
      })
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

        const { balances } = await queryBalances(userOsmoAddress);

        const eventualUserAssets = assets
          .map(async (asset) => {
            const balance = balances.find(
              (a) => a.denom === asset.coinMinimalDenom
            );

            // not a user asset
            if (!balance) return asset;

            // is user asset, include user data
            const usdValue = await calcAssetValue({
              anyDenom: asset.coinMinimalDenom,
              amount: balance.amount,
            }).catch(() => {
              console.error(
                asset.coinMinimalDenom,
                "likely missing price config"
              );
            });

            return {
              ...asset,
              amount: new CoinPretty(asset, balance.amount),
              usdValue: usdValue
                ? new PricePretty(DEFAULT_VS_CURRENCY, usdValue)
                : undefined,
            };
          })
          .filter((a): a is Promise<MaybeUserAsset> => !!a);

        const userAssets = await Promise.all(eventualUserAssets);

        // if no sorting path provided, sort by usdValue at head of list
        // otherwise sort by provided path with user asset info still included
        if (!sort?.keyPath && !search) {
          const sortDir = sort?.direction ?? "desc";

          userAssets.sort((a, b) => {
            if (!Boolean(a.usdValue) && !Boolean(b.usdValue)) return 0;
            if (Boolean(a.usdValue) && !Boolean(b.usdValue)) return -1;
            if (!Boolean(a.usdValue) && Boolean(b.usdValue)) return 1;
            if (sortDir === "desc") {
              const n = Number(
                b.usdValue!.toDec().sub(a.usdValue!.toDec()).toString()
              );
              if (isNaN(n)) return 0;
              else return n;
            } else {
              const n = Number(
                a.usdValue!.toDec().sub(b.usdValue!.toDec()).toString()
              );
              if (isNaN(n)) return 0;
              else return n;
            }
          });
        }

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
});
