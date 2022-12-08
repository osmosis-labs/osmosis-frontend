import { Dec, Int } from "@keplr-wallet/unit";

/** Interface for raw pool data and basic operations on that data. */
export interface Pool {
  get id(): string;

  get totalWeight(): Int;

  get totalShare(): Int;
  get shareDenom(): string;

  get swapFee(): Dec;
  get exitFee(): Dec;

  /** LBP */
  get smoothWeightChange(): SmoothWeightChangeParams | undefined;

  get poolAssets(): {
    denom: string;
    amount: Int;
    weight: Int;
  }[];
  getPoolAsset(denom: string): {
    denom: string;
    amount: Int;
    weight: Int;
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
    tokenOutDenom: string
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
    tokenInDenom: string
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

/** Parameters of LBP. */
export type SmoothWeightChangeParams = {
  /** Timestamp */
  startTime: string;
  /** Seconds with s suffix. Ex) 3600s */
  duration: string;
  initialPoolWeights: {
    token: {
      denom: string;
      /** Int */
      amount: string;
    };
    /** Int */
    weight: string;
  }[];
  targetPoolWeights: {
    token: {
      denom: string;
      /** Int */
      amount: string;
    };
    /** Int */
    weight: string;
  }[];
};
