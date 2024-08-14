import { CoinPretty, Dec, DecUtils, Int, RatePretty } from "@keplr-wallet/unit";
import type { SplitTokenInQuote } from "@osmosis-labs/pools";
import {
  availableRoutersSchema,
  captureIfError,
  getAsset,
  getCosmwasmPoolTypeFromCodeId,
  getRouters,
  Pool,
} from "@osmosis-labs/server";
import {
  makeSplitRoutesSwapExactAmountInMsg,
  makeSwapExactAmountInMsg,
} from "@osmosis-labs/tx";
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

        /**
         * Required to get swap messages for the user.
         */
        maxSlippage: z.string().optional(),
        userOsmoAddress: z.string().optional(),
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
          maxSlippage,
          userOsmoAddress,
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

        const resultQuote = {
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

        const swapMessages = await getSwapMessages({
          quote: resultQuote,
          tokenInCoinMinimalDenom: tokenInDenom,
          tokenOutCoinDecimals: tokenOutAsset.coinDecimals,
          maxSlippage,
          coinAmount: tokenInAmount,
          userOsmoAddress,
        });

        return { ...resultQuote, messages: swapMessages };
      }
    ),
});

export function getSwapTxParameters({
  coinAmount,
  maxSlippage,
  quote,
  tokenInCoinMinimalDenom,
  tokenOutCoinDecimals,
}: {
  coinAmount: string;
  maxSlippage: string;
  quote:
    | { split: ReturnType<typeof makeDisplayableSplit>; amount: CoinPretty }
    | undefined;
  tokenInCoinMinimalDenom: string;
  tokenOutCoinDecimals: number;
}) {
  if (!quote) {
    throw new Error(
      "User input should be disabled if no route is found or is being generated"
    );
  }
  if (!coinAmount) throw new Error("No input");
  if (!tokenInCoinMinimalDenom) throw new Error("No from asset");
  if (!tokenOutCoinDecimals) throw new Error("No to asset");

  /**
   * Prepare swap data
   */

  type Pool = {
    id: string;
    tokenOutDenom: string;
  };
  type Route = {
    pools: Pool[];
    tokenInAmount: string;
  };

  const routes: Route[] = [];

  for (const route of quote.split) {
    const pools: Pool[] = [];

    for (let i = 0; i < route.pools.length; i++) {
      const pool = route.pools[i];

      pools.push({
        id: pool.id,
        tokenOutDenom: route.tokenOutDenoms[i],
      });
    }

    routes.push({
      pools: pools,
      tokenInAmount: route.initialAmount.toString(),
    });
  }

  /** In amount converted to integer (remove decimals) */
  const tokenIn = {
    coinMinimalDenom: tokenInCoinMinimalDenom,
    amount: coinAmount,
  };

  /** Out amount with slippage included */
  const tokenOutMinAmount = quote.amount
    .toDec()
    .mul(DecUtils.getTenExponentNInPrecisionRange(tokenOutCoinDecimals))
    .mul(new Dec(1).sub(new Dec(maxSlippage)))
    .truncate()
    .toString();

  return {
    routes,
    tokenIn,
    tokenOutMinAmount,
  };
}

async function getSwapMessages({
  coinAmount,
  maxSlippage,
  quote,
  tokenInCoinMinimalDenom,
  tokenOutCoinDecimals,
  userOsmoAddress,
}: {
  coinAmount: string;
  maxSlippage: string | undefined;
  quote:
    | { split: ReturnType<typeof makeDisplayableSplit>; amount: CoinPretty }
    | undefined;
  tokenInCoinMinimalDenom: string;
  tokenOutCoinDecimals: number;
  userOsmoAddress: string | undefined;
}) {
  if (!userOsmoAddress || !quote || !maxSlippage) return undefined;

  let txParams: ReturnType<typeof getSwapTxParameters>;

  try {
    txParams = getSwapTxParameters({
      coinAmount,
      maxSlippage,
      tokenInCoinMinimalDenom,
      tokenOutCoinDecimals,
      quote,
    });
  } catch {
    return undefined;
  }

  const { routes, tokenIn, tokenOutMinAmount } = txParams;

  const { pools } = routes[0];

  if (routes.length < 1) {
    throw new Error("Routes are empty");
  }

  return [
    routes.length === 1
      ? await makeSwapExactAmountInMsg({
          pools,
          tokenIn,
          tokenOutMinAmount,
          userOsmoAddress,
        })
      : await makeSplitRoutesSwapExactAmountInMsg({
          routes,
          tokenIn,
          tokenOutMinAmount,
          userOsmoAddress,
        }),
  ];
}

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
