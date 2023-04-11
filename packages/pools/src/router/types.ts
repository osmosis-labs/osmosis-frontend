import { Dec, Int } from "@keplr-wallet/unit";

import { Route } from "./route";

/** Single path through pools,  */
export interface RouteWithAmount extends Route {
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
  ): Promise<SwapResult>;
  /** Get the amount of token in needed for swapping an amount of token out. */
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
