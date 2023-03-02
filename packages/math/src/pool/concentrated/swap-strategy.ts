import { Dec, Int } from "@keplr-wallet/unit";

import { OneForZeroStrategy } from "./one-for-zero";
import { ZeroForOneStrategy } from "./zero-for-one";

export interface SwapStrategy {
  getSqrtTargetPrice(nextTickSqrtPrice: Dec): Dec;
  computeSwapStep(
    curSqrtPrice: Dec,
    targetSqrtPrice: Dec,
    liquidity: Dec,
    amountRemaining: Dec
  ): {
    nextSqrtPrice: Dec;
    amountRemaining: Dec;
    amountComputed: Dec;
    feeChargeTotal: Dec;
  };
  initTickValue(curTick: Int): Int;
  validatePriceLimit(sqrtPriceLimit: Dec, curSqrtPrice: Dec): boolean;
  setLiquidityDeltaSign(liquidityDelta: Dec): Dec;
}

export function makeSwapStrategy(
  izZeroForOne: boolean,
  isOutGivenIn: boolean,
  sqrtPriceLimit: Dec,
  swapFee: Dec
) {
  if (izZeroForOne) {
    return new ZeroForOneStrategy({ isOutGivenIn, sqrtPriceLimit, swapFee });
  }
  return new OneForZeroStrategy({ isOutGivenIn, sqrtPriceLimit, swapFee });
}
