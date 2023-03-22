import { Dec, Int } from "@keplr-wallet/unit";

import { maxSqrtRatio } from "./const";
import { SwapStrategy } from "./swap-strategy";
import {
  calcAmount0Delta,
  calcAmount1Delta,
  getFeeChargePerSwapStepOutGivenIn,
  getNextSqrtPriceFromAmount1InRoundingDown,
} from "./utils";

export type OneForZero = {
  sqrtPriceLimit: Dec;
  swapFee: Dec;
};

export class OneForZeroStrategy implements SwapStrategy {
  constructor(private readonly oneForZero: OneForZero) {}

  computeSwapStepOutGivenIn(
    curSqrtPrice: Dec,
    sqrtPriceTarget: Dec,
    liquidity: Dec,
    amountOneInRemaining: Dec
  ): {
    sqrtPriceNext: Dec;
    amountInConsumed: Dec;
    amountOutComputed: Dec;
    feeChargeTotal: Dec;
  } {
    let amountOneIn = calcAmount1Delta(
      liquidity,
      sqrtPriceTarget,
      curSqrtPrice
    );

    const amountOneInRemainingLessFee = amountOneInRemaining.mul(
      new Dec(1).sub(this.oneForZero.swapFee)
    );

    let sqrtPriceNext: Dec;

    if (amountOneInRemainingLessFee.gte(amountOneIn)) {
      sqrtPriceNext = sqrtPriceTarget;
    } else {
      sqrtPriceNext = getNextSqrtPriceFromAmount1InRoundingDown(
        curSqrtPrice,
        liquidity,
        amountOneInRemainingLessFee
      );
    }

    const hasReachedTarget = sqrtPriceTarget.equals(sqrtPriceNext);

    if (!hasReachedTarget) {
      amountOneIn = calcAmount1Delta(liquidity, sqrtPriceNext, curSqrtPrice);
    }

    const amountZeroOut = calcAmount0Delta(
      liquidity,
      sqrtPriceNext,
      curSqrtPrice,
      false
    );

    const feeChargeTotal = getFeeChargePerSwapStepOutGivenIn(
      hasReachedTarget,
      amountOneIn,
      amountOneInRemaining,
      this.oneForZero.swapFee
    );

    return {
      sqrtPriceNext,
      amountInConsumed: amountOneIn,
      amountOutComputed: amountZeroOut,
      feeChargeTotal,
    };
  }

  initTickValue(curTick: Int): Int {
    return curTick;
  }

  validatePriceLimit(sqrtPriceLimit: Dec, curSqrtPrice: Dec): boolean {
    if (sqrtPriceLimit.lt(curSqrtPrice) || sqrtPriceLimit.gt(maxSqrtRatio)) {
      return false;
    }
    return true;
  }

  setLiquidityDeltaSign(liquidityDelta: Dec): Dec {
    return liquidityDelta;
  }

  getSqrtTargetPrice(nextTickSqrtPrice: Dec): Dec {
    if (nextTickSqrtPrice.gt(this.oneForZero.sqrtPriceLimit)) {
      return this.oneForZero.sqrtPriceLimit;
    }
    return nextTickSqrtPrice;
  }
}
