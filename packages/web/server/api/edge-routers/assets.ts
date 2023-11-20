import { z } from "zod";

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
    amount: string;
    usdValue: string;
  }>;

export const assetsRouter = createTRPCRouter({
  getAssets: publicProcedure
    .input(
      GetAssetsSchema.extend({
        userOsmoAddress: z.string().startsWith("osmo").optional(),
      })
    )
    .query(
      async ({ input: { search, sort, userOsmoAddress, limit, cursor } }) => {
        const assets = await getAssets({ ...search, ...sort });

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
            const value = await getAssetPrice({ asset });
            return {
              ...asset,
              amount: balance.amount,
              usdValue: value ?? "0",
            };
          })
          .filter((a): a is Promise<MaybeUserAsset> => !!a);

        const userAssets = await Promise.all(eventualUserAssets);

        // if no sorting path provided, sort by usdValue at head of list
        // otherwise sort by provided path with user asset info still included
        if (!sort?.keyPath) {
          const sortDir = sort?.direction ?? "desc";

          userAssets.sort((a, b) => {
            const aVal = Number(a?.usdValue ?? 0);
            const bVal = Number(b?.usdValue ?? 0);

            if (sortDir === "desc") {
              return bVal - aVal;
            } else {
              return aVal - bVal;
            }
          });
        }

        return maybeCursorPaginatedItems(userAssets, cursor, limit);
      }
    ),
});
