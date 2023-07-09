import { Dec } from "@keplr-wallet/unit";

import { minSpotPrice } from "./const";
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

/**
  Implements the swapStrategy interface assuming that we are swapping token 0 for token 1 and performs calculations accordingly.

  With this strategy, we are moving to the left of the current tick index and square root price.

  ZeroForOne details:
  - zeroForOneStrategy assumes moving to the left of the current square root price.
 */
export class ZeroForOneStrategy implements SwapStrategy {
  constructor(private readonly zeroForOne: ZeroForOne) {}

  /**
    Calculates the next sqrt price, the amount of token in consumed, the amount out to return to the user, and total fee charge on token in.

    Parameters:
    - sqrtPriceCurrent: The current sqrt price.
    - sqrtPriceTarget: The target sqrt price computed with GetSqrtTargetPrice(). It must be one of:
      - Next tick sqrt price.
      - Sqrt price limit representing price impact protection.
    - liquidity: The amount of liquidity between the sqrt price current and sqrt price target.
    - amountZeroInRemaining: The amount of token zero in remaining to be swapped. This amount is fully consumed if sqrt price target is not reached. In that case, the returned amountZeroIn is the amount remaining given. Otherwise, the returned amountIn will be smaller than amountZeroInRemaining given.

    Returns:
    - sqrtPriceNext: The next sqrt price. It equals sqrt price target if target is reached. Otherwise, it is in-between sqrt price current and target.
    - amountZeroIn: The amount of token zero in consumed. It equals amountZeroInRemaining if target is reached. Otherwise, it is less than amountZeroInRemaining.
    - amountOutComputed: The amount of token out computed. It is the amount of token out to return to the user.
    - feeChargeTotal: The total fee charge. The fee is charged on the amount of token in.

    ZeroForOne details:
    - zeroForOneStrategy assumes moving to the left of the current square root price.
   */
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
      curSqrtPrice,
      true
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

      // This may happen due to a lack of precison. We need 36 for this to not happen.
      // Must be fixed post-launch.
      if (curSqrtPrice.equals(sqrtPriceNext)) {
        throw new Error(
          "Failed to advance the swap step while estimating slippage bound. Please try swapping in a larger amount."
        );
      }
    }

    const hasReachedTarget = sqrtPriceTarget.equals(sqrtPriceNext);

    if (!hasReachedTarget) {
      amountZeroIn = calcAmount0Delta(
        liquidity,
        sqrtPriceNext,
        curSqrtPrice,
        true
      );
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

  /**
    Calculates the next sqrt price, the amount of token out consumed, the amount in to charge to the user for requested out, and total fee charge on token in.

    Parameters:
    - sqrtPriceCurrent: The current sqrt price.
    - sqrtPriceTarget: The target sqrt price computed with GetSqrtTargetPrice(). It must be one of:
      - Next tick sqrt price.
      - Sqrt price limit representing price impact protection.
    - liquidity: The amount of liquidity between the sqrt price current and sqrt price target.
    - amountOneRemainingOut: The amount of token one out remaining to be swapped to estimate how much of token zero in is needed to be charged. This amount is fully consumed if sqrt price target is not reached. In that case, the returned amountOneOut is the amount remaining given. Otherwise, the returned amountOneOut will be smaller than amountOneRemainingOut given.

    Returns:
    - sqrtPriceNext: The next sqrt price. It equals sqrt price target if target is reached. Otherwise, it is in-between sqrt price current and target.
    - amountOneOut: The amount of token one out consumed. It equals amountOneRemainingOut if target is reached. Otherwise, it is less than amountOneRemainingOut.
    - amountZeroIn: The amount of token zero in computed. It is the amount of token in to charge to the user for the desired amount out.
    - feeChargeTotal: The total fee charge. The fee is charged on the amount of token in.

    ZeroForOne details:
    - zeroForOneStrategy assumes moving to the left of the current square root price.
   */
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

      // This may happen due to a lack of precison. We need 36 for this to not happen.
      // Must be fixed post-launch.
      if (curSqrtPrice.equals(sqrtPriceNext)) {
        throw new Error(
          "Failed to advance the swap step while estimating slippage bound. Please try swapping in a larger amount."
        );
      }
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
      curSqrtPrice,
      true
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

  /**
    Returns the target square root price given the next tick square root price.

    If the given nextTickSqrtPrice is less than the sqrt price limit, the sqrt price limit is returned. Otherwise, the input nextTickSqrtPrice is returned.
   */
  getSqrtTargetPrice(nextTickSqrtPrice: Dec): Dec {
    if (nextTickSqrtPrice.lt(this.zeroForOne.sqrtPriceLimit)) {
      return this.zeroForOne.sqrtPriceLimit;
    }
    return nextTickSqrtPrice;
  }

  validatePriceLimit(sqrtPriceLimit: Dec, curSqrtPrice: Dec): boolean {
    if (sqrtPriceLimit.gt(curSqrtPrice) || sqrtPriceLimit.lt(minSpotPrice)) {
      return false;
    }
    return true;
  }

  setLiquidityDeltaSign(liquidityDelta: Dec): Dec {
    return liquidityDelta.neg();
  }
}
