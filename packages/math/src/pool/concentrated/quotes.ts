import { Dec, Int } from "@keplr-wallet/unit";

import { maxSpotPrice, minSpotPrice, smallestDec } from "./const";
import { TickOverflowError } from "./errors";
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
  // calcSpotPrice,
};

interface SwapState {
  amountRemaining: Dec;
  amountCalculated: Dec;
  inittedTickIndex: number;
  sqrtPrice: Dec;
  currentTickLiquidity: Dec;
  feeGrowthGlobal: Dec;
}

/** Estimate the output amount and final price given user's desired input token. */
function calcOutGivenIn({
  tokenIn,
  tokenDenom0,
  poolLiquidity,
  inittedTicks,
  curSqrtPrice,
  precisionFactorAtPriceOne,
  swapFee,
}: QuoteOutGivenInParams): { amountOut: Int; finalPrice: Dec } {
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

  while (
    swapState.amountRemaining.gt(smallestDec) &&
    !swapState.sqrtPrice.equals(sqrtPriceLimit)
  ) {
    const nextTick: LiquidityDepth | undefined =
      inittedTicks?.[swapState.inittedTickIndex];
    if (nextTick === undefined) {
      throw new TickOverflowError("Not enough ticks to calculate swap");
    }

    const nextTickSqrtPrice = tickToSqrtPrice(
      nextTick.tickIndex,
      precisionFactorAtPriceOne
    );

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
  } // end while

  return {
    amountOut: swapState.amountCalculated.truncate(),
    finalPrice: swapState.sqrtPrice,
  };
}

/** Estimate the necessary input amount and final price given user's desired output token. */
export function calcInGivenOut({
  tokenOut,
  tokenDenom0,
  poolLiquidity,
  inittedTicks,
  curSqrtPrice,
  precisionFactorAtPriceOne,
  swapFee,
}: QuoteInGivenOutParams): { amountIn: Int; finalPrice: Dec } {
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

  while (
    swapState.amountRemaining.gt(smallestDec) &&
    !swapState.sqrtPrice.equals(sqrtPriceLimit)
  ) {
    const nextTick: LiquidityDepth | undefined =
      inittedTicks?.[swapState.inittedTickIndex];
    if (nextTick === undefined) {
      throw new TickOverflowError("Not enough ticks to calculate swap");
    }

    const nextTickSqrtPrice = tickToSqrtPrice(
      nextTick.tickIndex,
      precisionFactorAtPriceOne
    );

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
  }

  return {
    amountIn: swapState.amountCalculated.truncate(),
    finalPrice: swapState.sqrtPrice,
  };
}
