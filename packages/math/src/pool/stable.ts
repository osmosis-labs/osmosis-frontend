import { Coin, Dec, DecUtils } from "@keplr-wallet/unit";
// import { BigDec } from "../big-dec";

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
  const tokenInLessFee = tokenInScaled.mul(oneDec.sub(swapFee));

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
    wSumSquares = wSumSquares.add(reserve.mul(reserve));
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

  // find change in k
  const kRatio = k0.quo(k);
  if (kRatio.lt(oneDec)) {
    xHighEst = xReserve.quo(kRatio).roundUpDec();
  } else if (kRatio.gt(oneDec)) {
    xLowEst = new Dec(0);
  } else {
    return new Dec(0);
  }

  const computeFromEst = (xEst: Dec) =>
    cfmmConstantMultiNoV(xEst, yFinal, wSumSquares);

  const xEst = binarySearch(computeFromEst, xLowEst, xHighEst, k);

  const xOut = xReserve.sub(xEst);

  if (xOut.abs().gte(xReserve))
    throw Error("invalid output: greater than full pool reserves");

  return xOut;
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
  return xy.mul(x2.add(y2).add(wSumSquares));
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
  let curEstimate = lowerBound.add(upperBound).quo(new Dec(2));
  let curOutput = makeOutput(curEstimate);

  // only need multiplicative error tolerance

  for (let curIteration = 0; curIteration < maxIterations; curIteration++) {
    const compare = compare_checkMultErrorTolerance(
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
    curEstimate = lowerBound.add(upperBound).quo(new Dec(2));
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
  const diff = expected.sub(actual).abs();
  const errorTerm = diff.quo(min);
  if (errorTerm.gt(tolerance)) {
    return comparison;
  }

  return 0;
}
