import { Dec, Int } from "@keplr-wallet/unit";

import { smallestDec } from "./pool/concentrated/const";

const powPrecision = new Dec("0.00000001");

// This file is intended to be a typescript implementation of power matching
// https://github.com/osmosis-labs/osmosis/blob/main/osmomath/math.go#L52 (The osmosis chain implementation)
// as closely as possible
export function pow(base: Dec, exp: Dec): Dec {
  // Exponentiation of a negative base with an arbitrary real exponent is not closed within the reals.
  // You can see this by recalling that `i = (-1)^(.5)`. We have to go to complex numbers to define this.
  // (And would have to implement complex logarithms)
  // We don't have a need for negative bases, so we don't include any such logic.
  if (!base.isPositive()) {
    throw new Error("base must be greater than 0");
  }
  // TODO: Remove this if we want to generalize the function,
  // we can adjust the algorithm in this setting.
  if (base.gte(new Dec("2"))) {
    throw new Error("base must be lesser than two");
  }

  // We will use an approximation algorithm to compute the power.
  // Since computing an integer power is easy, we split up the exponent into
  // an integer component and a fractional component.
  const integer = exp.truncate();
  const fractional = exp.sub(new Dec(integer));

  const integerPow = powInt(base, integer);

  if (fractional.isZero()) {
    return integerPow;
  }

  const fractionalPow = powApprox(base, fractional, powPrecision);

  return integerPow.mul(fractionalPow);
}

export function absDifferenceWithSign(a: Dec, b: Dec): [Dec, boolean] {
  if (a.gte(b)) {
    return [a.sub(b), false];
  } else {
    return [b.sub(a), true];
  }
}

export function powApprox(base: Dec, exp: Dec, precision: Dec): Dec {
  if (exp.isZero()) {
    return new Dec(0);
  }

  const a = exp;
  const [x, xneg] = absDifferenceWithSign(base, new Dec(1));
  let term = new Dec(1);
  let sum = new Dec(1);
  let negative = false;

  // TODO: Document this computation via taylor expansion
  for (let i = 1; term.gte(precision); i++) {
    const bigK = new Dec(1).mul(new Dec(i.toString()));
    const [c, cneg] = absDifferenceWithSign(a, bigK.sub(new Dec(1)));
    term = term.mul(c.mul(x));
    term = term.quo(bigK);

    if (term.isZero()) {
      break;
    }
    if (xneg) {
      negative = !negative;
    }

    if (cneg) {
      negative = !negative;
    }

    if (negative) {
      sum = sum.sub(term);
    } else {
      sum = sum.add(term);
    }
  }
  return sum;
}

function powInt(base: Dec, power: Int): Dec {
  if (power.equals(new Int(0))) {
    return new Dec(1);
  }
  let tmp = new Dec(1);

  for (let i = power; i.gt(new Int(1)); ) {
    if (!i.mod(new Int(2)).equals(new Int(0))) {
      tmp = tmp.mul(base);
    }
    i = i.div(new Int(2));
    base = base.mul(base);
  }

  return base.mul(tmp);
}

/**
  Approximate root using Newton's method.

  This function approximates the square root of a given decimal.
  It uses Newton's method to approximate the square root.
  It does this by iterating through the formula:
  x_{n+1} = x_n - (x_n^2 - a) / (2 * x_n)
  where x_0 is the initial approximation, a is the number whose
  square root we want to find, and x_n is the current approximation.
  The number of iterations is controlled by maxIters.

   TODO: move to decimal object see: https://github.com/chainapsis/keplr-wallet/pull/674
 */
export function approxRoot(dec: Dec, root: number, maxIters = 300): Dec {
  if (dec.isNegative()) {
    return approxRoot(dec.neg(), root).neg();
  }

  if (root === 1 || dec.isZero() || dec.equals(new Dec(1))) {
    return dec;
  }

  if (root === 0) {
    return new Dec(1);
  }

  let [guess, delta] = [new Dec(1), new Dec(1)];
  for (let i = 0; delta.abs().gt(smallestDec) && i < maxIters; i++) {
    let prev = guess.pow(new Int(root - 1));
    if (prev.isZero()) {
      prev = smallestDec;
    }
    delta = dec.quo(prev);
    delta = delta.sub(guess);
    delta = delta.quoTruncate(new Dec(root));

    guess = guess.add(delta);
  }

  return guess;
}

export function approxSqrt(dec: Dec, maxIters = 300): Dec {
  return approxRoot(dec, 2, maxIters);
}

// monotonicSqrt does a naive 1 ULP shift to the output of approxSqrt to approximate monotonicity.
// While this function is not technically monotonic, it is close enough for our purposes.
// True monotonicity can be achieved by replacing the `approxRoot` with a call to big int's lower level
// square root function (floor sqrt), which in conjunction with the 1 ULP shift will guarantee monotonicity.
export function monotonicSqrt(dec: Dec, maxIters = 300): Dec {
  let estimate = approxRoot(dec, 2, maxIters);
  const inverseValue = estimate.pow(new Int(2));

  if (inverseValue.lt(estimate)) {
    estimate = estimate.add(smallestDec);
  }

  return estimate;
}
