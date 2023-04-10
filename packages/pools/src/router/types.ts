import { Dec, Int } from "@keplr-wallet/unit";

/** Single path through pools. */
export interface Route {
  pools: RoutablePool[];
  // tokenOutDenoms means the token to come out from each pool.
  // This should the same length with the pools.
  // Route consists of token in -> pool -> token out -> pool -> token out...
  // But, currently, only 1 intermediate can be supported.
  tokenOutDenoms: string[];
  tokenInDenom: string;
}

/** Single path through pools,  */
export interface RouteWithAmount extends Route {
  initialAmount: Int;
}

export interface RoutablePool {
  /** Unique identifier across pools. */
  id: string;
  poolAssetDenoms: string[];
  swapFee: Dec;

  getLimitAmountByTokenIn(denom: string): Promise<Int>;

  getTokenOutByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string,
    swapFee?: Dec
  ): Promise<SwapResult>;

  getTokenInByTokenOut(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string,
    swapFee?: Dec
  ): Promise<SwapResult>;
}

/** Result of swapping through a pool. */
export type SwapResult = {
  amount: Int;
  beforeSpotPriceInOverOut: Dec;
  beforeSpotPriceOutOverIn: Dec;
  afterSpotPriceInOverOut: Dec;
  afterSpotPriceOutOverIn: Dec;
  effectivePriceInOverOut: Dec;
  effectivePriceOutOverIn: Dec;
  priceImpact: Dec;
};

/** Result of swapping through multiple pools multihop. */
export type MultihopSwapResult = SwapResult & {
  tokenInFeeAmount: Int;
  swapFee: Dec;
  multiHopOsmoDiscount: boolean;
};
