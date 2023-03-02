import { Dec, Int } from "@keplr-wallet/unit";

import { maxSqrtRatio } from "./const";
import { SwapStrategy } from "./swap-strategy";
import {
  calcAmount0Delta,
  calcAmount1Delta,
  getAmountRemainingLessFee,
  getFeeChargePerSwapStepOutGivenIn,
  getNextSqrtPriceFromAmount1RoundDown,
} from "./utils";

export type OneForZero = {
  isOutGivenIn: boolean;
  sqrtPriceLimit: Dec;
  swapFee: Dec;
};

export class OneForZeroStrategy implements SwapStrategy {
  constructor(private readonly oneForZero: OneForZero) {}

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
  } {
    const sqrtPriceTarget = this.getSqrtTargetPrice(targetSqrtPrice);

    let amountOne = calcAmount1Delta(liquidity, sqrtPriceTarget, curSqrtPrice);

    const amountRemainingLessFee = getAmountRemainingLessFee(
      amountRemaining,
      this.oneForZero.swapFee,
      this.oneForZero.isOutGivenIn
    );

    let nextSqrtPrice: Dec;
    let hasReachedTarget = false;

    if (amountRemainingLessFee.gte(amountOne)) {
      nextSqrtPrice = sqrtPriceTarget;
      hasReachedTarget = true;
    } else {
      nextSqrtPrice = getNextSqrtPriceFromAmount1RoundDown(
        liquidity,
        curSqrtPrice,
        amountRemainingLessFee
      );
    }

    if (!hasReachedTarget) {
      amountOne = calcAmount1Delta(liquidity, nextSqrtPrice, curSqrtPrice);
    }

    const amountZero = calcAmount0Delta(
      liquidity,
      nextSqrtPrice,
      curSqrtPrice,
      false
    );

    let feeChargeTotal: Dec;
    if (this.oneForZero.isOutGivenIn) {
      feeChargeTotal = getFeeChargePerSwapStepOutGivenIn(
        hasReachedTarget,
        amountOne,
        amountRemaining,
        this.oneForZero.swapFee
      );
    } else {
      feeChargeTotal = amountZero
        .mul(this.oneForZero.swapFee)
        .quo(new Dec(1).sub(this.oneForZero.swapFee));
    }

    return {
      nextSqrtPrice,
      amountRemaining: amountOne,
      amountComputed: amountZero,
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
