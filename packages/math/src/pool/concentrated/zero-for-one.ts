import { Dec, Int } from "@keplr-wallet/unit";

import { SwapStrategy } from "./swap-strategy";
import {
  calcAmount0Delta,
  calcAmount1Delta,
  getFeeChargePerSwapStepOutGivenIn,
  getNextSqrtPriceFromAmount0RoundUp,
} from "./utils";

export type ZeroForOne = {
  sqrtPriceLimit: Dec;
  swapFee: Dec;
};

export class ZeroForOneStrategy implements SwapStrategy {
  constructor(private readonly zeroForOne: ZeroForOne) {}

  // TODO: may be private
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
      sqrtPriceNext = getNextSqrtPriceFromAmount0RoundUp(
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

  initTickValue(curTick: Int): Int {
    return curTick.add(new Int(1));
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
