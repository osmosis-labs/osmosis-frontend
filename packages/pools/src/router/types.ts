import { Dec, Int } from "@keplr-wallet/unit";

import { Route } from "./route";

export interface TokenOutGivenInRouter {
  getOptimizedRoutesByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string
  ): Promise<RouteWithInAmount[]>;
  calculateTokenOutByTokenIn(
    routes: RouteWithInAmount[]
  ): Promise<SplitTokenInQuote>;
}

/** Single path through pools, with the initial amount calculated. */
export interface RouteWithInAmount extends Route {
  initialAmount: Int;
}

export interface RoutablePool {
  /** Unique identifier across pools. */
  id: string;
  poolAssetDenoms: string[];
  swapFee: Dec;

  /** Get the maximum amount of token that can be swapped in this pool. */
  getLimitAmountByTokenIn(denom: string): Promise<Int>;
  /** Get the swap result for swapping an amount of token in. */
  getTokenOutByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string,
    swapFee?: Dec
  ): Promise<Quote>;
  /** Get the amount of token in needed for swapping an amount of token out. */
  getTokenInByTokenOut(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string,
    swapFee?: Dec
  ): Promise<Quote>;
}

export type Quote = {
  amount: Int;
  beforeSpotPriceInOverOut: Dec;
  beforeSpotPriceOutOverIn: Dec;
  afterSpotPriceInOverOut: Dec;
  afterSpotPriceOutOverIn: Dec;
  effectivePriceInOverOut: Dec;
  effectivePriceOutOverIn: Dec;
  /** Generally a positive number. */
  priceImpactTokenOut: Dec;
};

/** Quote with potential split of in token amount across multiple routes. */
export type SplitTokenInQuote = Quote & {
  split: (RouteWithInAmount & { multiHopOsmoDiscount: boolean })[];
  /** In amount after fees paid are subtracted. */
  tokenInFeeAmount: Int;
  swapFee: Dec;
};
