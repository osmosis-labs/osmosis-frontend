import { Dec, Int } from "@keplr-wallet/unit";
import type {
  Quote,
  RoutablePool,
  RouteWithInAmount,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";

import { decodePool, EncodedPool, encodePool } from "./pool";

// REQUESTS

export type EncodedRouteByTokenInParameters = [
  tokenIn: { denom: string; amount: string },
  tokenOutDenom: string
];

export function encodeRouteByTokenInParameters(
  params: Parameters<TokenOutGivenInRouter["routeByTokenIn"]>
): EncodedRouteByTokenInParameters {
  return [
    {
      denom: params[0].denom,
      amount: params[0].amount.toString(),
    },
    params[1],
  ];
}

export function decodeRouteByTokenInParameters(
  params: EncodedRouteByTokenInParameters
): Parameters<TokenOutGivenInRouter["routeByTokenIn"]> {
  return [
    {
      denom: params[0].denom,
      amount: new Int(params[0].amount),
    },
    params[1],
  ];
}

// they happen to be the same
export type EncodedGetOptimizedRoutesByTokenInParameters =
  EncodedRouteByTokenInParameters;

export function encodeGetOptimizedRoutesByTokenInParameters(
  params: Parameters<TokenOutGivenInRouter["getOptimizedRoutesByTokenIn"]>
): EncodedGetOptimizedRoutesByTokenInParameters {
  return encodeRouteByTokenInParameters(params);
}

export function decodeGetOptimizedRoutesByTokenInParameters(
  params: EncodedGetOptimizedRoutesByTokenInParameters
): Parameters<TokenOutGivenInRouter["getOptimizedRoutesByTokenIn"]> {
  return decodeRouteByTokenInParameters(params);
}

export type EncodedRouteWithInAmount = {
  initialAmount: string;
  pools: EncodedPool[];
  tokenOutDenoms: string[];
  tokenInDenom: string;
};

export function encodeRouteWithInAmount(
  route: RouteWithInAmount
): EncodedRouteWithInAmount {
  return {
    ...route,
    initialAmount: route.initialAmount.toString(),
    pools: route.pools.reduce((acc, pool) => {
      const encodedPool = encodePool(pool);
      if (encodedPool) {
        acc.push(encodedPool);
      }
      return acc;
    }, [] as EncodedPool[]),
  };
}

export function decodeRouteWithInAmount(
  route: EncodedRouteWithInAmount
): RouteWithInAmount {
  return {
    ...route,
    initialAmount: new Int(route.initialAmount),
    pools: route.pools.reduce((acc, pool) => {
      const encodedPool = decodePool(pool);
      if (encodedPool) {
        acc.push(encodedPool);
      }
      return acc;
    }, [] as RoutablePool[]),
  };
}

export type EncodedCalculateTokenOutByTokenInParameters = [
  routes: EncodedRouteWithInAmount[]
];

export function encodeCalculateTokenOutByTokenInParameters(
  params: Parameters<TokenOutGivenInRouter["calculateTokenOutByTokenIn"]>
): EncodedCalculateTokenOutByTokenInParameters {
  return [params[0].map(encodeRouteWithInAmount)];
}

export function decodeCalculateTokenOutByTokenInParameters(
  params: EncodedCalculateTokenOutByTokenInParameters
): Parameters<TokenOutGivenInRouter["calculateTokenOutByTokenIn"]> {
  return [params[0].map(decodeRouteWithInAmount)];
}

// RESPONSES

export type EncodedQuote = {
  amount: string;
  beforeSpotPriceInOverOut: string;
  beforeSpotPriceOutOverIn: string;
  afterSpotPriceInOverOut: string;
  afterSpotPriceOutOverIn: string;
  effectivePriceInOverOut: string;
  effectivePriceOutOverIn: string;
  /** Generally a positive number. */
  priceImpactTokenOut: string;

  /** If relevant, the number of ticks crossed to generate this quote. */
  numTicksCrossed: number | undefined;
};

export function encodeQuote(quote: Quote): EncodedQuote {
  return {
    amount: quote.amount.toString(),
    beforeSpotPriceInOverOut: quote.beforeSpotPriceInOverOut.toString(),
    beforeSpotPriceOutOverIn: quote.beforeSpotPriceOutOverIn.toString(),
    afterSpotPriceInOverOut: quote.afterSpotPriceInOverOut.toString(),
    afterSpotPriceOutOverIn: quote.afterSpotPriceOutOverIn.toString(),
    effectivePriceInOverOut: quote.effectivePriceInOverOut.toString(),
    effectivePriceOutOverIn: quote.effectivePriceOutOverIn.toString(),
    priceImpactTokenOut: quote.priceImpactTokenOut.toString(),
    numTicksCrossed: quote.numTicksCrossed,
  };
}

export function decodeQuote(quote: EncodedQuote): Quote {
  return {
    amount: new Int(quote.amount),
    beforeSpotPriceInOverOut: new Dec(quote.beforeSpotPriceInOverOut),
    beforeSpotPriceOutOverIn: new Dec(quote.beforeSpotPriceOutOverIn),
    afterSpotPriceInOverOut: new Dec(quote.afterSpotPriceInOverOut),
    afterSpotPriceOutOverIn: new Dec(quote.afterSpotPriceOutOverIn),
    effectivePriceInOverOut: new Dec(quote.effectivePriceInOverOut),
    effectivePriceOutOverIn: new Dec(quote.effectivePriceOutOverIn),
    priceImpactTokenOut: new Dec(quote.priceImpactTokenOut),
    numTicksCrossed: quote.numTicksCrossed,
  };
}

export type EncodedSplitTokenInQuote = EncodedQuote & {
  split: (EncodedRouteWithInAmount & {
    effectiveSwapFees: string[];
    multiHopOsmoDiscount: boolean;
  })[];
  tokenInFeeAmount: string;
  swapFee: string;
};

export function encodeSplitTokenInQuote(
  quote: Awaited<ReturnType<TokenOutGivenInRouter["routeByTokenIn"]>>
): EncodedSplitTokenInQuote {
  return {
    ...encodeQuote(quote),
    split: quote.split.map((route) => ({
      ...encodeRouteWithInAmount(route),
      effectiveSwapFees: route.effectiveSwapFees.map((fee) => fee.toString()),
      multiHopOsmoDiscount: route.multiHopOsmoDiscount,
    })),
    tokenInFeeAmount: quote.tokenInFeeAmount.toString(),
    swapFee: quote.swapFee.toString(),
  };
}

export function decodeSplitTokenInQuote(
  quote: EncodedSplitTokenInQuote
): Awaited<ReturnType<TokenOutGivenInRouter["routeByTokenIn"]>> {
  return {
    ...decodeQuote(quote),
    split: quote.split.map((route) => ({
      ...decodeRouteWithInAmount(route),
      effectiveSwapFees: route.effectiveSwapFees.map((fee) => new Dec(fee)),
      multiHopOsmoDiscount: route.multiHopOsmoDiscount,
    })),
    tokenInFeeAmount: new Int(quote.tokenInFeeAmount),
    swapFee: new Dec(quote.swapFee),
  };
}
