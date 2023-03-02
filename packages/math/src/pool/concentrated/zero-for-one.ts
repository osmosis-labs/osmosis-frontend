import { Dec, Int } from "@keplr-wallet/unit";

import { SwapStrategy } from "./swap-strategy";
import {
  calcAmount0Delta,
  calcAmount1Delta,
  getAmountRemainingLessFee,
  getFeeChargePerSwapStepOutGivenIn,
  getNextSqrtPriceFromAmount0RoundUp,
} from "./utils";

export type ZeroForOne = {
  isOutGivenIn: boolean;
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

    let amountZero = calcAmount0Delta(
      liquidity,
      sqrtPriceTarget,
      curSqrtPrice,
      this.zeroForOne.isOutGivenIn
    );

    const amountRemainingLessFee = getAmountRemainingLessFee(
      amountRemaining,
      this.zeroForOne.swapFee,
      this.zeroForOne.isOutGivenIn
    );

    let nextSqrtPrice: Dec;
    let hasReachedTarget = false;

    if (amountRemainingLessFee.gte(amountZero)) {
      nextSqrtPrice = sqrtPriceTarget;
      hasReachedTarget = true;
    } else {
      nextSqrtPrice = getNextSqrtPriceFromAmount0RoundUp(
        curSqrtPrice,
        liquidity,
        amountRemainingLessFee
      );
    }

    if (!hasReachedTarget) {
      amountZero = calcAmount0Delta(liquidity, nextSqrtPrice, curSqrtPrice);
    }

    const amountOne = calcAmount1Delta(
      liquidity,
      nextSqrtPrice,
      curSqrtPrice,
      false
    );

    let feeChargeTotal: Dec;
    if (this.zeroForOne.isOutGivenIn) {
      feeChargeTotal = getFeeChargePerSwapStepOutGivenIn(
        hasReachedTarget,
        amountZero,
        amountRemaining,
        this.zeroForOne.swapFee
      );
    } else {
      feeChargeTotal = amountOne
        .mul(this.zeroForOne.swapFee)
        .quo(new Dec(1).sub(this.zeroForOne.swapFee));
    }

    return {
      nextSqrtPrice,
      amountRemaining: amountZero,
      amountComputed: amountOne,
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
