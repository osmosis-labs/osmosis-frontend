import { Dec, Int } from "@keplr-wallet/unit";
import { pow } from "../utils";

const oneDec = new Dec(1);
const twoDec = new Dec(2);

export function calcPriceImpactTokenIn(
  spotPriceBefore: Dec,
  tokenIn: Int,
  priceImpact: Dec
): Int {
  const effectivePrice = spotPriceBefore.mul(priceImpact.add(new Dec(1)));
  return new Dec(tokenIn).quo(effectivePrice).truncate();
}

export function calcPriceImpactTokenOut(
  spotPriceBefore: Dec,
  tokenOut: Int,
  priceImpact: Dec
): Int {
  const effectivePrice = spotPriceBefore.mul(priceImpact.add(new Dec(1)));
  return new Dec(tokenOut).mul(effectivePrice).truncate();
}

export function calcPriceImpactSlope(
  tokenBalanceIn: Dec,
  tokenWeightIn: Dec,
  tokenWeightOut: Dec,
  swapFee: Dec
): Dec {
  return oneDec
    .sub(swapFee)
    .mul(tokenWeightIn.add(tokenWeightOut))
    .sub(twoDec.mul(tokenBalanceIn).mul(tokenWeightOut));
}

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

export function calcOutGivenIn(
  tokenBalanceIn: Dec,
  tokenWeightIn: Dec,
  tokenBalanceOut: Dec,
  tokenWeightOut: Dec,
  tokenAmountIn: Dec,
  swapFee: Dec
): Dec {
  const weightRatio = tokenWeightIn.quo(tokenWeightOut);
  let adjustedIn = oneDec.sub(swapFee);
  adjustedIn = tokenAmountIn.mul(adjustedIn);
  const y = tokenBalanceIn.quo(tokenBalanceIn.add(adjustedIn));
  const foo = pow(y, weightRatio);
  const bar = oneDec.sub(foo);
  return tokenBalanceOut.mul(bar);
}

export function calcInGivenOut(
  tokenBalanceIn: Dec,
  tokenWeightIn: Dec,
  tokenBalanceOut: Dec,
  tokenWeightOut: Dec,
  tokenAmountOut: Dec,
  swapFee: Dec
): Dec {
  const weightRatio = tokenWeightOut.quo(tokenWeightIn);
  const diff = tokenBalanceOut.sub(tokenAmountOut);
  const y = tokenBalanceOut.quo(diff);
  let foo = pow(y, weightRatio);
  foo = foo.sub(oneDec);
  const tokenAmountIn = oneDec.sub(swapFee);
  return tokenBalanceIn.mul(foo).quo(tokenAmountIn);
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

export function calcSingleInGivenPoolOut(
  tokenBalanceIn: Dec,
  tokenWeightIn: Dec,
  poolSupply: Dec,
  totalWeight: Dec,
  poolAmountOut: Dec,
  swapFee: Dec
): Dec {
  const normalizedWeight = tokenWeightIn.quo(totalWeight);
  const newPoolSupply = poolSupply.add(poolAmountOut);
  const poolRatio = newPoolSupply.quo(poolSupply);

  //uint newBalTi = poolRatio^(1/weightTi) * balTi;
  const boo = oneDec.quo(normalizedWeight);
  const tokenInRatio = pow(poolRatio, boo);
  const newTokenBalanceIn = tokenInRatio.mul(tokenBalanceIn);
  const tokenAmountInAfterFee = newTokenBalanceIn.sub(tokenBalanceIn);
  // Do reverse order of fees charged in joinswap_ExternAmountIn, this way
  //     ``` pAo == joinswap_ExternAmountIn(Ti, joinswap_PoolAmountOut(pAo, Ti)) ```
  //uint tAi = tAiAfterFee / (1 - (1-weightTi) * swapFee) ;
  const zar = oneDec.sub(normalizedWeight).mul(swapFee);
  return tokenAmountInAfterFee.quo(oneDec.sub(zar));
}

export function calcSingleOutGivenPoolIn(
  tokenBalanceOut: Dec,
  tokenWeightOut: Dec,
  poolSupply: Dec,
  totalWeight: Dec,
  poolAmountIn: Dec,
  swapFee: Dec
): Dec {
  const normalizedWeight = tokenWeightOut.quo(totalWeight);
  // charge exit fee on the pool token side
  // pAiAfterExitFee = pAi*(1-exitFee)
  const poolAmountInAfterExitFee = poolAmountIn.mul(oneDec);
  const newPoolSupply = poolSupply.sub(poolAmountInAfterExitFee);
  const poolRatio = newPoolSupply.quo(poolSupply);

  // newBalTo = poolRatio^(1/weightTo) * balTo;

  const tokenOutRatio = pow(poolRatio, oneDec.quo(normalizedWeight));
  const newTokenBalanceOut = tokenOutRatio.mul(tokenBalanceOut);

  const tokenAmountOutBeforeSwapFee = tokenBalanceOut.sub(newTokenBalanceOut);

  // charge swap fee on the output token side
  //uint tAo = tAoBeforeSwapFee * (1 - (1-weightTo) * swapFee)
  const zaz = oneDec.sub(normalizedWeight).mul(swapFee);
  return tokenAmountOutBeforeSwapFee.mul(oneDec.sub(zaz));
}

export function calcPoolInGivenSingleOut(
  tokenBalanceOut: Dec,
  tokenWeightOut: Dec,
  poolSupply: Dec,
  totalWeight: Dec,
  tokenAmountOut: Dec,
  swapFee: Dec
): Dec {
  // charge swap fee on the output token side
  const normalizedWeight = tokenWeightOut.quo(totalWeight);
  //uint tAoBeforeSwapFee = tAo / (1 - (1-weightTo) * swapFee) ;
  const zoo = oneDec.sub(normalizedWeight);
  const zar = zoo.mul(swapFee);
  const tokenAmountOutBeforeSwapFee = tokenAmountOut.quo(oneDec.sub(zar));

  const newTokenBalanceOut = tokenBalanceOut.sub(tokenAmountOutBeforeSwapFee);
  const tokenOutRatio = newTokenBalanceOut.quo(tokenBalanceOut);

  //uint newPoolSupply = (ratioTo ^ weightTo) * poolSupply;
  const poolRatio = pow(tokenOutRatio, normalizedWeight);
  const newPoolSupply = poolRatio.mul(poolSupply);
  const poolAmountInAfterExitFee = poolSupply.sub(newPoolSupply);

  // charge exit fee on the pool token side
  // pAi = pAiAfterExitFee/(1-exitFee)
  return poolAmountInAfterExitFee.quo(oneDec);
}
