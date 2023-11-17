import { Dec } from "@keplr-wallet/unit";

import { BigDec } from "../../big-dec";
import { OneForZeroStrategy } from "./one-for-zero";
import { ZeroForOneStrategy } from "./zero-for-one";

export interface SwapStrategy {
  getSqrtTargetPrice(nextTickSqrtPrice: Dec): Dec;
  computeSwapStepOutGivenIn(
    curSqrtPrice: BigDec,
    sqrtPriceTarget: Dec,
    liquidity: Dec,
    amountRemainingIn: Dec
  ): {
    sqrtPriceNext: BigDec;
    amountInConsumed: Dec;
    amountOutComputed: Dec;
    feeChargeTotal: Dec;
  };
  computeSwapStepInGivenOut(
    curSqrtPrice: BigDec,
    sqrtPriceTarget: Dec,
    liquidity: Dec,
    amountRemainingOut: Dec
  ): {
    sqrtPriceNext: BigDec;
    amountOutConsumed: Dec;
    amountInComputed: Dec;
    feeChargeTotal: Dec;
  };
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
