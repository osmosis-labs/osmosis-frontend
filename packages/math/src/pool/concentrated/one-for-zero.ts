import { Dec } from "@keplr-wallet/unit";

import { maxSpotPrice } from "./const";
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

/**
  Implements the swapStrategy interface assuming that we are swapping token 1 for token 0 and performs calculations accordingly.

  With this strategy, we are moving to the right of the current tick index and square root price.

  OneForZero details:
  - oneForZeroStrategy assumes moving to the right of the current square root price.
 */
export class OneForZeroStrategy implements SwapStrategy {
  constructor(private readonly oneForZero: OneForZero) {}

  /**
    Calculates the next sqrt price, the amount of token in consumed, the amount out to return to the user, and total fee charge on token in.

    Parameters:
    - sqrtPriceCurrent: The current sqrt price.
    - sqrtPriceTarget: The target sqrt price computed with GetSqrtTargetPrice(). It must be one of:
      - Next tick sqrt price.
      - Sqrt price limit representing price impact protection.
    - liquidity: The amount of liquidity between the sqrt price current and sqrt price target.
    - amountOneRemainingIn: The amount of token one in remaining to be swapped. This amount is fully consumed if sqrt price target is not reached. In that case, the returned amountOne is the amount remaining given. Otherwise, the returned amountOneIn will be smaller than amountOneRemainingIn given.

    Returns:
    - sqrtPriceNext: The next sqrt price. It equals sqrt price target if target is reached. Otherwise, it is in-between sqrt price current and target.
    - amountOneIn: The amount of token in consumed. It equals amountRemainingIn if target is reached. Otherwise, it is less than amountOneRemainingIn.
    - amountZeroOut: The amount of token out computed. It is the amount of token out to return to the user.
    - feeChargeTotal: The total fee charge. The fee is charged on the amount of token in.

    OneForZero details:
    - oneForZeroStrategy assumes moving to the right of the current square root price.
   */
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
      curSqrtPrice,
      true
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
      amountOneIn = calcAmount1Delta(
        liquidity,
        sqrtPriceNext,
        curSqrtPrice,
        true
      );
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

  /**
  Calculates the next sqrt price, the amount of token out consumed, the amount in to charge to the user for requested out, and total fee charge on token in.

  Parameters:
  - sqrtPriceCurrent: The current sqrt price.
  - sqrtPriceTarget: The target sqrt price computed with GetSqrtTargetPrice(). It must be one of:
    - Next tick sqrt price.
    - Sqrt price limit representing price impact protection.
  - liquidity: The amount of liquidity between the sqrt price current and sqrt price target.
  - amountZeroRemainingOut: The amount of token zero out remaining to be swapped to estimate how much of token one in is needed to be charged. This amount is fully consumed if sqrt price target is not reached. In that case, the returned amountOut is the amount zero remaining given. Otherwise, the returned amountOut will be smaller than amountZeroRemainingOut given.

  Returns:
  - sqrtPriceNext: The next sqrt price. It equals sqrt price target if target is reached. Otherwise, it is in-between sqrt price current and target.
  - amountZeroOut: The amount of token zero out consumed. It equals amountZeroRemainingOut if target is reached. Otherwise, it is less than amountZeroRemainingOut.
  - amountIn: The amount of token in computed. It is the amount of token one in to charge to the user for the desired amount out.
  - feeChargeTotal: The total fee charge. The fee is charged on the amount of token in.

  OneForZero details:
  - oneForZeroStrategy assumes moving to the right of the current square root price.
   */
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
      curSqrtPrice,
      true
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

  /**
  Returns the target square root price given the next tick square root price.

  If the given nextTickSqrtPrice is greater than the sqrt price limit, the sqrt price limit is returned. Otherwise, the input nextTickSqrtPrice is returned.
  */
  getSqrtTargetPrice(nextTickSqrtPrice: Dec): Dec {
    if (nextTickSqrtPrice.gt(this.oneForZero.sqrtPriceLimit)) {
      return this.oneForZero.sqrtPriceLimit;
    }
    return nextTickSqrtPrice;
  }

  validatePriceLimit(sqrtPriceLimit: Dec, curSqrtPrice: Dec): boolean {
    if (sqrtPriceLimit.lt(curSqrtPrice) || sqrtPriceLimit.gt(maxSpotPrice)) {
      return false;
    }
    return true;
  }

  setLiquidityDeltaSign(liquidityDelta: Dec): Dec {
    return liquidityDelta;
  }
}
