import { Dec, Int } from "@keplr-wallet/unit";

import { RouteWithInAmount } from "./route";

export type Token = {
  /** Denom of the token. */
  denom: string;
  /** Base/min amount of the token. */
  amount: Int;
};

export interface TokenOutGivenInRouter {
  /** Route, with splits, given an in token and out denom. */
  routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<SplitTokenInQuote>;

  /** Converges on an optimal set of routes to split through for a given amount of token in and out token. */
  getOptimizedRoutesByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<RouteWithInAmount[]>;
  /** Calculate the amount of token out by simulating a swap through a set of routes (split). */
  calculateTokenOutByTokenIn(
    routes: RouteWithInAmount[]
  ): Promise<SplitTokenInQuote>;
}

export interface RoutablePool {
  /** Unique identifier across pools. */
  id: string;
  poolAssetDenoms: string[];
  swapFee: Dec;

  /** Get the maximum amount of token that can be swapped in this pool. */
  getLimitAmountByTokenIn(denom: string): Promise<Int>;
  /** Get the swap result for swapping an amount of token in.
   *  @throws NotEnoughLiquidityError if there is not enough liquidity in the pool.
   */
  getTokenOutByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string,
    swapFee?: Dec
  ): Promise<Quote>;
  /** Get the amount of token in needed for swapping an amount of token out.
   *  @throws NotEnoughLiquidityError if there is not enough liquidity in the pool.
   */
  getTokenInByTokenOut(
    tokenOut: Token,
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
  split: (RouteWithInAmount & {
    /** Orderered array of the effective swap fees possibly including OSMO discount. */
    effectiveSwapFees: Dec[];
    multiHopOsmoDiscount: boolean;
  })[];
  /** In amount after fees paid are subtracted. */
  tokenInFeeAmount: Int;
  swapFee: Dec;
};
