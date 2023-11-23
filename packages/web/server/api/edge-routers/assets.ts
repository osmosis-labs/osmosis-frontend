import { Dec, DecUtils, Int, PricePretty } from "@keplr-wallet/unit";
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
});

/** An Asset with basic user info included. */
export type MaybeUserAsset = Awaited<ReturnType<typeof getAssets>>[number] &
  Partial<{
    amount: Int;
    usdValue: Dec;
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
        input: { search, sort, userOsmoAddress, limit, cursor },
      }): Promise<{ items: MaybeUserAsset[]; nextCursor: number }> => {
        const assets = await getAssets({ search, sort });

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
              amount: new Int(balance.amount),
              usdValue,
            };
          })
          .filter((a): a is Promise<MaybeUserAsset> => !!a);

        const userAssets = await Promise.all(eventualUserAssets);

        // if no sorting path provided, sort by usdValue at head of list
        // otherwise sort by provided path with user asset info still included
        if (!sort?.keyPath) {
          const sortDir = sort?.direction ?? "desc";

          userAssets.sort((a, b) => {
            if (!a.usdValue || !b.usdValue) return 0;
            if (sortDir === "desc") {
              const n = Number(b.usdValue.sub(a.usdValue).toString());
              if (isNaN(n)) return 0;
              else return n;
            } else {
              const n = Number(a.usdValue.sub(b.usdValue).toString());
              if (isNaN(n)) return 0;
              else return n;
            }
          });
        }

        return maybeCursorPaginatedItems(userAssets, cursor, limit);
      }
    ),
});
