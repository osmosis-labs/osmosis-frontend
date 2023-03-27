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
  liquidity: Dec;
  feeGrowthGlobal: Dec;
}

function calcOutGivenIn({
  tokenIn,
  tokenDenom0,
  poolLiquidity,
  inittedTicks,
  curTick,
  curSqrtPrice,
  precisionFactorAtPriceOne,
  swapFee,
  priceLimit = new Dec(0),
}: QuoteOutGivenInParams): Int {
  const isZeroForOne = tokenIn.denom === tokenDenom0;
  if (isZeroForOne && priceLimit.equals(new Dec(0))) {
    priceLimit = minSpotPrice;
  } else if (!isZeroForOne && priceLimit.equals(new Dec(0))) {
    priceLimit = maxSpotPrice;
  }

  const sqrtPriceLimit = approxSqrt(priceLimit);
  const swapStrategy = makeSwapStrategy(isZeroForOne, sqrtPriceLimit, swapFee);
  const tokenInAmountSpecified = new Dec(tokenIn.amount);

  const curTickWithNetLiq = inittedTicks.find(({ tickIndex }) =>
    tickIndex.equals(curTick)
  );
  if (!curTickWithNetLiq) {
    throw new Error("curTickNet not found in inittedTicks");
  }
  const curTickArrIndex = inittedTicks.indexOf(curTickWithNetLiq);
  if (curTickArrIndex < 0) {
    throw new Error("curTickWithNetLiq not found in inittedTicks");
  }

  const swapState: SwapState = {
    amountRemaining: tokenInAmountSpecified, // tokenIn
    amountCalculated: new Dec(0), // tokenOut
    inittedTickIndex: swapStrategy.initTickValue(curTickArrIndex),
    sqrtPrice: curSqrtPrice,
    liquidity: poolLiquidity,
    feeGrowthGlobal: new Dec(0),
  };

  while (
    swapState.amountRemaining.gt(smallestDec) &&
    !swapState.sqrtPrice.equals(sqrtPriceLimit)
  ) {
    const nextTick: LiquidityDepth | undefined =
      inittedTicks?.[swapState.inittedTickIndex];
    if (!nextTick) {
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
      swapState.liquidity,
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

      swapState.liquidity = addLiquidity(swapState.liquidity, liquidityNet);

      swapState.inittedTickIndex++;
    }
  } // end while

  return swapState.amountCalculated.truncate();
}

export function calcInGivenOut({
  tokenOut,
  tokenDenom0,
  poolLiquidity,
  inittedTicks,
  curTick,
  curSqrtPrice,
  precisionFactorAtPriceOne,
  swapFee,
  priceLimit = new Dec(0),
}: QuoteInGivenOutParams): Int {
  const isZeroForOne = tokenOut.denom === tokenDenom0;
  if (isZeroForOne && priceLimit.equals(new Dec(0))) {
    priceLimit = minSpotPrice;
  } else if (!isZeroForOne && priceLimit.equals(new Dec(0))) {
    priceLimit = maxSpotPrice;
  }

  const sqrtPriceLimit = approxSqrt(priceLimit);
  const swapStrategy = makeSwapStrategy(isZeroForOne, sqrtPriceLimit, swapFee);
  const tokenOutAmountSpecified = new Dec(tokenOut.amount);

  const curTickWithNetLiq = inittedTicks.find(({ tickIndex }) =>
    tickIndex.equals(curTick)
  );
  if (!curTickWithNetLiq) {
    throw new Error("curTickNet not found in inittedTicks");
  }
  const curTickArrIndex = inittedTicks.indexOf(curTickWithNetLiq);
  if (curTickArrIndex < 0) {
    throw new Error("curTickWithNetLiq not found in inittedTicks");
  }

  const swapState: SwapState = {
    amountRemaining: tokenOutAmountSpecified,
    amountCalculated: new Dec(0),
    inittedTickIndex: swapStrategy.initTickValue(curTickArrIndex),
    sqrtPrice: curSqrtPrice,
    liquidity: poolLiquidity,
    feeGrowthGlobal: new Dec(0),
  };

  while (
    swapState.amountRemaining.gt(smallestDec) &&
    !swapState.sqrtPrice.equals(sqrtPriceLimit)
  ) {
    const nextTick: LiquidityDepth | undefined =
      inittedTicks?.[swapState.inittedTickIndex];
    if (!nextTick) {
      throw new TickOverflowError("Not enough ticks to calculate swap");
    }

    const nextTickSqrtPrice = tickToSqrtPrice(
      nextTick.tickIndex,
      precisionFactorAtPriceOne
    );

    const sqrtPriceTarget = swapStrategy.getSqrtTargetPrice(nextTickSqrtPrice);

    const {
      sqrtPriceNext,
      amountOutConsumed: amountOut,
      amountInComputed: amountIn,
      feeChargeTotal,
    } = swapStrategy.computeSwapStepInGivenOut(
      swapState.sqrtPrice,
      sqrtPriceTarget,
      swapState.liquidity,
      swapState.amountRemaining
    );

    swapState.sqrtPrice = sqrtPriceNext;
    swapState.amountRemaining = swapState.amountRemaining.sub(amountOut);
    swapState.amountCalculated = swapState.amountCalculated.add(
      amountIn.add(feeChargeTotal)
    );

    if (nextTickSqrtPrice.equals(sqrtPriceNext)) {
      const liquidityNet = swapStrategy.setLiquidityDeltaSign(
        new Dec(nextTick.netLiquidity.toString())
      );

      swapState.liquidity = addLiquidity(swapState.liquidity, liquidityNet);

      swapState.inittedTickIndex++;
    }
  }

  return swapState.amountCalculated.truncate();
}
