export function checkMultiplicativeErrorTolerance<
  Decimal extends {
    gt(other: Decimal): boolean;
    lt(other: Decimal): boolean;
    abs(): Decimal;
    quo(other: Decimal): Decimal;
    sub(other: Decimal): Decimal;
    isZero(): boolean;
  }
>(
  expected: Decimal,
  actual: Decimal,
  tolerance: Decimal,
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

  return 0;
}
