import { Coin, Dec, DecUtils } from "@keplr-wallet/unit";

export const StableSwapMath = {
  calcOutGivenIn,
  calcInGivenOut,
  calcSpotPrice,
  // secondary
  solveCfmm,
  compare_checkMultErrorTolerance,
};

const oneDec = new Dec(1);

export type StableSwapToken = {
  amount: Dec;
  denom: string;
  scalingFactor: number;
};

// calculates exact output given an input with no rounding/truncation
export function solveCalcOutGivenIn(
  tokens: StableSwapToken[],
  tokenIn: Coin,
  tokenOutDenom: string,
  swapFee: Dec
): Dec {
  const scaledTokens = scaleTokens(tokens);

  const tokenInScalingFactor = tokens.find(
    ({ denom }) => denom === tokenIn.denom
  )?.scalingFactor;

  if (!tokenInScalingFactor) throw Error("tokenIn denom not in pool tokens");

  const tokenInScaled = new Dec(tokenIn.amount).quoTruncate(
    new Dec(tokenInScalingFactor)
  );

  // we apply swap fee before running solver since we are going input -> output
  const oneMinusSwapFee = oneDec.sub(swapFee);
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

  return cfmmOut.mul(new Dec(tokenOutSupply.scalingFactor));
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

  const tokenOutScaled = new Dec(tokenOut.amount).quoTruncate(
    new Dec(tokenOutScalingFactor)
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
    throw new Error("token supply incorrect");

  const cfmmOut = solveCfmm(
    tokenInSupply.amount,
    tokenOutSupply.amount,
    remReserves,
    tokenOutScaled.neg()
  );

  // we negate the calculated input since our solver is negative in negative out
  const calculatedInput = cfmmOut.neg();

  // we apply swap fee after running solver since we are going output -> input
  const tokenInPlusFee = calculatedInput.quoRoundUp(oneDec.sub(swapFee));

  return tokenInPlusFee.mul(new Dec(tokenOutSupply.scalingFactor)).roundUp();
}

export function scaleTokens(tokens: StableSwapToken[]): StableSwapToken[] {
  return tokens.map((token) => ({
    ...token,
    amount: token.amount.quo(new Dec(token.scalingFactor)),
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

  return approxSpotPrice;
}

export function solveCfmm(
  xReserve: Dec,
  yReserve: Dec,
  remReserves: Dec[],
  yIn: Dec
): Dec {
  let wSumSquares = new Dec(0);
  remReserves.forEach((reserve) => {
    const reserveSquared = reserve.mul(reserve);
    wSumSquares = wSumSquares.add(reserveSquared);
  });

  return solveCfmmBinarySearchMulti(xReserve, yReserve, wSumSquares, yIn);
}

export function solveCfmmBinarySearchMulti(
  xReserve: Dec,
  yReserve: Dec,
  wSumSquares: Dec,
  yIn: Dec
): Dec {
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
  if (kRatio.lt(oneDec)) {
    xHighEst = xReserve.quo(kRatio).roundUpDec();
  } else if (kRatio.gt(oneDec)) {
    xLowEst = new Dec(0);
  }

  const targetK = targetKCalculator(xReserve, yReserve, wSumSquares, yFinal);
  const iterKCalc = (xEst: Dec) =>
    iterKCalculator(xEst, xReserve, yFinal, wSumSquares);

  const xEst = binarySearch(iterKCalc, xLowEst, xHighEst, targetK);

  const xOut = xReserve.sub(xEst);

  console.log(
    "xHighEst: ",
    xHighEst,
    "xLowEst: ",
    xLowEst,
    "xReserve: ",
    xReserve,
    "yReserve: ",
    yReserve,
    "yIn: ",
    yIn,
    "xEst: ",
    xEst,
    "final solver output: ",
    xOut
  );

  if (xOut.abs().gte(xReserve))
    throw Error("invalid output: greater than full pool reserves");

  return xOut;
}

export function targetKCalculator(x0: Dec, y0: Dec, w: Dec, yf: Dec): Dec {
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

export function iterKCalculator(xf: Dec, x0: Dec, w: Dec, yf: Dec): Dec {
  // compute coefficients first
  const cubicCoeff = oneDec.neg();
  const quadraticCoeff = x0.mul(new Dec(3));
  const quadraticCoeffTimesX0 = x0.mul(quadraticCoeff);
  const yfSquared = yf.mul(yf);
  const linearCoeffNonNeg = quadraticCoeffTimesX0.add(w).add(yfSquared);
  const linearCoeff = linearCoeffNonNeg.neg();

  // output amount = initial reserve - final reserve
  const xOut = x0.sub(xf);
  // horners method
  // ax^3 + bx^2 + cx = x(c + x(b + ax))
  let res = cubicCoeff.mul(xOut);
  res = res.add(quadraticCoeff);
  res = res.mul(xOut);
  res = res.add(linearCoeff);
  res = res.mul(xOut);

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
  xReserve: Dec,
  yReserve: Dec,
  wSumSquares: Dec
): Dec {
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
  makeOutput: (est: Dec) => Dec,
  lowerBound: Dec,
  upperBound: Dec,
  targetOutput: Dec,
  maxIterations = 256,
  errorTolerance = oneDec.quo(DecUtils.getTenExponentNInPrecisionRange(12))
): Dec {
  // base of loop
  let curEstSum = lowerBound.add(upperBound);
  let curEstimate = curEstSum.quo(new Dec(2));
  let curOutput = makeOutput(curEstimate);

  // only need multiplicative error tolerance

  for (let curIteration = 0; curIteration < maxIterations; curIteration++) {
    const compare = compare_checkMultErrorTolerance(
      targetOutput,
      curOutput,
      errorTolerance,
      "roundUp"
    );
    console.log(
      "curIteration: ",
      curIteration,
      "xHighEst: ",
      upperBound,
      "xLowEst: ",
      lowerBound,
      "targetOutput: ",
      targetOutput,
      "curEstimate: ",
      curEstimate,
      "curOutput: ",
      curOutput
    );

    if (compare < 0) {
      upperBound = curEstimate;
    } else if (compare > 0) {
      lowerBound = curEstimate;
    } else {
      console.log("exited!");
      return curEstimate;
    }
    curEstSum = lowerBound.add(upperBound);
    curEstimate = curEstSum.quo(new Dec(2));
    curOutput = makeOutput(curEstimate);
  }

  throw Error("binary search did not converge");
}

export function compare_checkMultErrorTolerance(
  expected: Dec,
  actual: Dec,
  tolerance: Dec,
  roundingMode: string
) {
  let comparison = 0;
  if (expected.gt(actual)) {
    comparison = 1;
  } else {
    comparison = -1;
  }

  // roundBankers case is handled by default quo function so we
  // fall back to that for all other roundingMode inputs
  if (roundingMode == "roundDown") {
    if (expected.lt(actual)) return -1;
  } else if (roundingMode == "roundUp") {
    if (expected.gt(actual)) return 1;
  }

  // multiplicative tolerance

  if (tolerance.isZero()) return 0;

  // get min dec
  let min = actual;
  if (expected.lt(min)) {
    min = expected;
  }

  // check mult tolerance
  const diff = expected.sub(actual);
  const diffAbs = diff.abs();
  const errorTerm = diffAbs.quo(min.abs());
  if (errorTerm.gt(tolerance)) {
    return comparison;
  }

  console.log(
    "these two are equal!: ",
    expected,
    actual,
    "diff & diffAbs: ",
    diff,
    diffAbs,
    "min term: ",
    min,
    "error term: ",
    errorTerm,
    "tolerance: ",
    tolerance
  );

  return 0;
}
