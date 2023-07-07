import { Dec, Int } from "@keplr-wallet/unit";

import { maxSpotPrice, minSpotPrice, smallestDec } from "./const";
import { addLiquidity, approxSqrt } from "./math";
import { makeSwapStrategy } from "./swap-strategy";
import { tickToSqrtPrice } from "./tick";
import {
  LiquidityDepth,
  QuoteInGivenOutParams,
  QuoteOutGivenInParams,
} from "./types";

export const ConcentratedLiquidityMath = {
  calcOutGivenIn,
  calcInGivenOut,
};

interface SwapState {
  amountRemaining: Dec;
  amountCalculated: Dec;
  inittedTickIndex: number;
  /** amountToken1/amountToken0 */
  sqrtPrice: Dec;
  currentTickLiquidity: Dec;
  feeGrowthGlobal: Dec;
}

/** Estimate the output amount and final price given user's desired input token.
 *  If there aren't enough ticks to calculate the swap, returns "no-more-ticks".
 */
function calcOutGivenIn({
  tokenIn,
  tokenDenom0,
  poolLiquidity,
  inittedTicks,
  curSqrtPrice,
  swapFee,
}: QuoteOutGivenInParams):
  | { amountOut: Int; afterSqrtPrice: Dec; numTicksCrossed: number }
  | "no-more-ticks" {
  const isZeroForOne = tokenIn.denom === tokenDenom0;
  /** Max and min constraints on chain. */
  let priceLimit: Dec;
  if (isZeroForOne) {
    priceLimit = minSpotPrice;
  } else {
    priceLimit = maxSpotPrice;
  }

  const sqrtPriceLimit = approxSqrt(priceLimit);
  const swapStrategy = makeSwapStrategy(isZeroForOne, sqrtPriceLimit, swapFee);
  const tokenInAmountSpecified = new Dec(tokenIn.amount);

  const swapState: SwapState = {
    amountRemaining: tokenInAmountSpecified, // tokenIn
    amountCalculated: new Dec(0), // tokenOut
    inittedTickIndex: 0,
    sqrtPrice: curSqrtPrice,
    currentTickLiquidity: poolLiquidity,
    feeGrowthGlobal: new Dec(0),
  };

  let numTicksCrossed = 0;

  while (
    swapState.amountRemaining.gt(smallestDec) &&
    !swapState.sqrtPrice.equals(sqrtPriceLimit)
  ) {
    const nextTick: LiquidityDepth | undefined =
      inittedTicks?.[swapState.inittedTickIndex];
    if (nextTick === undefined) {
      return "no-more-ticks";
    }

    const nextTickSqrtPrice = tickToSqrtPrice(nextTick.tickIndex);

    const sqrtPriceTarget = swapStrategy.getSqrtTargetPrice(nextTickSqrtPrice);

    const {
      sqrtPriceNext,
      amountInConsumed,
      amountOutComputed,
      feeChargeTotal,
    } = swapStrategy.computeSwapStepOutGivenIn(
      swapState.sqrtPrice,
      sqrtPriceTarget,
      swapState.currentTickLiquidity,
      swapState.amountRemaining
    );

    console.log("nextTick", nextTick.tickIndex.toString());
    console.log("sqrtPriceCurrent", swapState.sqrtPrice.toString());
    console.log("sqrtPriceNext", sqrtPriceNext.toString());
    console.log("amountInConsumed", amountInConsumed.toString());
    console.log("amountOutComputed", amountOutComputed.toString());
    console.log("feeChargeTotal", feeChargeTotal.toString());

    swapState.sqrtPrice = sqrtPriceNext;
    swapState.amountRemaining = swapState.amountRemaining.sub(
      amountInConsumed.add(feeChargeTotal)
    );
    swapState.amountCalculated =
      swapState.amountCalculated.add(amountOutComputed);

    if (nextTickSqrtPrice.equals(sqrtPriceNext)) {
      const liquidityNet = swapStrategy.setLiquidityDeltaSign(
        new Dec(nextTick.netLiquidity.toString())
      );

      swapState.currentTickLiquidity = addLiquidity(
        swapState.currentTickLiquidity,
        liquidityNet
      );

      swapState.inittedTickIndex++;
    }

    numTicksCrossed++;
  } // end while

  return {
    amountOut: swapState.amountCalculated.truncate(),
    afterSqrtPrice: swapState.sqrtPrice,
    numTicksCrossed,
  };
}

/** Estimate the necessary input amount and final price given user's desired output token.
 *  If there aren't enough ticks to calculate the swap, returns "no-more-ticks".
 */
export function calcInGivenOut({
  tokenOut,
  tokenDenom0,
  poolLiquidity,
  inittedTicks,
  curSqrtPrice,
  swapFee,
}: QuoteInGivenOutParams):
  | { amountIn: Int; afterSqrtPrice: Dec; numTicksCrossed: number }
  | "no-more-ticks" {
  const isZeroForOne = tokenOut.denom !== tokenDenom0;
  /** Max and min constraints on chain. */
  let priceLimit: Dec;
  if (isZeroForOne) {
    priceLimit = minSpotPrice;
  } else {
    priceLimit = maxSpotPrice;
  }

  const sqrtPriceLimit = approxSqrt(priceLimit);
  const swapStrategy = makeSwapStrategy(isZeroForOne, sqrtPriceLimit, swapFee);
  const tokenOutAmountSpecified = new Dec(tokenOut.amount);

  const swapState: SwapState = {
    amountRemaining: tokenOutAmountSpecified,
    amountCalculated: new Dec(0),
    inittedTickIndex: 0,
    sqrtPrice: curSqrtPrice,
    currentTickLiquidity: poolLiquidity,
    feeGrowthGlobal: new Dec(0),
  };

  let numTicksCrossed = 0;

  while (
    swapState.amountRemaining.gt(smallestDec) &&
    !swapState.sqrtPrice.equals(sqrtPriceLimit)
  ) {
    const nextTick: LiquidityDepth | undefined =
      inittedTicks?.[swapState.inittedTickIndex];
    if (nextTick === undefined) {
      return "no-more-ticks";
    }

    const nextTickSqrtPrice = tickToSqrtPrice(nextTick.tickIndex);

    const sqrtPriceTarget = swapStrategy.getSqrtTargetPrice(nextTickSqrtPrice);

    const {
      sqrtPriceNext,
      amountOutConsumed,
      amountInComputed,
      feeChargeTotal,
    } = swapStrategy.computeSwapStepInGivenOut(
      swapState.sqrtPrice,
      sqrtPriceTarget,
      swapState.currentTickLiquidity,
      swapState.amountRemaining
    );

    swapState.sqrtPrice = sqrtPriceNext;
    swapState.amountRemaining =
      swapState.amountRemaining.sub(amountOutConsumed);
    swapState.amountCalculated = swapState.amountCalculated.add(
      amountInComputed.add(feeChargeTotal)
    );

    if (nextTickSqrtPrice.equals(sqrtPriceNext)) {
      const liquidityNet = swapStrategy.setLiquidityDeltaSign(
        new Dec(nextTick.netLiquidity.toString())
      );

      swapState.currentTickLiquidity = addLiquidity(
        swapState.currentTickLiquidity,
        liquidityNet
      );

      swapState.inittedTickIndex++;
    }

    numTicksCrossed++;
  }

  return {
    amountIn: swapState.amountCalculated.roundUp(),
    afterSqrtPrice: swapState.sqrtPrice,
    numTicksCrossed,
  };
}
