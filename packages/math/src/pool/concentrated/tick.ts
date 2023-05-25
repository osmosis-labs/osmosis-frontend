import { Dec, DecUtils, Int } from "@keplr-wallet/unit";

import { BigDec } from "../../big-dec";
import {
  exponentAtPriceOne,
  maxSpotPrice,
  maxTick,
  minSpotPrice,
  minTick,
} from "./const";
import { approxSqrt, convertTokenInGivenOutToTokenOutGivenIn } from "./math";
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
  let exponentAtCurTick = new Int(exponentAtPriceOne);

  let currentAdditiveIncrementInTicks = powTenBigDec(
    new Int(exponentAtPriceOne)
  );

  if (price.gt(new Dec(1))) {
    while (currentPrice.lt(price)) {
      currentAdditiveIncrementInTicks = powTenBigDec(exponentAtCurTick);
      const maxPriceForCurrentAdditiveIncrementInTicks = new BigDec(
        geometricExponentIncrementDistanceInTicks
      ).mul(currentAdditiveIncrementInTicks);
      currentPrice = currentPrice.add(
        maxPriceForCurrentAdditiveIncrementInTicks.toDec()
      );
      exponentAtCurTick = exponentAtCurTick.add(new Int(1));
      ticksPassed = ticksPassed.add(
        geometricExponentIncrementDistanceInTicks.truncate()
      );
    }
  } else {
    exponentAtCurTick = new Int(exponentAtPriceOne).sub(new Int(1));
    while (currentPrice.gt(price)) {
      currentAdditiveIncrementInTicks = powTenBigDec(exponentAtCurTick);
      const maxPriceForCurrentAdditiveIncrementInTicks = new BigDec(
        geometricExponentIncrementDistanceInTicks
      ).mul(currentAdditiveIncrementInTicks);
      currentPrice = currentPrice.sub(
        maxPriceForCurrentAdditiveIncrementInTicks.toDec()
      );
      exponentAtCurTick = exponentAtCurTick.sub(new Int(1));
      ticksPassed = ticksPassed.sub(
        geometricExponentIncrementDistanceInTicks.truncate()
      );
    }
  }

  const ticksToBeFilledByExponentAtCurrentTick = new BigDec(
    price.sub(currentPrice)
  ).quo(currentAdditiveIncrementInTicks);

  return ticksPassed.add(
    ticksToBeFilledByExponentAtCurrentTick.toDec().truncate()
  );
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
}: {
  /** May be specified amount of token out, or token in. */
  specifiedToken: {
    denom: string;
    amount: Int;
  };
  isOutGivenIn: boolean;
  token0Denom: string;
  token1Denom: string;
  currentSqrtPrice: Dec;
  currentTickLiquidity: Dec;
}): { boundTickIndex: Int } {
  // modify the input amount based on out given in vs in given out and swap direction
  const currentPrice = currentSqrtPrice.pow(new Int(2));

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

  // get target sqrt price from amount in and tick liquidity
  let sqrtPriceTarget: Dec;
  if (isZeroForOne) {
    // Swapping token 0 in for token 1 out.
    // sqrt P_t = sqrt P_c + L / token_0
    // Higher L -> higher tick estimate. This is good because we want to overestimate
    // to grab enough ticks in one round trip query.
    // Fee charge makes the target final tick smaller so drop it.

    const estimate = currentSqrtPrice.sub(
      currentTickLiquidity.quo(new Dec(tokenIn.amount))
    );

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

    const estimate = currentSqrtPrice.add(
      new Dec(tokenIn.amount).quo(currentTickLiquidity)
    );

    // Similarly to swapping to the left of the current sqrt price,
    // estimating tick bound in the other direction, we take the max of the estimate and the maximum sqrt price.
    // We expect the estimate to work much better assumming that the pool has a lot of positions.
    const maxSqrtPrice = approxSqrt(maxSpotPrice);
    sqrtPriceTarget = estimate.lt(maxSqrtPrice) ? estimate : maxSqrtPrice;
  }

  const price = sqrtPriceTarget.pow(new Int(2));

  return {
    boundTickIndex: priceToTick(price),
  };
}

export function roundPriceToNearestTick(price: Dec): Dec {
  if (price.gt(maxSpotPrice)) return maxSpotPrice;
  if (price.lt(minSpotPrice)) return minSpotPrice;
  const tick = priceToTick(price);
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
