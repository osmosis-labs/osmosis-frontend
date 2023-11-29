import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { DEFAULT_VS_CURRENCY } from "~/config/price";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAssetPrice, getAssets } from "~/server/queries/complex/assets";
import {
  SearchSchema,
  SortSchema,
} from "~/server/queries/complex/parameter-types";
import { queryBalances } from "~/server/queries/cosmos";

import { maybeCursorPaginatedItems } from "../utils";
import { InfiniteQuerySchema } from "../zod-types";

const GetAssetsSchema = InfiniteQuerySchema.extend({
  search: SearchSchema.optional(),
  sort: SortSchema.optional(),
  matchDenom: z.string().optional(),
});

type Asset = Awaited<ReturnType<typeof getAssets>>[number];

/** An Asset with basic user info included. */
export type MaybeUserAsset = Asset &
  Partial<{
    amount: CoinPretty;
    usdValue: PricePretty;
  }>;

export const assetsRouter = createTRPCRouter({
  getAssets: publicProcedure
    .input(
      GetAssetsSchema.extend({
        userOsmoAddress: z.string().startsWith("osmo").optional(),
      })
    )
    .query(
      async ({
        input: { search, sort, matchDenom, userOsmoAddress, limit, cursor },
      }): Promise<{ items: MaybeUserAsset[]; nextCursor: number }> => {
        const assets = await getAssets({ search, sort, matchDenom });

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
            const usdPrice = await getAssetPrice({ asset });

            const usdValue = usdPrice
              ? new PricePretty(
                  DEFAULT_VS_CURRENCY,
                  new Dec(balance.amount)
                    .quo(DecUtils.getTenExponentN(asset.coinDecimals))
                    .mul(usdPrice)
                )
              : undefined;
            return {
              ...asset,
              amount: new CoinPretty(asset, balance.amount),
              usdValue,
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
});
