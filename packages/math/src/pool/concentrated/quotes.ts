import { Coin, Dec, Int } from "@keplr-wallet/unit";

import { maxSpotPrice, minSpotPrice, smallestDec } from "./const";
import { TickOverflowError } from "./errors";
import { makeSwapStrategy } from "./swap-strategy";
import { tickToSqrtPrice } from "./tick";
import { TickWithNetLiquidity } from "./types";
import { addLiquidity, approxSqrt } from "./utils";

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

function calcOutGivenIn(
  tokenIn: Coin,
  tokenDenom0: string,
  poolLiquidity: Dec,
  inittedTicksWithNetLiquidity: TickWithNetLiquidity[],
  curTick: Int,
  curSqrtPrice: Dec,
  precisionFactorAtPriceOne: number,
  swapFee: Dec,
  priceLimit = new Dec(0)
): Int {
  const isZeroForOne = tokenIn.denom === tokenDenom0;
  if (isZeroForOne && priceLimit.equals(new Dec(0))) {
    priceLimit = minSpotPrice;
  } else if (!isZeroForOne && priceLimit.equals(new Dec(0))) {
    priceLimit = maxSpotPrice;
  }

  const sqrtPriceLimit = approxSqrt(priceLimit);
  const swapStrategy = makeSwapStrategy(isZeroForOne, sqrtPriceLimit, swapFee);
  const tokenInAmountSpecified = new Dec(tokenIn.amount);

  const curTickWithNetLiq = inittedTicksWithNetLiquidity.find(({ tickIndex }) =>
    tickIndex.equals(curTick)
  );
  if (!curTickWithNetLiq) {
    throw new Error("curTickNet not found in inittedTicksWithNetLiquidity");
  }
  const curTickArrIndex =
    inittedTicksWithNetLiquidity.indexOf(curTickWithNetLiq);
  if (curTickArrIndex < 0) {
    throw new Error(
      "curTickWithNetLiq not found in inittedTicksWithNetLiquidity"
    );
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
    const nextTick: TickWithNetLiquidity | undefined =
      inittedTicksWithNetLiquidity?.[swapState.inittedTickIndex];
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
      amountInConsumed: amountOneIn,
      amountOutComputed: amountZeroOut,
      feeChargeTotal,
    } = swapStrategy.computeSwapStepOutGivenIn(
      swapState.sqrtPrice,
      sqrtPriceTarget,
      swapState.liquidity,
      swapState.amountRemaining
    );

    swapState.sqrtPrice = sqrtPriceNext;
    swapState.amountRemaining = swapState.amountRemaining.sub(
      amountOneIn.add(feeChargeTotal)
    );
    swapState.amountCalculated = swapState.amountCalculated.add(amountZeroOut);

    if (nextTickSqrtPrice.equals(sqrtPriceNext)) {
      const liquidityNet = swapStrategy.setLiquidityDeltaSign(
        new Dec(nextTick.netLiquidity.toString())
      );

      swapState.liquidity = addLiquidity(swapState.liquidity, liquidityNet);
    }

    swapState.inittedTickIndex = swapStrategy.nextInitializedTickIndex(
      swapState.inittedTickIndex
    );
  } // end while

  return swapState.amountCalculated.truncate();
}

export function calcInGivenOut(
  tokenOut: Coin,
  tokenDenom0: string,
  poolLiquidity: Dec,
  inittedTicksWithNetLiquidity: TickWithNetLiquidity[],
  curTick: Int,
  curSqrtPrice: Dec,
  precisionFactorAtPriceOne: number,
  swapFee: Dec,
  priceLimit = new Dec(0)
): Int {
  const isZeroForOne = tokenOut.denom === tokenDenom0;
  if (isZeroForOne && priceLimit.equals(new Dec(0))) {
    priceLimit = minSpotPrice;
  } else if (!isZeroForOne && priceLimit.equals(new Dec(0))) {
    priceLimit = maxSpotPrice;
  }

  const sqrtPriceLimit = approxSqrt(priceLimit);
  const swapStrategy = makeSwapStrategy(isZeroForOne, sqrtPriceLimit, swapFee);
  const tokenOutAmountSpecified = new Dec(tokenOut.amount);

  const curTickWithNetLiq = inittedTicksWithNetLiquidity.find(({ tickIndex }) =>
    tickIndex.equals(curTick)
  );
  if (!curTickWithNetLiq) {
    throw new Error("curTickNet not found in inittedTicksWithNetLiquidity");
  }
  const curTickArrIndex =
    inittedTicksWithNetLiquidity.indexOf(curTickWithNetLiq);
  if (curTickArrIndex < 0) {
    throw new Error(
      "curTickWithNetLiq not found in inittedTicksWithNetLiquidity"
    );
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
    const nextTick: TickWithNetLiquidity | undefined =
      inittedTicksWithNetLiquidity?.[swapState.inittedTickIndex];
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
    }

    swapState.inittedTickIndex = swapStrategy.nextInitializedTickIndex(
      swapState.inittedTickIndex
    );
  }

  return swapState.amountCalculated.truncate();
}
