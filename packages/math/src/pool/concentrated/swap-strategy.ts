import { Dec } from "@keplr-wallet/unit";

import { OneForZeroStrategy } from "./one-for-zero";
import { ZeroForOneStrategy } from "./zero-for-one";

export interface SwapStrategy {
  getSqrtTargetPrice(nextTickSqrtPrice: Dec): Dec;
  computeSwapStepOutGivenIn(
    curSqrtPrice: Dec,
    sqrtPriceTarget: Dec,
    liquidity: Dec,
    amountRemainingIn: Dec
  ): {
    sqrtPriceNext: Dec;
    amountInConsumed: Dec;
    amountOutComputed: Dec;
    feeChargeTotal: Dec;
  };
  computeSwapStepInGivenOut(
    curSqrtPrice: Dec,
    sqrtPriceTarget: Dec,
    liquidity: Dec,
    amountRemainingOut: Dec
  ): {
    sqrtPriceNext: Dec;
    amountOutConsumed: Dec;
    amountInComputed: Dec;
    feeChargeTotal: Dec;
  };
  initTickValue(curTick: number): number;
  validatePriceLimit(sqrtPriceLimit: Dec, curSqrtPrice: Dec): boolean;
  setLiquidityDeltaSign(liquidityDelta: Dec): Dec;
}

export function makeSwapStrategy(
  izZeroForOne: boolean,
  sqrtPriceLimit: Dec,
  swapFee: Dec
) {
  if (izZeroForOne) {
    return new ZeroForOneStrategy({ sqrtPriceLimit, swapFee });
  }
  return new OneForZeroStrategy({ sqrtPriceLimit, swapFee });
}
