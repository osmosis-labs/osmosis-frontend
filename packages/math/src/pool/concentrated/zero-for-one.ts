import { Dec } from "@keplr-wallet/unit";

import {
  calcAmount0Delta,
  calcAmount1Delta,
  getFeeChargePerSwapStepOutGivenIn,
  getNextSqrtPriceFromAmount0InRoundingUp,
  getNextSqrtPriceFromAmount1OutRoundingDown,
} from "./math";
import { SwapStrategy } from "./swap-strategy";

export type ZeroForOne = {
  sqrtPriceLimit: Dec;
  swapFee: Dec;
};

export class ZeroForOneStrategy implements SwapStrategy {
  constructor(private readonly zeroForOne: ZeroForOne) {}

  getSqrtTargetPrice(nextTickSqrtPrice: Dec): Dec {
    if (nextTickSqrtPrice.lt(this.zeroForOne.sqrtPriceLimit)) {
      return this.zeroForOne.sqrtPriceLimit;
    }
    return nextTickSqrtPrice;
  }

  computeSwapStepOutGivenIn(
    curSqrtPrice: Dec,
    sqrtPriceTarget: Dec,
    liquidity: Dec,
    amountZeroInRemaining: Dec
  ): {
    sqrtPriceNext: Dec;
    amountInConsumed: Dec;
    amountOutComputed: Dec;
    feeChargeTotal: Dec;
  } {
    let amountZeroIn = calcAmount0Delta(
      liquidity,
      sqrtPriceTarget,
      curSqrtPrice
    );

    const amountZeroInRemainingLessFee = amountZeroInRemaining.mul(
      new Dec(1).sub(this.zeroForOne.swapFee)
    );

    let sqrtPriceNext: Dec;
    if (amountZeroInRemainingLessFee.gte(amountZeroIn)) {
      sqrtPriceNext = sqrtPriceTarget;
    } else {
      sqrtPriceNext = getNextSqrtPriceFromAmount0InRoundingUp(
        curSqrtPrice,
        liquidity,
        amountZeroInRemainingLessFee
      );
    }

    const hasReachedTarget = sqrtPriceTarget.equals(sqrtPriceNext);

    if (!hasReachedTarget) {
      amountZeroIn = calcAmount0Delta(liquidity, sqrtPriceNext, curSqrtPrice);
    }

    const amountOneOut = calcAmount1Delta(
      liquidity,
      sqrtPriceNext,
      curSqrtPrice,
      false
    );

    const feeChargeTotal = getFeeChargePerSwapStepOutGivenIn(
      hasReachedTarget,
      amountZeroIn,
      amountZeroInRemaining,
      this.zeroForOne.swapFee
    );

    return {
      sqrtPriceNext: sqrtPriceNext,
      amountInConsumed: amountZeroIn,
      amountOutComputed: amountOneOut,
      feeChargeTotal,
    };
  }

  computeSwapStepInGivenOut(
    curSqrtPrice: Dec,
    sqrtPriceTarget: Dec,
    liquidity: Dec,
    amountOneRemainingOut: Dec
  ): {
    sqrtPriceNext: Dec;
    amountOutConsumed: Dec;
    amountInComputed: Dec;
    feeChargeTotal: Dec;
  } {
    let amountOneOut = calcAmount1Delta(
      liquidity,
      sqrtPriceTarget,
      curSqrtPrice,
      false
    );

    let sqrtPriceNext;
    if (amountOneRemainingOut.gte(amountOneOut)) {
      sqrtPriceNext = sqrtPriceTarget;
    } else {
      sqrtPriceNext = getNextSqrtPriceFromAmount1OutRoundingDown(
        curSqrtPrice,
        liquidity,
        amountOneRemainingOut
      );
    }

    const hasReachedTarget = sqrtPriceTarget.equals(sqrtPriceNext);

    if (!hasReachedTarget) {
      amountOneOut = calcAmount1Delta(
        liquidity,
        sqrtPriceNext,
        curSqrtPrice,
        false
      );
    }

    const amountZeroIn = calcAmount0Delta(
      liquidity,
      sqrtPriceNext,
      curSqrtPrice
    );

    const feeChargeTotal = amountZeroIn
      .mul(this.zeroForOne.swapFee)
      .quo(new Dec(1).sub(this.zeroForOne.swapFee));

    return {
      sqrtPriceNext,
      amountOutConsumed: amountOneOut,
      amountInComputed: amountZeroIn,
      feeChargeTotal,
    };
  }

  initTickValue(curTick: number): number {
    return curTick + 1;
  }

  nextInitializedTickIndex(index: number): number {
    return index + 1;
  }

  validatePriceLimit(sqrtPriceLimit: Dec, curSqrtPrice: Dec): boolean {
    if (sqrtPriceLimit.gt(curSqrtPrice) || sqrtPriceLimit.lt(new Dec(0))) {
      return false;
    }
    return true;
  }

  setLiquidityDeltaSign(liquidityDelta: Dec): Dec {
    return liquidityDelta.neg();
  }
}
