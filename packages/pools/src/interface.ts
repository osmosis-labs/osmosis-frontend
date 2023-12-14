import { Dec, Int } from "@keplr-wallet/unit";

import { PoolType } from "./types";

/** Interface for base pool data and basic operations on that data. */
export interface BasePool {
  get type(): PoolType;

  get id(): string;

  get swapFee(): Dec;
  get exitFee(): Dec;

  get poolAssets(): {
    denom: string;
    amount: Int;
  }[];

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
}

/** Pool with user ownership represented as pro-rata shares. */
export interface SharePool extends BasePool {
  get totalShare(): Int;
  get shareDenom(): string;

  get poolAssets(): {
    denom: string;
    amount: Int;
  }[];

  getPoolAsset(denom: string): {
    denom: string;
    amount: Int;
  };
}
