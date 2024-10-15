import { CoinPretty, Int, RatePretty } from "@keplr-wallet/unit";
import type {
  SplitTokenInQuote,
  SplitTokenOutQuote,
} from "@osmosis-labs/pools";
import {
  captureIfError,
  getAsset,
  getCosmwasmPoolTypeFromCodeId,
  getSidecarRouter,
  Pool,
} from "@osmosis-labs/server";
import { AssetList, Chain } from "@osmosis-labs/types";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

// Add this type definition
type SwapContext = {
  assetLists: AssetList[];
  chainList: Chain[];
  opentelemetryServiceName: string | undefined;
};

// Add this new function
async function getTokenOutGivenInQuote(
  tokenInDenom: string,
  tokenInAmount: string,
  tokenOutDenom: string,
  forcePoolId: string | undefined,
  ctx: SwapContext
) {
  const router = getSidecarRouter();

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

export const swapRouter = createTRPCRouter({
  routeTokenOutGivenIn: publicProcedure
    .input(
      z.object({
        tokenInDenom: z.string(),
        tokenInAmount: z.string(),
        tokenOutDenom: z.string(),
        forcePoolId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      return getTokenOutGivenInQuote(
        input.tokenInDenom,
        input.tokenInAmount,
        input.tokenOutDenom,
        input.forcePoolId,
        ctx
      );
    }),

  routeTokenInGivenOut: publicProcedure
    .input(
      z.object({
        tokenInDenom: z.string(),
        tokenOutAmount: z.string(),
        tokenOutDenom: z.string(),
        forcePoolId: z.string().optional(),
      })
    )
    .query(
      async ({
        input: { tokenInDenom, tokenOutAmount, tokenOutDenom, forcePoolId },
        ctx,
      }) => {
        const router = getSidecarRouter();

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
  // TODO - this will sometimes fail, ex wBTC - figure out why
  routeTokensOutGivenIn: publicProcedure
    .input(
      z.array(
        z.object({
          tokenInDenom: z.string(),
          tokenInAmount: z.string(),
          tokenOutDenom: z.string(),
          forcePoolId: z.string().optional(),
        })
      )
    )
    .query(async ({ input, ctx }) => {
      const quotes = await Promise.all(
        input.map(
          ({ tokenInDenom, tokenInAmount, tokenOutDenom, forcePoolId }) =>
            getTokenOutGivenInQuote(
              tokenInDenom,
              tokenInAmount,
              tokenOutDenom,
              forcePoolId,
              ctx
            )
        )
      );

      return quotes;
    }),
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
