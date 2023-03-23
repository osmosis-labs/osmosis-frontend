import { Dec } from "@keplr-wallet/unit";

import { maxSqrtRatio } from "./const";
import {
  calcAmount0Delta,
  calcAmount1Delta,
  getFeeChargePerSwapStepOutGivenIn,
  getNextSqrtPriceFromAmount0OutRoundingUp,
  getNextSqrtPriceFromAmount1InRoundingDown,
} from "./math";
import { SwapStrategy } from "./swap-strategy";

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

  computeSwapStepInGivenOut(
    curSqrtPrice: Dec,
    sqrtPriceTarget: Dec,
    liquidity: Dec,
    amountZeroRemainingOut: Dec
  ): {
    sqrtPriceNext: Dec;
    amountOutConsumed: Dec;
    amountInComputed: Dec;
    feeChargeTotal: Dec;
  } {
    let amountZeroOut = calcAmount0Delta(
      liquidity,
      sqrtPriceTarget,
      curSqrtPrice,
      false
    );

    let sqrtPriceNext;
    if (amountZeroRemainingOut.gte(amountZeroOut)) {
      sqrtPriceNext = sqrtPriceTarget;
    } else {
      sqrtPriceNext = getNextSqrtPriceFromAmount0OutRoundingUp(
        curSqrtPrice,
        liquidity,
        amountZeroRemainingOut
      );
    }

    const hasReachedTarget = sqrtPriceTarget.equals(sqrtPriceNext);

    if (!hasReachedTarget) {
      amountZeroOut = calcAmount0Delta(
        liquidity,
        sqrtPriceNext,
        curSqrtPrice,
        false
      );
    }

    const amountOneIn = calcAmount1Delta(
      liquidity,
      sqrtPriceNext,
      curSqrtPrice
    );

    const feeChargeTotal = amountOneIn
      .mul(this.oneForZero.swapFee)
      .quo(new Dec(1).sub(this.oneForZero.swapFee));

    return {
      sqrtPriceNext,
      amountOutConsumed: amountZeroOut,
      amountInComputed: amountOneIn,
      feeChargeTotal,
    };
  }

  initTickValue(curTick: number): number {
    return curTick;
  }

  nextInitializedTickIndex(index: number): number {
    return index - 1;
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
