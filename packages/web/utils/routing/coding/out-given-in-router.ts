import { Dec, Int } from "@keplr-wallet/unit";
import type {
  Quote,
  RouteWithInAmount,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";

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

export type EncodedRouteWithInAmount = {
  initialAmount: string;
  pools: { id: string }[];
  tokenOutDenoms: string[];
  tokenInDenom: string;
};

export function encodeRouteWithInAmount(
  route: RouteWithInAmount
): EncodedRouteWithInAmount {
  return {
    ...route,
    initialAmount: route.initialAmount.toString(),
    pools: route.pools,
  };
}

export function decodeRouteWithInAmount(
  route: EncodedRouteWithInAmount
): RouteWithInAmount {
  return {
    ...route,
    initialAmount: new Int(route.initialAmount),
    pools: route.pools,
  };
}

// RESPONSES

export type EncodedQuote = {
  amount: string;
  beforeSpotPriceInOverOut?: string;
  beforeSpotPriceOutOverIn?: string;
  afterSpotPriceInOverOut?: string;
  afterSpotPriceOutOverIn?: string;
  effectivePriceInOverOut?: string;
  effectivePriceOutOverIn?: string;
  /** Generally a positive number. */
  priceImpactTokenOut?: string;
};

export function encodeQuote(quote: Quote): EncodedQuote {
  return {
    amount: quote.amount.toString(),
    beforeSpotPriceInOverOut: quote.beforeSpotPriceInOverOut?.toString(),
    beforeSpotPriceOutOverIn: quote.beforeSpotPriceOutOverIn?.toString(),
    afterSpotPriceInOverOut: quote.afterSpotPriceInOverOut?.toString(),
    afterSpotPriceOutOverIn: quote.afterSpotPriceOutOverIn?.toString(),
    effectivePriceInOverOut: quote.effectivePriceInOverOut?.toString(),
    effectivePriceOutOverIn: quote.effectivePriceOutOverIn?.toString(),
    priceImpactTokenOut: quote.priceImpactTokenOut?.toString(),
  };
}

export function decodeQuote(quote: EncodedQuote): Quote {
  return {
    amount: new Int(quote.amount),
    beforeSpotPriceInOverOut: quote.beforeSpotPriceInOverOut
      ? new Dec(quote.beforeSpotPriceInOverOut)
      : undefined,
    beforeSpotPriceOutOverIn: quote.beforeSpotPriceOutOverIn
      ? new Dec(quote.beforeSpotPriceOutOverIn)
      : undefined,
    afterSpotPriceInOverOut: quote.afterSpotPriceInOverOut
      ? new Dec(quote.afterSpotPriceInOverOut)
      : undefined,
    afterSpotPriceOutOverIn: quote.afterSpotPriceOutOverIn
      ? new Dec(quote.afterSpotPriceOutOverIn)
      : undefined,
    effectivePriceInOverOut: quote.effectivePriceInOverOut
      ? new Dec(quote.effectivePriceInOverOut)
      : undefined,
    effectivePriceOutOverIn: quote.effectivePriceOutOverIn
      ? new Dec(quote.effectivePriceOutOverIn)
      : undefined,
    priceImpactTokenOut: quote.priceImpactTokenOut
      ? new Dec(quote.priceImpactTokenOut)
      : undefined,
  };
}

export type EncodedSplitTokenInQuote = EncodedQuote & {
  split: (EncodedRouteWithInAmount & {
    effectiveSwapFees?: string[];
  })[];
  tokenInFeeAmount?: string;
  swapFee?: string;
};

export function encodeSplitTokenInQuote(
  quote: Awaited<ReturnType<TokenOutGivenInRouter["routeByTokenIn"]>>
): EncodedSplitTokenInQuote {
  return {
    ...encodeQuote(quote),
    split: quote.split.map((route) => ({
      ...encodeRouteWithInAmount(route),
      effectiveSwapFees: route.effectiveSwapFees?.map((fee) => fee.toString()),
    })),
    tokenInFeeAmount: quote.tokenInFeeAmount?.toString(),
    swapFee: quote.swapFee?.toString(),
  };
}

export function decodeSplitTokenInQuote(
  quote: EncodedSplitTokenInQuote
): Awaited<ReturnType<TokenOutGivenInRouter["routeByTokenIn"]>> {
  return {
    ...decodeQuote(quote),
    split: quote.split.map((route) => ({
      ...decodeRouteWithInAmount(route),
      effectiveSwapFees: route.effectiveSwapFees?.map((fee) => new Dec(fee)),
    })),
    tokenInFeeAmount: quote.tokenInFeeAmount
      ? new Int(quote.tokenInFeeAmount)
      : undefined,
    swapFee: quote.swapFee ? new Dec(quote.swapFee) : undefined,
  };
}
