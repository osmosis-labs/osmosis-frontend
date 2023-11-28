import { Dec } from "@keplr-wallet/unit";

import { pow } from "../utils";

export const WeightedPoolMath = {
  calcSpotPrice,
  calcOutGivenIn,
  calcInGivenOut,
  calcPoolOutGivenSingleIn,
};

const oneDec = new Dec(1);

export function calcSpotPrice(
  tokenBalanceIn: Dec,
  tokenWeightIn: Dec,
  tokenBalanceOut: Dec,
  tokenWeightOut: Dec,
  swapFee: Dec
): Dec {
  const number = tokenBalanceIn.quo(tokenWeightIn);
  const denom = tokenBalanceOut.quo(tokenWeightOut);
  const scale = oneDec.quo(oneDec.sub(swapFee));

  return number.quo(denom).mul(scale);
}

/** Weighted constant product. */
export function calcOutGivenIn(
  tokenReservesIn: Dec,
  tokenWeightIn: Dec,
  tokenReservesOut: Dec,
  tokenWeightOut: Dec,
  tokenAmountIn: Dec,
  swapFee: Dec
): Dec {
  const weightRatio = tokenWeightIn.quo(tokenWeightOut);
  let adjustedIn = oneDec.sub(swapFee);
  adjustedIn = tokenAmountIn.mul(adjustedIn);
  const y = tokenReservesIn.quo(tokenReservesIn.add(adjustedIn));
  const foo = pow(y, weightRatio);
  const bar = oneDec.sub(foo);
  return tokenReservesOut.mul(bar);
}

/** Weighted constant product. */
export function calcInGivenOut(
  tokenReservesIn: Dec,
  tokenWeightIn: Dec,
  tokenReservesOut: Dec,
  tokenWeightOut: Dec,
  tokenAmountOut: Dec,
  swapFee: Dec
): Dec {
  const weightRatio = tokenWeightOut.quo(tokenWeightIn);
  const diff = tokenReservesOut.sub(tokenAmountOut);
  if (diff.lte(new Dec(0))) return new Dec(0); // not enough liquidity
  const y = tokenReservesOut.quo(diff);
  let foo = pow(y, weightRatio);
  foo = foo.sub(oneDec);
  const tokenAmountIn = oneDec.sub(swapFee);
  return tokenReservesIn.mul(foo).quo(tokenAmountIn);
}

export function calcPoolOutGivenSingleIn(
  tokenBalanceIn: Dec,
  tokenWeightIn: Dec,
  poolSupply: Dec,
  totalWeight: Dec,
  tokenAmountIn: Dec,
  swapFee: Dec
): Dec {
  const normalizedWeight = tokenWeightIn.quo(totalWeight);
  const zaz = oneDec.sub(normalizedWeight).mul(swapFee);
  const tokenAmountInAfterFee = tokenAmountIn.mul(oneDec.sub(zaz));

  const newTokenBalanceIn = tokenBalanceIn.add(tokenAmountInAfterFee);
  const tokenInRatio = newTokenBalanceIn.quo(tokenBalanceIn);

  // uint newPoolSupply = (ratioTi ^ weightTi) * poolSupply;
  const poolRatio = pow(tokenInRatio, normalizedWeight);
  const newPoolSupply = poolRatio.mul(poolSupply);
  return newPoolSupply.sub(poolSupply);
}
