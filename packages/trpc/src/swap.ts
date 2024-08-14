import { CoinPretty, Int, RatePretty } from "@keplr-wallet/unit";
import type {
  SplitTokenInQuote,
  SplitTokenOutQuote,
} from "@osmosis-labs/pools";
import {
  availableRoutersSchema,
  captureIfError,
  getAsset,
  getCosmwasmPoolTypeFromCodeId,
  getRouters,
  Pool,
} from "@osmosis-labs/server";
import { AssetList } from "@osmosis-labs/types";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const swapRouter = createTRPCRouter({
  routeTokenOutGivenIn: publicProcedure
    .input(
      z.object({
        tokenInDenom: z.string(),
        tokenInAmount: z.string(),
        tokenOutDenom: z.string(),
        preferredRouter: availableRoutersSchema,
        forcePoolId: z.string().optional(),
      })
    )
    .query(
      async ({
        input: {
          tokenInDenom,
          tokenInAmount,
          tokenOutDenom,
          preferredRouter,
          forcePoolId,
        },
        ctx,
      }) => {
        const osmosisChainId = ctx.chainList[0].chain_id;

        const routers = getRouters(
          osmosisChainId,
          ctx.assetLists,
          ctx.chainList
        );

        const { name, router } = routers.find(
          ({ name }) => name === preferredRouter
        )!;

        // send to router
        const startTime = Date.now();
        const quote = await router.routeByTokenIn(
          {
            denom: tokenInDenom,
            amount: new Int(tokenInAmount),
          },
          tokenOutDenom,
          forcePoolId
        );
        const timeMs = Date.now() - startTime;

        const tokenOutAsset = getAsset({
          ...ctx,
          anyDenom: tokenOutDenom,
        });

        return {
          ...quote,
          split: makeDisplayableSplit(quote.split, ctx.assetLists),
          // supplementary data with display types
          name,
          timeMs,
          amount: new CoinPretty(tokenOutAsset, quote.amount),
          priceImpactTokenOut: quote.priceImpactTokenOut
            ? new RatePretty(quote.priceImpactTokenOut.abs())
            : undefined,
          swapFee: quote.swapFee ? new RatePretty(quote.swapFee) : undefined,
        };
      }
    ),
  routeTokenInGivenOut: publicProcedure
    .input(
      z.object({
        tokenInDenom: z.string(),
        tokenOutAmount: z.string(),
        tokenOutDenom: z.string(),
        preferredRouter: availableRoutersSchema,
        forcePoolId: z.string().optional(),
      })
    )
    .query(
      async ({
        input: {
          tokenInDenom,
          tokenOutAmount,
          tokenOutDenom,
          preferredRouter,
          forcePoolId,
        },
        ctx,
      }) => {
        const osmosisChainId = ctx.chainList[0].chain_id;

        const routers = getRouters(
          osmosisChainId,
          ctx.assetLists,
          ctx.chainList
        );

        const { name, router } = routers.find(
          ({ name }) => name === preferredRouter
        )!;

        // send to router
        const startTime = Date.now();

        const quote = await router.routeByTokenOut(
          {
            denom: tokenOutDenom,
            amount: new Int(tokenOutAmount),
          },
          tokenInDenom,
          forcePoolId
        );

        const timeMs = Date.now() - startTime;

        const tokenInAsset = getAsset({
          ...ctx,
          anyDenom: tokenInDenom,
        });
        return {
          ...quote,
          split: makeDisplayableOutGivenInSplit(quote.split, ctx.assetLists),
          // supplementary data with display types
          name,
          timeMs,
          amount: new CoinPretty(tokenInAsset, quote.amount),
          priceImpactTokenOut: quote.priceImpactTokenOut
            ? new RatePretty(quote.priceImpactTokenOut.abs())
            : undefined,
          swapFee: quote.swapFee ? new RatePretty(quote.swapFee) : undefined,
        };
      }
    ),
});

/** Get pool type, in, and out currency for displaying the route in detail. */
function makeDisplayableSplit(
  split: SplitTokenInQuote["split"],
  assetLists: AssetList[]
) {
  return split.map((existingSplit) => {
    const { pools, tokenInDenom, tokenOutDenoms } = existingSplit;
    const poolsWithInfos = pools.map((pool_, index) => {
      let type: Pool["type"] = pool_.type as Pool["type"];

      if (pool_?.codeId) {
        type = getCosmwasmPoolTypeFromCodeId(pool_.codeId);
      }

      const inAsset = captureIfError(() =>
        getAsset({
          assetLists,
          anyDenom: index === 0 ? tokenInDenom : tokenOutDenoms[index - 1],
        })
      );
      const outAsset = captureIfError(() =>
        getAsset({
          assetLists,
          anyDenom: tokenOutDenoms[index],
        })
      );

      return {
        id: pool_.id,
        type,
        spreadFactor: new RatePretty(pool_.swapFee ? pool_.swapFee : 0),
        dynamicSpreadFactor: type === "cosmwasm-astroport-pcl",
        inCurrency: inAsset,
        outCurrency: outAsset,
      };
    });

    return {
      ...existingSplit,
      pools: poolsWithInfos,
    };
  });
}

/** Get pool type, in, and out currency for displaying the route in detail. */
function makeDisplayableOutGivenInSplit(
  split: SplitTokenOutQuote["split"],
  assetLists: AssetList[]
) {
  return split.map((existingSplit) => {
    const { pools, tokenInDenoms, tokenOutDenom } = existingSplit;
    const poolsWithInfos = pools.map((pool_, index) => {
      let type: Pool["type"] = pool_.type as Pool["type"];

      if (pool_?.codeId) {
        type = getCosmwasmPoolTypeFromCodeId(pool_.codeId);
      }

      const inAsset = captureIfError(() =>
        getAsset({
          assetLists,
          anyDenom: tokenInDenoms[index],
        })
      );
      const outAsset = captureIfError(() =>
        getAsset({
          assetLists,
          anyDenom:
            index === pools.length - 1
              ? tokenOutDenom
              : tokenInDenoms[index + 1],
        })
      );

      return {
        id: pool_.id,
        type,
        spreadFactor: new RatePretty(pool_.swapFee ? pool_.swapFee : 0),
        dynamicSpreadFactor: type === "cosmwasm-astroport-pcl",
        inCurrency: inAsset,
        outCurrency: outAsset,
      };
    });

    return {
      ...existingSplit,
      pools: poolsWithInfos,
    };
  });
}
