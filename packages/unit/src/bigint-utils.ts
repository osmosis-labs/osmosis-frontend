export const BIGINT_ZERO = BigInt(0);
export const BIGINT_ONE = BigInt(1);
export const BIGINT_TWO = BigInt(2);
export const BIGINT_TEN = BigInt(10);

/** `base ** exp` for non-negative `exp`. `**` on bigint needs an ES2016+
 *  target, so this is square-and-multiply. */
export function bigIntPow(base: bigint, exp: bigint): bigint {
  if (exp < BIGINT_ZERO) throw new Error("Negative exponent");
  let result = BIGINT_ONE;
  while (exp > BIGINT_ZERO) {
    if (exp % BIGINT_TWO === BIGINT_ONE) result *= base;
    base *= base;
    exp /= BIGINT_TWO;
  }
  return result;
}

export function bigIntAbs(n: bigint): bigint {
  return n < BIGINT_ZERO ? -n : n;
}
