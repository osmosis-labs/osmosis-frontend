import { Dec, DecUtils, Int } from "@keplr-wallet/unit";

import { BigDec } from "../../big-dec";
import { approxSqrt } from "../../utils";
import {
  exponentAtPriceOne,
  maxSpotPrice,
  maxTick,
  minSpotPrice,
  minTick,
} from "./const";
import { convertTokenInGivenOutToTokenOutGivenIn } from "./math";
const nine = new Dec(9);

// Ref: https://github.com/osmosis-labs/osmosis/blob/main/x/concentrated-liquidity/README.md#tick-spacing-example-tick-to-price
// chain: https://github.com/osmosis-labs/osmosis/blob/0f9eb3c1259078035445b3e3269659469b95fd9f/x/concentrated-liquidity/math/tick.go#L35
/** TickToSqrtPrice returns the sqrtPrice given the following two arguments:
    - tickIndex: the tick index to calculate the price for

    If tickIndex is zero, the function returns new Dec(1).
 */
export function tickToSqrtPrice(tickIndex: Int): Dec {
  if (tickIndex.isZero()) {
    return new Dec(1);
  }

  const geometricExponentIncrementDistanceInTicks = nine.mul(
    powTenBigDec(new Int(exponentAtPriceOne).neg()).toDec()
  );

  if (tickIndex.lt(minTick) || tickIndex.gt(maxTick)) {
    throw new Error(
      `tickIndex is out of range: ${tickIndex.toString()}, min: ${minTick.toString()}, max: ${maxTick.toString()}`
    );
  }

  const geometricExponentDelta = new Dec(tickIndex)
    .quoTruncate(new Dec(geometricExponentIncrementDistanceInTicks.truncate()))
    .truncate();

  let exponentAtCurTick = new Int(exponentAtPriceOne).add(
    geometricExponentDelta
  );
  if (tickIndex.lt(new Int(0))) {
    exponentAtCurTick = exponentAtCurTick.sub(new Int(1));
  }

  const currentAdditiveIncrementInTicks = powTenBigDec(exponentAtCurTick);

  const numAdditiveTicks = tickIndex.sub(
    geometricExponentDelta.mul(
      geometricExponentIncrementDistanceInTicks.truncate()
    )
  );

  const price = powTenBigDec(geometricExponentDelta)
    .add(new BigDec(numAdditiveTicks).mul(currentAdditiveIncrementInTicks))
    .toDec();

  if (price.gt(maxSpotPrice) || price.lt(minSpotPrice)) {
    throw new Error(
      `price is out of range: ${price.toString()}, min: ${minSpotPrice.toString()}, max: ${maxSpotPrice.toString()}`
    );
  }

  return approxSqrt(price);
}

/** PriceToTick takes a price and returns the corresponding tick index
 *  This function does not take into consideration tick spacing.
 */
// https://github.com/osmosis-labs/osmosis/blob/0f9eb3c1259078035445b3e3269659469b95fd9f/x/concentrated-liquidity/math/tick.go#L98
export function priceToTick(price: Dec): Int {
  if (price.equals(new Dec(1))) {
    return new Int(0);
  }
  if (price.isNegative()) throw new Error("Price is negative");
  if (price.gt(maxSpotPrice) || price.lt(minSpotPrice))
    throw new Error("Price not within bounds: " + price.toString());

  const geometricExponentIncrementDistanceInTicks = nine.mul(
    DecUtils.getTenExponentN(-exponentAtPriceOne)
  );

  let currentPrice = new Dec(1);
  let ticksPassed = new Int(0);

  let currentAdditiveIncrementInTicks = powTenBigDec(
    new Int(exponentAtPriceOne)
  );

  let exponent;

  if (price.gt(new Dec(1))) {
    let maxPriceInTickIncrement = new Dec(10);
    exponent = new Int(0);

    while (maxPriceInTickIncrement.lt(price)) {
      exponent = exponent.add(new Int(1));
      maxPriceInTickIncrement = maxPriceInTickIncrement.mul(new Dec(10));
    }

    // We divide by 10 because we use max price in tick increment which is from the next exponent.
    currentPrice = maxPriceInTickIncrement.quoTruncate(new Dec(10));
    ticksPassed = ticksPassed.add(
      geometricExponentIncrementDistanceInTicks.truncate().mul(exponent)
    );
  } else {
    let minPriceInTheExponent = new Dec(0.1);
    exponent = new Int(-1);

    while (minPriceInTheExponent.gt(price)) {
      exponent = exponent.sub(new Int(1));
      minPriceInTheExponent = minPriceInTheExponent.quoTruncate(new Dec(10));
    }

    // We do not divide by 10 because we use min price in the tick increment which is from the current exponent.
    currentPrice = minPriceInTheExponent;
    ticksPassed = ticksPassed.sub(
      geometricExponentIncrementDistanceInTicks.truncate().mul(exponent.neg())
    );
  }

  currentAdditiveIncrementInTicks = powTenBigDec(
    new Int(exponentAtPriceOne).add(exponent)
  );

  const ticksToBeFilledByCurrentExponent = new BigDec(
    price.sub(currentPrice)
  ).quo(currentAdditiveIncrementInTicks);

  return ticksPassed.add(ticksToBeFilledByCurrentExponent.toDec().truncate());
}

/** Estimates the initial first tick index bound for querying ticks efficiently (not requesting too many ticks).
 *  Is positive or negative depending on which token is being swapped in.
 *
 *  Provides ability to handle out given in or in given out using the current price, since this is just an estimate.
 */
export function estimateInitialTickBound({
  specifiedToken,
  isOutGivenIn,
  token0Denom,
  token1Denom,
  currentSqrtPrice,
  currentTickLiquidity,
  constantTickEstimateMove = new Int(10000), // Note: chosen arbitrarily
}: {
  /** May be specified amount of token out, or token in. */
  specifiedToken: {
    denom: string;
    amount: Int;
  };
  isOutGivenIn: boolean;
  token0Denom: string;
  token1Denom: string;
  currentSqrtPrice: BigDec;
  currentTickLiquidity: Dec;
  constantTickEstimateMove?: Int;
}): { boundTickIndex: Int } {
  // modify the input amount based on out given in vs in given out and swap direction
  const currentPrice = currentSqrtPrice.pow(new Int(2)).toDec();

  let tokenIn;
  if (isOutGivenIn) {
    tokenIn = specifiedToken;
  } else {
    // isInGivenOut, convert to input amount using spot price
    tokenIn = {
      amount: convertTokenInGivenOutToTokenOutGivenIn(
        specifiedToken,
        token0Denom,
        currentPrice
      ),
      denom:
        specifiedToken.denom === token0Denom // swap denoms, isInGivenOut >> isOutGivenIn
          ? token1Denom
          : token0Denom,
    };
  }

  const isZeroForOne = tokenIn.denom === token0Denom;

  let estimate;

  // get target sqrt price from amount in and tick liquidity
  let sqrtPriceTarget: Dec;
  if (isZeroForOne) {
    // Swapping token 0 in for token 1 out.
    // sqrt P_t = sqrt P_c + L / token_0
    // Higher L -> higher tick estimate. This is good because we want to overestimate
    // to grab enough ticks in one round trip query.
    // Fee charge makes the target final tick smaller so drop it.

    // if there is no liquidity in the current range, set estimate constant value
    // away from current tick in the direction of the swap
    // if the division makes the result zero, also set it to constant value away from current tick.
    if (
      currentTickLiquidity.isZero() ||
      tokenIn.amount.isZero() ||
      currentTickLiquidity.quo(new Dec(tokenIn.amount)).isZero()
    ) {
      const currentTick = priceToTick(currentSqrtPrice.pow(new Int(2)).toDec());
      // price is decreasing so move estimate down
      estimate = tickToSqrtPrice(currentTick.sub(constantTickEstimateMove));
    } else {
      estimate = currentSqrtPrice
        .sub(new BigDec(currentTickLiquidity).quo(new BigDec(tokenIn.amount)))
        .toDec();
    }

    // Note, that if we only have a few positions in the pool, the estimate will be quite off
    // as current tick liquidity will vary from active range to the next range.
    // Therefore, we take the max of the estimate and the minimum sqrt price.
    // We expect the estimate to work much better assumming that the pool has a lot of positions.
    // where there is little variation in liquidity between tick ranges.
    const minSqrtPrice = approxSqrt(minSpotPrice);
    sqrtPriceTarget = estimate.gt(minSqrtPrice) ? estimate : minSqrtPrice;
  } else {
    // Swapping token 1 in for token 0 out
    // sqrt P_t = sqrt P_c + token_1 / L
    // Higher L -> Smaller target estimate. We want higher to have
    // a buffer and get all ticks in 1 query. Therefore, take 50% of current
    // To gurantee we get all data in single query. The value of 50% is chosen randomly and
    // can be adjusted for better performance via config.
    // Fee charge makes the target smaller. We want buffer to get all ticks
    // Therefore, drop fee.

    // if there is no liquidity in the current range, set estimate constant value
    // away from current tick in the direction of the swap
    // if the division makes the result zero, also set it to constant value away from current tick.
    if (
      currentTickLiquidity.isZero() ||
      tokenIn.amount.isZero() ||
      new Dec(tokenIn.amount).quo(currentTickLiquidity).isZero()
    ) {
      const currentTick = priceToTick(currentSqrtPrice.pow(new Int(2)).toDec());
      // price is increasing so move estimate up
      estimate = tickToSqrtPrice(currentTick.add(constantTickEstimateMove));
    } else {
      estimate = currentSqrtPrice
        .add(new BigDec(tokenIn.amount).quo(new BigDec(currentTickLiquidity)))
        .toDec();
    }

    // Similarly to swapping to the left of the current sqrt price,
    // estimating tick bound in the other direction, we take the max of the estimate and the maximum sqrt price.
    // We expect the estimate to work much better assumming that the pool has a lot of positions.
    const maxSqrtPrice = approxSqrt(maxSpotPrice);
    sqrtPriceTarget = estimate.lt(maxSqrtPrice) ? estimate : maxSqrtPrice;
  }

  const price = sqrtPriceTarget.pow(new Int(2));
  const boundTick = priceToTick(price);

  return {
    boundTickIndex: boundTick.gt(maxTick)
      ? maxTick
      : boundTick.lt(minTick)
      ? minTick
      : boundTick,
  };
}

export function roundPriceToNearestTick(
  price: Dec,
  tickSpacing: number,
  isLowerTick: boolean
): Dec {
  if (price.gt(maxSpotPrice)) return maxSpotPrice;
  if (price.lt(minSpotPrice)) return minSpotPrice;
  let tick = priceToTick(price);
  const tickSpacingInt = new Int(tickSpacing);

  if (!tickSpacingInt.equals(new Int(0))) {
    const tickRemainder = tick.mod(tickSpacingInt);

    // Negative tick remainder
    if (tickRemainder.lt(new Int(0))) {
      tick = tick.sub(tickRemainder);
      if (isLowerTick) {
        tick = tick.add(tickSpacingInt);
      } else {
        tick = tick.sub(tickSpacingInt);
      }

      // Positive tick remainder
    } else if (tickRemainder.gt(new Int(0))) {
      tick = tick.sub(tickRemainder);
      if (isLowerTick) {
        tick = tick.add(tickSpacingInt);
      }
    }
  }

  const sqrtPrice = tickToSqrtPrice(tick);
  return sqrtPrice.mul(sqrtPrice);
}

// TODO: consider moving
function powTenBigDec(exponent: Int): BigDec {
  if (exponent.gte(new Int(0))) {
    return new BigDec(10).pow(exponent);
  }
  return new BigDec(1).quo(new BigDec(10).pow(exponent.abs()));
}
