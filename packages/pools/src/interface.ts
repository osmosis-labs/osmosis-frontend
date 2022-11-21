import { Dec, Int } from "@keplr-wallet/unit";

/** Interface for pool data and basic operations on that data. */
export interface Pool {
  get type(): "weighted" | "stable";

  get id(): string;

  get totalShare(): Int;
  get shareDenom(): string;

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
  ): {
    amount: Int;
    beforeSpotPriceInOverOut: Dec;
    beforeSpotPriceOutOverIn: Dec;
    afterSpotPriceInOverOut: Dec;
    afterSpotPriceOutOverIn: Dec;
    effectivePriceInOverOut: Dec;
    effectivePriceOutOverIn: Dec;
    priceImpact: Dec;
  };
  getTokenInByTokenOut(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string,
    swapFee?: Dec
  ): {
    amount: Int;
    beforeSpotPriceInOverOut: Dec;
    beforeSpotPriceOutOverIn: Dec;
    afterSpotPriceInOverOut: Dec;
    afterSpotPriceOutOverIn: Dec;
    effectivePriceInOverOut: Dec;
    effectivePriceOutOverIn: Dec;
    priceImpact: Dec;
  };

  getNormalizedLiquidity(tokenInDenom: string, tokenOutDenom: string): Dec;
  getLimitAmountByTokenIn(denom: string): Int;
}
