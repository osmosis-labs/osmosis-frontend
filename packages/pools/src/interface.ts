import { Dec, Int } from "@keplr-wallet/unit";

export interface Pool {
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
    denom: string;
    amount: Int;
    afterSpotPriceInOverOut: Dec;
    afterSpotPriceOutOverIn: Dec;
    slippage: Dec;
  };
  getTokenInByTokenOut(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string
  ): {
    denom: string;
    amount: Int;
    afterSpotPriceInOverOut: Dec;
    afterSpotPriceOutOverIn: Dec;
    slippage: Dec;
  };
}
