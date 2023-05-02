import { Dec, Int } from "@keplr-wallet/unit";

import { smallestDec } from "./const";
import { tickToSqrtPrice } from "./tick";

/** The `@keplr-wallet/unit` `Dec` object doesn't have the `mulRoundUp()` function
 *  as seen in Cosmos SDK `Dec` object. To adapt, we extend Dec and add the function.
 *
 *  Create a custom Dec object if it's needed in more places than below.
 *  TODO:  If we manage to update `@keplr-wallet/unit` to have `mulRoundUp()` function, we can remove this.
 *  Proposed in PR: https://github.com/chainapsis/keplr-wallet/pull/721
 */
class DecWithMulRoundUp extends Dec {
  mulRoundUp(d2: DecWithMulRoundUp): Dec {
    return new Dec(
      (this.mulRaw(d2) as DecWithMulRoundUp).chopPrecisionAndRoundUp(),
      Dec.precision
    );
  }
}

/**
  Calculates the amount of asset 0 given the asset with the smaller liquidity in the pool, sqrtpCur, and nextPrice.

  - sqrtPriceA is the smaller of sqrtpCur and the nextPrice.
  - sqrtPriceB is the larger of sqrtpCur and the nextPrice.
  - CalcAmount0Delta = (liquidity * (sqrtPriceB - sqrtPriceA)) / (sqrtPriceB * sqrtPriceA)
 */
// https://github.com/osmosis-labs/osmosis/blob/0f9eb3c1259078035445b3e3269659469b95fd9f/x/concentrated-liquidity/math/math.go#L56
export function calcAmount0Delta(
  liquidity: Dec,
  sqrtPriceA: Dec,
  sqrtPriceB: Dec,
  roundUp: boolean
): Dec {
  if (sqrtPriceA.gt(sqrtPriceB)) {
    [sqrtPriceA, sqrtPriceB] = [sqrtPriceB, sqrtPriceA];
  }
  const diff = sqrtPriceB.sub(sqrtPriceA);

  // if calculating for amountIn, we round up
  // if calculating for amountOut, we round down at precision end
  // this is to prevent removing more from the pool than expected due to rounding
  // example: we calculate 1000000.9999999 uusdc (~$1) amountIn and 2000000.999999 uosmo amountOut
  // we would want the user to put in 1000001 uusdc rather than 1000000 uusdc to ensure we are charging enough for the amount they are removing
  // additionally, without rounding, there exists cases where the swapState.amountSpecifiedRemaining.GT(sdk.ZeroDec()) for loop within
  // the CalcOut/In functions never actually reach zero due to dust that would have never gotten counted towards the amount (numbers after the 10^6 place)
  if (roundUp) {
    // Note that we do MulTruncate so that the denominator is smaller as this is
    // the case where we want to round up to favor the pool.
    // Examples include:
    // - calculating amountIn during swap
    // - adding liquidity (request user to provide more tokens in in favor of the pool)
    // The denominator is truncated to get a higher final amount.
    const denom = sqrtPriceA.mulTruncate(sqrtPriceB);
    return liquidity.mul(diff).quo(denom).roundUpDec();
  }
  // These are truncated at precision end to round in favor of the pool when:
  // - calculating amount out during swap
  // - withdrawing liquidity
  // The denominator is rounded up to get a smaller final amount.
  const _sqrtPriceA = new DecWithMulRoundUp(sqrtPriceA.toString());
  const _sqrtPriceB = new DecWithMulRoundUp(sqrtPriceB.toString());
  const denom = _sqrtPriceA.mulRoundUp(_sqrtPriceB);
  return liquidity.mulTruncate(diff).quoTruncate(denom);
}

/**
  Calculates the amount of asset 1 given the asset with the smaller liquidity in the pool, sqrtpCur, and nextPrice.

  - sqrtPriceA is the smaller of sqrtpCur and the nextPrice.
  - sqrtPriceB is the larger of sqrtpCur and the nextPrice.
  - CalcAmount1Delta = liq * (sqrtPriceB - sqrtPriceA)
 */
// https://github.com/osmosis-labs/osmosis/blob/0f9eb3c1259078035445b3e3269659469b95fd9f/x/concentrated-liquidity/math/math.go#L90
export function calcAmount1Delta(
  liquidity: Dec,
  sqrtPriceA: Dec,
  sqrtPriceB: Dec,
  roundUp: boolean
): Dec {
  if (sqrtPriceA.gt(sqrtPriceB)) {
    [sqrtPriceA, sqrtPriceB] = [sqrtPriceB, sqrtPriceA];
  }
  const diff = sqrtPriceB.sub(sqrtPriceA);
  // if calculating for amountIn, we round up
  // if calculating for amountOut, we don't round at all
  // this is to prevent removing more from the pool than expected due to rounding
  // example: we calculate 1000000.9999999 uusdc (~$1) amountIn and 2000000.999999 uosmo amountOut
  // we would want the used to put in 1000001 uusdc rather than 1000000 uusdc to ensure we are charging enough for the amount they are removing
  // additionally, without rounding, there exists cases where the swapState.amountSpecifiedRemaining.GT(sdk.ZeroDec()) for loop within
  // the CalcOut/In functions never actually reach zero due to dust that would have never gotten counted towards the amount (numbers after the 10^6 place)
  if (roundUp) {
    // Note that we do MulRoundUp so that the end result is larger as this is
    // the case where we want to round up to favor the pool.
    // Examples include:
    // - calculating amountIn during swap
    // - adding liquidity (request user to provide more tokens in in favor of the pool)
    const _liquidity = new DecWithMulRoundUp(liquidity.toString());
    const _diff = new DecWithMulRoundUp(diff.toString());
    return _liquidity.mulRoundUp(_diff).roundUpDec();
  }
  // This is truncated at precision end to round in favor of the pool when:
  // - calculating amount out during swap
  // - withdrawing liquidity
  // The denominator is rounded up to get a higher final amount.
  return liquidity.mulTruncate(diff);
}

/**
  Utilizes sqrtPriceCurrent, liquidity, and amount of denom0 that still needs to be swapped in order to determine the sqrtPriceNext.

  When we swap for token one out given token zero in, the price is decreasing, and we need to move the sqrt price (decrease it) less to avoid overpaying the amount out of the pool. Therefore, we round up.

  sqrt_next = liq * sqrt_cur / (liq + token_in * sqrt_cur)
 */
// https://github.com/osmosis-labs/osmosis/blob/1c5f166d180ca6ffdd0a4068b97422c5c169240c/x/concentrated-liquidity/math/math.go#L103
export function getNextSqrtPriceFromAmount0InRoundingUp(
  sqrtPriceCurrent: Dec,
  liquidity: Dec,
  amountRemaining: Dec
): Dec {
  if (amountRemaining.equals(new Dec(0))) {
    return sqrtPriceCurrent;
  }

  const product = amountRemaining.mul(sqrtPriceCurrent);
  const denom = liquidity.add(product);
  return liquidity.mul(sqrtPriceCurrent).quoRoundUp(denom);
}

/**
  Utilizes the current sqrtPriceCurrent, liquidity, and amount of denom1 that still needs to be swapped in order to determine the sqrtPriceNext.

  When we swap for token zero out given token one in, the price is increasing and we need to move the sqrt price (increase it) less to avoid overpaying out of the pool. Therefore, we round down.

  sqrt_next = sqrt_cur + token_in / liq
 */
// https://github.com/osmosis-labs/osmosis/blob/1c5f166d180ca6ffdd0a4068b97422c5c169240c/x/concentrated-liquidity/math/math.go#L133
export function getNextSqrtPriceFromAmount1InRoundingDown(
  sqrtPriceCurrent: Dec,
  liquidity: Dec,
  amountRemaining: Dec
): Dec {
  return sqrtPriceCurrent.add(amountRemaining.quoTruncate(liquidity));
}

/**
  Utilizes sqrtPriceCurrent, liquidity, and amount of denom0 that still needs to be swapped out in order to determine the sqrtPriceNext.

  When we swap for token one in given token zero out, the price is increasing and we need to move the price up enough so that we get the desired output amount out. Therefore, we round up.

  sqrt_next = liq * sqrt_cur / (liq - token_out * sqrt_cur)
 */
// https://github.com/osmosis-labs/osmosis/blob/1c5f166d180ca6ffdd0a4068b97422c5c169240c/x/concentrated-liquidity/math/math.go#L118
export function getNextSqrtPriceFromAmount0OutRoundingUp(
  sqrtPriceCurrent: Dec,
  liquidity: Dec,
  amountRemaining: Dec
) {
  if (amountRemaining.equals(new Dec(0))) {
    return sqrtPriceCurrent;
  }

  const product = amountRemaining.mul(sqrtPriceCurrent);
  const denom = liquidity.sub(product);
  return liquidity.mul(sqrtPriceCurrent).quoRoundUp(denom);
}

/**
  Utilizes the current sqrtPriceCurrent, liquidity, and amount of denom1 that still needs to be swapped out in order to determine the sqrtPriceNext.

  When we swap for token zero in given token one out, the price is decreasing and we need to move the price down enough so that we get the desired output amount out.

  sqrt_next = sqrt_cur - token_out / liq
 */
// https://github.com/osmosis-labs/osmosis/blob/1c5f166d180ca6ffdd0a4068b97422c5c169240c/x/concentrated-liquidity/math/math.go#L142
export function getNextSqrtPriceFromAmount1OutRoundingDown(
  sqrtPriceCurrent: Dec,
  liquidity: Dec,
  amountRemaining: Dec
) {
  return sqrtPriceCurrent.sub(amountRemaining.quoRoundUp(liquidity));
}

/**
  Calculates the total fee charge per swap step given the parameters for swapping token out given token in.
  
  - hasReachedTarget is the boolean flag indicating whether the sqrtPriceTarget has been reached during the swap step. The sqrtPriceTarget can be either sqrtPriceLimit or nextTickSqrtPrice.
  
  - amountIn is the amount of token in to be consumed during the swap step.
  
  - amountSpecifiedRemaining is the total remaining amount of token in that needs to be consumed to complete the swap.
  
  - swapFee is the swap fee to be charged. If swap fee is negative, it panics. If swap fee is 0, returns 0. Otherwise, computes and returns the fee charge per step.
 */
// https://github.com/osmosis-labs/osmosis/blob/1c5f166d180ca6ffdd0a4068b97422c5c169240c/x/concentrated-liquidity/swapstrategy/fees.go#L25
export function getFeeChargePerSwapStepOutGivenIn(
  hasReachedTarget: boolean,
  amountIn: Dec,
  amountSpecifiedRemaining: Dec,
  swapFee: Dec
): Dec {
  let feeChargeTotal = new Dec(0);

  if (swapFee.isNegative()) {
    throw new Error("Swap fee should be non-negative");
  }

  if (swapFee.isZero()) {
    return feeChargeTotal;
  }

  if (hasReachedTarget) {
    feeChargeTotal = amountIn.mul(swapFee).quo(new Dec(1).sub(swapFee));
  } else {
    feeChargeTotal = amountSpecifiedRemaining.sub(amountIn);
  }

  if (feeChargeTotal.isNegative()) {
    throw new Error("Fee charge should be non-negative");
  }

  return feeChargeTotal;
}

export function approxSqrt(dec: Dec, maxIters = 300): Dec {
  return approxRoot(dec, 2, maxIters);
}

/**
  Approximate root using Newton's method.

  This function approximates the square root of a given decimal.
  It uses Newton's method to approximate the square root.
  It does this by iterating through the formula:
  x_{n+1} = x_n - (x_n^2 - a) / (2 * x_n)
  where x_0 is the initial approximation, a is the number whose
  square root we want to find, and x_n is the current approximation.
  The number of iterations is controlled by maxIters.

   TODO: move to decimal object see: https://github.com/chainapsis/keplr-wallet/pull/674
 */
export function approxRoot(dec: Dec, root: number, maxIters = 300): Dec {
  if (dec.isNegative()) {
    return approxRoot(dec.neg(), root).neg();
  }

  if (root === 1 || dec.isZero() || dec.equals(new Dec(1))) {
    return dec;
  }

  if (root === 0) {
    return new Dec(1);
  }

  let [guess, delta] = [new Dec(1), new Dec(1)];
  for (let i = 0; delta.abs().gt(smallestDec) && i < maxIters; i++) {
    let prev = guess.pow(new Int(root - 1));
    if (prev.isZero()) {
      prev = smallestDec;
    }
    delta = dec.quo(prev);
    delta = delta.sub(guess);
    delta = delta.quoTruncate(new Dec(root));

    guess = guess.add(delta);
  }

  return guess;
}

// https://github.com/osmosis-labs/osmosis/blob/1c5f166d180ca6ffdd0a4068b97422c5c169240c/x/concentrated-liquidity/math/math.go#L163
export function addLiquidity(a: Dec, b: Dec): Dec {
  if (b.lt(new Dec(0))) {
    return a.sub(b.abs());
  }
  return a.add(b);
}

/** Converts a token-in-given-out to token-out-given-in based on current price and swap direction.  */
export function convertTokenInGivenOutToTokenOutGivenIn(
  specifiedTokenOut: { denom: string; amount: Int },
  token0Denom: string,
  currentPrice: Dec
) {
  // spot price = token1 / token0 or token1 per token 0
  if (specifiedTokenOut.denom === token0Denom) {
    // is in given out -- token0 for token1
    return new Dec(specifiedTokenOut.amount).mul(currentPrice).truncate();
  }
  // is in given out -- token1 for token0
  return new Dec(specifiedTokenOut.amount).quo(currentPrice).truncate();
}

export function calcualteLiquidityForY(
  curPrice: Dec,
  lowerTick: Int,
  upperTick: Int,
  depositX: Dec,
  exponentAtPriceOne: number
): Dec {
  const lowerPriceSqrt = tickToSqrtPrice(lowerTick, exponentAtPriceOne);
  const upperPriceSqrt = tickToSqrtPrice(upperTick, exponentAtPriceOne);
  const curPriceSqrt = approxSqrt(curPrice);
  const liquidity = depositX
    .mul(curPriceSqrt)
    .mul(upperPriceSqrt)
    .quo(upperPriceSqrt.sub(curPriceSqrt));
  return liquidity.mul(curPriceSqrt.sub(lowerPriceSqrt));
  // const liquidity = (depositX * Math.sqrt(curPrice) * Math.sqrt(upperPrice)) / (Math.sqrt(upperPrice) - Math.sqrt(curPrice));
  // return liquidity * (Math.sqrt(curPrice) - Math.sqrt(lowerPrice));
}
