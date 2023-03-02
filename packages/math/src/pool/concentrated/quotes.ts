import { Coin, Dec, Int } from "@keplr-wallet/unit";

import { maxSpotPrice, minSpotPrice, smallestDec } from "./const";
import { TickOverflowError } from "./errors";
import { makeSwapStrategy } from "./swap-strategy";
import { sqrtPriceToTick, tickToSqrtPrice } from "./tick";
import { addLiquidity, approxSqrt } from "./utils";

export const ConcentratedLiquidityMath = {
  calcOutGivenIn,
  // calcInGivenOut,
  // calcSpotPrice,
};

interface SwapState {
  amountRemaining: Dec;
  amountCalculated: Dec;
  sqrtPrice: Dec;
  tick: Int;
  liquidity: Dec;
  feeGrowthGlobal: Dec;
}

function calcOutGivenIn(
  tokenIn: Coin,
  tokenDenom0: string,
  poolLiquidity: Dec,
  tickDepths: Int[],
  curTickIndex: number,
  curTick: Int,
  curSqrtPrice: Dec,
  precisionFactorAtPriceOne: number,
  swapFee: Dec,
  priceLimit = new Dec(0)
): Int {
  const tokenInAmountSpecified = new Dec(tokenIn.amount);

  const isZeroForOne = tokenIn.denom === tokenDenom0;
  if (isZeroForOne && priceLimit.equals(new Dec(0))) {
    priceLimit = minSpotPrice;
  } else if (!isZeroForOne && priceLimit.equals(new Dec(0))) {
    priceLimit = maxSpotPrice;
  }

  const sqrtPriceLimit = approxSqrt(priceLimit); // TODO: use function on updated keplr unit package: https://github.com/chainapsis/keplr-wallet/pull/674

  const swapStrategy = makeSwapStrategy(
    isZeroForOne,
    true,
    sqrtPriceLimit,
    swapFee
  );

  const swapState: SwapState = {
    amountRemaining: tokenInAmountSpecified,
    amountCalculated: new Dec(0),
    sqrtPrice: curSqrtPrice,
    tick: swapStrategy.initTickValue(curTick),
    liquidity: poolLiquidity,
    feeGrowthGlobal: new Dec(0),
  };

  let sqrtPriceStart: Dec;
  let i = curTickIndex;
  while (
    swapState.amountRemaining.gt(smallestDec) &&
    !swapState.sqrtPrice.equals(sqrtPriceLimit)
  ) {
    sqrtPriceStart = swapState.sqrtPrice;

    const nextTick: Int | undefined = tickDepths?.[i];
    if (!nextTick) {
      throw new TickOverflowError("Not enough ticks to calculate swap");
    }

    const nextTickSqrtPrice = tickToSqrtPrice(
      nextTick,
      precisionFactorAtPriceOne
    );

    const { nextSqrtPrice, amountRemaining, amountComputed, feeChargeTotal } =
      swapStrategy.computeSwapStep(
        swapState.sqrtPrice,
        nextTickSqrtPrice,
        swapState.liquidity,
        swapState.amountRemaining
      );

    swapState.sqrtPrice = nextSqrtPrice;
    swapState.amountRemaining = swapState.amountRemaining.sub(
      amountRemaining.add(feeChargeTotal)
    );
    swapState.amountCalculated = swapState.amountCalculated.add(amountComputed);

    if (nextTickSqrtPrice.equals(nextSqrtPrice)) {
      const liquidityNet = swapStrategy.setLiquidityDeltaSign(
        new Dec(nextTick)
      );

      swapState.liquidity = addLiquidity(swapState.liquidity, liquidityNet);
    } else if (!sqrtPriceStart.equals(nextSqrtPrice)) {
      swapState.tick = sqrtPriceToTick(
        nextSqrtPrice,
        precisionFactorAtPriceOne
      );
    }

    i++;
  } // end while

  return swapState.amountCalculated.truncate();
}
