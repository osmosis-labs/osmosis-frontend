import { Dec, DecUtils } from "@keplr-wallet/unit";
import type { swapRouter } from "@osmosis-labs/trpc";
import { isNil } from "@osmosis-labs/utils";
import type { inferRouterOutputs } from "@trpc/server";

import {
  makeSplitRoutesSwapExactAmountInMsg,
  makeSplitRoutesSwapExactAmountOutMsg,
  makeSwapExactAmountInMsg,
  makeSwapExactAmountOutMsg,
} from "../osmosis";

type RouterOutputs = inferRouterOutputs<typeof swapRouter>;
export type SwapTxPoolOutGivenIn = {
  id: string;
  tokenOutDenom: string;
};
export type SwapTxRouteOutGivenIn = {
  pools: SwapTxPoolOutGivenIn[];
  tokenInAmount: string;
};

export type SwapTxPoolInGivenOut = {
  id: string;
  tokenInDenom: string;
};
export type SwapTxRouteInGivenOut = {
  pools: SwapTxPoolInGivenOut[];
  tokenOutAmount: string;
};

export type QuoteType = "out-given-in" | "in-given-out";

type QuoteOutGivenIn = Omit<RouterOutputs["routeTokenOutGivenIn"], "name">;
type QuoteInGivenOut = Omit<RouterOutputs["routeTokenInGivenOut"], "name">;
type RouteOutGivenIn = QuoteOutGivenIn["split"][number];
type RouteInGivenOut = QuoteInGivenOut["split"][number];

export function getSwapTxParameters({
  coinAmount,
  maxSlippage,
  quote,
  tokenInCoinMinimalDenom,
  tokenOutCoinMinimalDenom,
  tokenInCoinDecimals,
  tokenOutCoinDecimals,
  quoteType,
}: {
  coinAmount: string;
  maxSlippage: string;
  quote: QuoteOutGivenIn | QuoteInGivenOut | undefined;
  tokenInCoinMinimalDenom: string;
  tokenOutCoinMinimalDenom: string;
  tokenInCoinDecimals: number;
  tokenOutCoinDecimals: number;
  quoteType: QuoteType;
}) {
  if (isNil(quote)) {
    throw new Error(
      "User input should be disabled if no route is found or is being generated"
    );
  }
  if (isNil(coinAmount)) throw new Error("No input");
  if (isNil(tokenInCoinMinimalDenom)) throw new Error("No from asset");
  if (isNil(tokenOutCoinDecimals)) throw new Error("No to asset");

  if (quoteType === "out-given-in") {
    const routes: SwapTxRouteOutGivenIn[] = [];

    for (const route of quote.split) {
      const pools: SwapTxPoolOutGivenIn[] = [];
      const typedRoute = route as RouteOutGivenIn;
      for (let i = 0; i < route.pools.length; i++) {
        const pool = route.pools[i];

        pools.push({
          id: pool.id,
          tokenOutDenom: typedRoute.tokenOutDenoms[i],
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
  } else {
    const routes: SwapTxRouteInGivenOut[] = [];

    for (const route of quote.split) {
      const pools: SwapTxPoolInGivenOut[] = [];
      const typedRoute = route as RouteInGivenOut;

      for (let i = 0; i < route.pools.length; i++) {
        const pool = route.pools[i];
        pools.push({
          id: pool.id,
          tokenInDenom: typedRoute.tokenInDenoms[i],
        });
      }

      routes.push({
        pools: pools,
        tokenOutAmount: route.initialAmount.toString(),
      });
    }

    /** In amount converted to integer (remove decimals) */
    const tokenOut = {
      coinMinimalDenom: tokenOutCoinMinimalDenom,
      amount: coinAmount,
    };

    /** Out amount with slippage included */
    const tokenInMaxAmount = quote.amount
      .toDec()
      .mul(DecUtils.getTenExponentNInPrecisionRange(tokenInCoinDecimals))
      .mul(new Dec(1).add(new Dec(maxSlippage)))
      .truncate()
      .toString();

    return {
      routes,
      tokenOut,
      tokenInMaxAmount,
    };
  }
}

export async function getSwapMessages({
  coinAmount,
  maxSlippage,
  quote,
  tokenInCoinMinimalDenom,
  tokenOutCoinMinimalDenom,
  tokenInCoinDecimals,
  tokenOutCoinDecimals,
  userOsmoAddress,
  quoteType = "out-given-in",
}: {
  coinAmount: string;
  maxSlippage: string | undefined;
  quote: QuoteOutGivenIn | QuoteInGivenOut | undefined;
  tokenInCoinMinimalDenom: string;
  tokenOutCoinMinimalDenom: string;
  tokenOutCoinDecimals: number;
  tokenInCoinDecimals: number;
  userOsmoAddress: string | undefined;
  quoteType?: QuoteType;
}) {
  if (!userOsmoAddress || !quote || !maxSlippage) return undefined;

  let txParams: ReturnType<typeof getSwapTxParameters>;

  try {
    txParams = getSwapTxParameters({
      coinAmount,
      maxSlippage,
      tokenInCoinMinimalDenom,
      tokenOutCoinMinimalDenom,
      tokenOutCoinDecimals,
      tokenInCoinDecimals,
      quote,
      quoteType,
    });
  } catch {
    return undefined;
  }

  if (quoteType === "out-given-in") {
    const { routes, tokenIn, tokenOutMinAmount } = txParams;

    const typedRoutes = routes as SwapTxRouteOutGivenIn[];
    const { pools } = typedRoutes[0];

    if (routes.length < 1) {
      throw new Error("Routes are empty");
    }

    return [
      routes.length === 1
        ? await makeSwapExactAmountInMsg({
            pools,
            tokenIn: tokenIn!,
            tokenOutMinAmount: tokenOutMinAmount!,
            userOsmoAddress,
          })
        : await makeSplitRoutesSwapExactAmountInMsg({
            routes: typedRoutes,
            tokenIn: tokenIn!,
            tokenOutMinAmount: tokenOutMinAmount!,
            userOsmoAddress,
          }),
    ];
  }

  if (quoteType === "in-given-out") {
    const { routes, tokenOut, tokenInMaxAmount } = txParams;

    const typedRoutes = routes as SwapTxRouteInGivenOut[];
    const { pools } = typedRoutes[0];

    if (routes.length < 1) {
      throw new Error("Routes are empty");
    }

    return [
      routes.length === 1
        ? await makeSwapExactAmountOutMsg({
            pools,
            tokenOut: tokenOut!,
            tokenInMaxAmount: tokenInMaxAmount!,
            userOsmoAddress,
          })
        : await makeSplitRoutesSwapExactAmountOutMsg({
            routes: typedRoutes,
            tokenOut: tokenOut!,
            tokenInMaxAmount: tokenInMaxAmount!,
            userOsmoAddress,
          }),
    ];
  }

  throw new Error(`Unsupported quote type ${quoteType}`);
}
