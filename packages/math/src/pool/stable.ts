import { Coin, Dec, DecUtils } from "@keplr-wallet/unit";

import { BigDec } from "../big-dec";
import { checkMultiplicativeErrorTolerance } from "../rounding";

export const StableSwapMath = {
  calcOutGivenIn,
  calcInGivenOut,
  calcSpotPrice,
};

const oneBigDec = new BigDec(1);

export type StableSwapToken = {
  amount: Dec;
  denom: string;
  scalingFactor: number;
};

type BigDecStableSwapToken = {
  amount: BigDec;
  denom: string;
  scalingFactor: number;
};

// calculates exact output given an input with no rounding/truncation
export function solveCalcOutGivenIn(
  tokens: StableSwapToken[],
  tokenIn: Coin,
  tokenOutDenom: string,
  swapFee: Dec
): BigDec {
  const scaledTokens = scaleTokens(tokens);

  const tokenInScalingFactor = tokens.find(
    ({ denom }) => denom === tokenIn.denom
  )?.scalingFactor;

  if (!tokenInScalingFactor) throw Error("tokenIn denom not in pool tokens");

  const tokenInScaled = new BigDec(tokenIn.amount).quoTruncate(
    new BigDec(tokenInScalingFactor)
  );

  // we apply swap fee before running solver since we are going input -> output
  const oneMinusSwapFee = oneBigDec.sub(new BigDec(swapFee));
  const tokenInLessFee = tokenInScaled.mul(oneMinusSwapFee);

  const tokenOutSupply = scaledTokens.find(
    ({ denom }) => denom === tokenOutDenom
  );
  const tokenInSupply = scaledTokens.find(
    ({ denom }) => denom === tokenIn.denom
  );
  const remReserves = scaledTokens
    .filter(({ denom }) => denom !== tokenIn.denom && denom !== tokenOutDenom)
    .map(({ amount }) => amount);

  if (!tokenOutSupply || !tokenInSupply)
    throw new Error("token supply incorrect");

  const cfmmOut = solveCfmm(
    tokenOutSupply.amount,
    tokenInSupply.amount,
    remReserves,
    tokenInLessFee
  );

  return cfmmOut.mul(new BigDec(tokenOutSupply.scalingFactor));
}

export function calcOutGivenIn(
  tokens: StableSwapToken[],
  tokenIn: Coin,
  tokenOutDenom: string,
  swapFee: Dec
) {
  return solveCalcOutGivenIn(
    tokens,
    tokenIn,
    tokenOutDenom,
    swapFee
  ).truncate();
}

export function calcInGivenOut(
  tokens: StableSwapToken[],
  tokenOut: Coin,
  tokenInDenom: string,
  swapFee: Dec
) {
  const scaledTokens = scaleTokens(tokens);

  const tokenOutScalingFactor = tokens.find(
    ({ denom }) => denom === tokenOut.denom
  )?.scalingFactor;

  if (!tokenOutScalingFactor) throw Error("tokenIn denom not in pool tokens");

  const tokenOutScaled = new BigDec(tokenOut.amount).quoTruncate(
    new BigDec(tokenOutScalingFactor)
  );

  const tokenInSupply = scaledTokens.find(
    ({ denom }) => denom === tokenInDenom
  );
  const tokenOutSupply = scaledTokens.find(
    ({ denom }) => denom === tokenOut.denom
  );
  const remReserves = scaledTokens
    .filter(({ denom }) => denom !== tokenOut.denom && denom !== tokenInDenom)
    .map(({ amount }) => amount);

  if (!tokenOutSupply || !tokenInSupply)
    throw new Error("Invalid token supply");

  const cfmmOut = solveCfmm(
    tokenInSupply.amount,
    tokenOutSupply.amount,
    remReserves,
    tokenOutScaled.neg()
  );

  // we negate the calculated input since our solver is negative in negative out
  const calculatedInput = cfmmOut.neg();

  // we apply swap fee after running solver since we are going output -> input
  const tokenInPlusFee = calculatedInput.quoRoundUp(
    oneBigDec.sub(new BigDec(swapFee))
  );

  return tokenInPlusFee.mul(new BigDec(tokenOutSupply.scalingFactor)).roundUp();
}

export function scaleTokens(
  tokens: StableSwapToken[]
): BigDecStableSwapToken[] {
  return tokens.map((token) => ({
    ...token,
    amount: new BigDec(token.amount).quo(new BigDec(token.scalingFactor)),
  }));
}

export function calcSpotPrice(
  tokens: StableSwapToken[],
  baseDenom: string,
  quoteDenom: string
): Dec {
  // we approximate spot price by simulating a zero-fee swap of 1 unit against the pool
  const a = new Coin(quoteDenom, 1);
  const approxSpotPrice = solveCalcOutGivenIn(tokens, a, baseDenom, new Dec(0));

  return approxSpotPrice.toDec();
}

export function solveCfmm(
  xReserve: BigDec,
  yReserve: BigDec,
  remReserves: BigDec[],
  yIn: BigDec
): BigDec {
  const wSumSquares = calcWSumSquares(remReserves);

  return solveCfmmBinarySearchMulti(xReserve, yReserve, wSumSquares, yIn);
}

export function solveCfmmBinarySearchMulti(
  xReserve: BigDec,
  yReserve: BigDec,
  wSumSquares: BigDec,
  yIn: BigDec
): BigDec {
  if (
    !xReserve.isPositive() ||
    !yReserve.isPositive() ||
    wSumSquares.isNegative()
  )
    throw Error("reserves and squares must be positive");
  else if (yIn.abs().gt(yReserve))
    throw Error("cannot input more than y reserve");

  const yFinal = yReserve.add(yIn);
  let xLowEst = xReserve;
  let xHighEst = xReserve;
  const k0 = cfmmConstantMultiNoV(xReserve, yFinal, wSumSquares);
  const k = cfmmConstantMultiNoV(xReserve, yReserve, wSumSquares);
  if (k0.isZero() || k.isZero()) throw Error("k should never be zero");

  // find change in k (if kRatio = 1, bounds remain equal)
  const kRatio = k0.quo(k);
  if (kRatio.lt(oneBigDec)) {
    xHighEst = xReserve.quo(kRatio).roundUpDec();
  } else if (kRatio.gt(oneBigDec)) {
    xLowEst = new BigDec(0);
  }

  const targetK = targetKCalculator(xReserve, yReserve, wSumSquares, yFinal);
  const iterKCalc = (xEst: BigDec) =>
    iterKCalculator(xEst, xReserve, wSumSquares, yFinal);

  const xEst = binarySearch(iterKCalc, xLowEst, xHighEst, targetK);

  const xOut = xReserve.sub(xEst);

  if (xOut.abs().gte(xReserve))
    throw Error("invalid output: greater than full pool reserves");

  return xOut;
}

export function targetKCalculator(
  x0: BigDec,
  y0: BigDec,
  w: BigDec,
  yf: BigDec
): BigDec {
  // cfmmNoV(x0, y0, w) = x_0 y_0 (x_0^2 + y_0^2 + w)
  const startK = cfmmConstantMultiNoV(x0, y0, w);
  // remove extra yf term
  const yfRemoved = startK.quo(yf);
  // removed constant term from expression
  // namely - (x_0 (y_f^2 + w) + x_0^3) = x_0(y_f^2 + w + x_0^2)
  // innerTerm = y_f^2 + w + x_0^2
  const yfSquared = yf.mul(yf);
  const x0Squared = x0.mul(x0);
  const innerTerm = yfSquared.add(w).add(x0Squared);
  const constantTerm = innerTerm.mul(x0);

  return yfRemoved.sub(constantTerm);
}

export function iterKCalculator(
  xf: BigDec,
  x0: BigDec,
  w: BigDec,
  yf: BigDec
): BigDec {
  // compute coefficients first
  const cubicCoeff = oneBigDec.neg();
  const quadraticCoeff = x0.mul(new BigDec(3));
  const quadraticCoeffTimesX0 = x0.mul(quadraticCoeff);
  const yfSquared = yf.mul(yf);
  const linearCoeffNonNeg = quadraticCoeffTimesX0.add(w).add(yfSquared);
  const linearCoeff = linearCoeffNonNeg.neg();

  // output amount = initial reserve - final reserve
  const xOut = x0.sub(xf);
  // horners method
  // ax^3 + bx^2 + cx
  const term1 = cubicCoeff.mul(xOut).mul(xOut).mul(xOut);
  const term2 = quadraticCoeff.mul(xOut).mul(xOut);
  const term3 = linearCoeff.mul(xOut);

  const res = term1.add(term2).add(term3);

  return res;
}

/**
 multi-asset CFMM is xyv(x^2 + y^2 + w) = k,
 where u is the product of the reserves of assets
 outside of x and y (e.g. u = wz), and v is the sum
 of their squares (e.g. v = w^2 + z^2).
 When u = 1 and v = 0, this is equivalent to solidly's CFMM
 */
export function cfmmConstantMultiNoV(
  xReserve: BigDec,
  yReserve: BigDec,
  wSumSquares: BigDec
): BigDec {
  if (
    !xReserve.isPositive() ||
    !yReserve.isPositive() ||
    wSumSquares.isNegative()
  )
    throw Error("reserves must be positive");

  const xy = xReserve.mul(yReserve);
  const x2 = xReserve.mul(xReserve);
  const y2 = yReserve.mul(yReserve);
  const innerSum = x2.add(y2).add(wSumSquares);
  return xy.mul(innerSum);
}

export function binarySearch(
  makeOutput: (est: BigDec) => BigDec,
  lowerBound: BigDec,
  upperBound: BigDec,
  targetOutput: BigDec,
  maxIterations = 256,
  errorTolerance = oneBigDec.quo(
    new BigDec(DecUtils.getTenExponentNInPrecisionRange(12))
  )
): BigDec {
  // base of loop
  let curEstSum = lowerBound.add(upperBound);
  let curEstimate = curEstSum.quo(new BigDec(2));
  let curOutput = makeOutput(curEstimate);

  // only need multiplicative error tolerance

  for (let curIteration = 0; curIteration < maxIterations; curIteration++) {
    const compare = checkMultiplicativeErrorTolerance(
      targetOutput,
      curOutput,
      errorTolerance,
      "roundUp"
    );

    if (compare < 0) {
      upperBound = curEstimate;
    } else if (compare > 0) {
      lowerBound = curEstimate;
    } else {
      return curEstimate;
    }
    curEstSum = lowerBound.add(upperBound);
    curEstimate = curEstSum.quo(new BigDec(2));
    curOutput = makeOutput(curEstimate);
  }

  throw Error("binary search did not converge");
}

export function calcWSumSquares(remReserves: BigDec[]): BigDec {
  let wSumSquares = new BigDec(0);
  remReserves.forEach((reserve) => {
    const reserveSquared = reserve.mul(reserve);
    wSumSquares = wSumSquares.add(reserveSquared);
  });
  return wSumSquares;
}
