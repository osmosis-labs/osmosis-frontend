import { Dec, Int } from "@keplr-wallet/unit";

/** Interface for base pool data and basic operations on that data. */
export interface BasePool {
  get type(): "weighted" | "stable" | "concentrated";

  get id(): string;

  get swapFee(): Dec;
  get exitFee(): Dec;

  get poolAssets(): {
    denom: string;
    amount: Int;
  }[];
  getPoolAsset(denom: string): {
    denom: string;
    amount: Int;
  };
  hasPoolAsset(denom: string): boolean;

  getSpotPriceInOverOut(tokenInDenom: string, tokenOutDenom: string): Dec;
  getSpotPriceOutOverIn(tokenInDenom: string, tokenOutDenom: string): Dec;
  getSpotPriceInOverOutWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec;
  getSpotPriceOutOverInWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec;

  getTokenOutByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string,
    swapFee?: Dec
  ): SwapResult;
  getTokenInByTokenOut(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string,
    swapFee?: Dec
  ): SwapResult;
}

/** Pool with user ownership represented as pro-rata shares. */
export interface SharePool extends BasePool {
  get totalShare(): Int;
  get shareDenom(): string;
}

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
