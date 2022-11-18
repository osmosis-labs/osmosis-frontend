"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dec = void 0;
const big_integer_1 = __importDefault(require("big-integer"));
const int_1 = require("./int");
const coin_utils_1 = require("./coin-utils");
const etc_1 = require("./etc");
class Dec {
  /**
   * Create a new Dec from integer with decimal place at prec
   * @param int - Parse a number | bigInteger | string into a Dec.
   * If int is string and contains dot(.), prec is ignored and automatically calculated.
   * @param prec - Precision
   */
  constructor(int, prec = 0) {
    if (typeof int === "number") {
      int = int.toString();
    }
    if (typeof int === "string") {
      if (int.length === 0) {
        throw new Error("empty string");
      }
      if (!etc_1.isValidDecimalString(int)) {
        if (etc_1.isExponentDecString(int)) {
          int = etc_1.exponentDecStringToDecString(int);
        } else {
          throw new Error(`invalid decimal: ${int}`);
        }
      }
      // Even if an input with more than 18 decimals, it does not throw an error and ignores the rest.
      const reduced = Dec.reduceDecimalsFromString(int);
      if (reduced.isDownToZero) {
        // However, as a result, if the input becomes 0, a problem may occur in mul or quo. In this case, print a warning.
        console.log(
          `WARNING: Got ${int}. Dec can only handle up to 18 decimals. However, since the decimal point of the input exceeds 18 digits, the remainder is discarded. As a result, input becomes 0.`
        );
      }
      int = reduced.res;
      if (int.indexOf(".") >= 0) {
        prec = int.length - int.indexOf(".") - 1;
        int = int.replace(".", "");
      }
      this.int = big_integer_1.default(int);
    } else if (int instanceof int_1.Int) {
      this.int = big_integer_1.default(int.toString());
    } else if (typeof int === "bigint") {
      this.int = big_integer_1.default(int);
    } else {
      this.int = big_integer_1.default(int);
    }
    this.int = this.int.multiply(Dec.calcPrecisionMultiplier(prec));
    this.checkBitLen();
  }
  static calcPrecisionMultiplier(prec) {
    if (prec < 0) {
      throw new Error("Invalid prec");
    }
    if (prec > Dec.precision) {
      throw new Error("Too much precision");
    }
    if (Dec.precisionMultipliers[prec.toString()]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return Dec.precisionMultipliers[prec.toString()];
    }
    const zerosToAdd = Dec.precision - prec;
    const multiplier = big_integer_1.default(10).pow(zerosToAdd);
    Dec.precisionMultipliers[prec.toString()] = multiplier;
    return multiplier;
  }
  static reduceDecimalsFromString(str) {
    const decimalPointIndex = str.indexOf(".");
    if (decimalPointIndex < 0) {
      return {
        res: str,
        isDownToZero: false,
      };
    }
    const exceededDecimals = str.length - 1 - decimalPointIndex - Dec.precision;
    if (exceededDecimals <= 0) {
      return {
        res: str,
        isDownToZero: false,
      };
    }
    const res = str.slice(0, str.length - exceededDecimals);
    return {
      res,
      isDownToZero: /^[0.]*$/.test(res),
    };
  }
  checkBitLen() {
    if (this.int.abs().gt(Dec.maxDec)) {
      throw new Error(`Integer out of range ${this.int.toString()}`);
    }
  }
  isZero() {
    return this.int.eq(big_integer_1.default(0));
  }
  isNegative() {
    return this.int.isNegative();
  }
  isPositive() {
    return this.int.isPositive();
  }
  equals(d2) {
    return this.int.eq(d2.int);
  }
  /**
   * Alias for the greater method.
   */
  gt(d2) {
    return this.int.gt(d2.int);
  }
  /**
   * Alias for the greaterOrEquals method.
   */
  gte(d2) {
    return this.int.geq(d2.int);
  }
  /**
   * Alias for the lesser method.
   */
  lt(d2) {
    return this.int.lt(d2.int);
  }
  /**
   * Alias for the lesserOrEquals method.
   */
  lte(d2) {
    return this.int.leq(d2.int);
  }
  /**
   * reverse the decimal sign.
   */
  neg() {
    return new Dec(this.int.negate(), Dec.precision);
  }
  /**
   * Returns the absolute value of a decimals.
   */
  abs() {
    return new Dec(this.int.abs(), Dec.precision);
  }
  add(d2) {
    return new Dec(this.int.add(d2.int), Dec.precision);
  }
  sub(d2) {
    return new Dec(this.int.subtract(d2.int), Dec.precision);
  }
  pow(n) {
    if (n.isZero()) {
      return new Dec(1);
    }
    if (n.isNegative()) {
      return new Dec(1).quo(this.pow(n.abs()));
    }
    let base = new Dec(this.int, Dec.precision);
    let tmp = new Dec(1);
    for (let i = n; i.gt(new int_1.Int(1)); i = i.div(new int_1.Int(2))) {
      if (!i.mod(new int_1.Int(2)).isZero()) {
        tmp = tmp.mul(base);
      }
      base = base.mul(base);
    }
    return base.mul(tmp);
  }
  mul(d2) {
    return new Dec(this.mulRaw(d2).chopPrecisionAndRound(), Dec.precision);
  }
  mulTruncate(d2) {
    return new Dec(this.mulRaw(d2).chopPrecisionAndTruncate(), Dec.precision);
  }
  mulRaw(d2) {
    return new Dec(this.int.multiply(d2.int), Dec.precision);
  }
  quo(d2) {
    return new Dec(this.quoRaw(d2).chopPrecisionAndRound(), Dec.precision);
  }
  quoTruncate(d2) {
    return new Dec(this.quoRaw(d2).chopPrecisionAndTruncate(), Dec.precision);
  }
  quoRoundUp(d2) {
    return new Dec(this.quoRaw(d2).chopPrecisionAndRoundUp(), Dec.precision);
  }
  quoRaw(d2) {
    const precision = Dec.calcPrecisionMultiplier(0);
    // multiply precision twice
    const mul = this.int.multiply(precision).multiply(precision);
    return new Dec(mul.divide(d2.int), Dec.precision);
  }
  isInteger() {
    const precision = Dec.calcPrecisionMultiplier(0);
    return this.int.remainder(precision).equals(big_integer_1.default(0));
  }
  /**
   * Remove a Precision amount of rightmost digits and perform bankers rounding
   * on the remainder (gaussian rounding) on the digits which have been removed.
   */
  chopPrecisionAndRound() {
    // Remove the negative and add it back when returning
    if (this.isNegative()) {
      const absoulteDec = this.abs();
      const choped = absoulteDec.chopPrecisionAndRound();
      return choped.negate();
    }
    const precision = Dec.calcPrecisionMultiplier(0);
    const fivePrecision = precision.divide(big_integer_1.default(2));
    // Get the truncated quotient and remainder
    const { quotient, remainder } = this.int.divmod(precision);
    // If remainder is zero
    if (remainder.equals(big_integer_1.default(0))) {
      return quotient;
    }
    if (remainder.lt(fivePrecision)) {
      return quotient;
    } else if (remainder.gt(fivePrecision)) {
      return quotient.add(big_integer_1.default(1));
    } else {
      // always round to an even number
      if (
        quotient
          .divide(big_integer_1.default(2))
          .equals(big_integer_1.default(0))
      ) {
        return quotient;
      } else {
        return quotient.add(big_integer_1.default(1));
      }
    }
  }
  chopPrecisionAndRoundUp() {
    // Remove the negative and add it back when returning
    if (this.isNegative()) {
      const absoulteDec = this.abs();
      // truncate since d is negative...
      const choped = absoulteDec.chopPrecisionAndTruncate();
      return choped.negate();
    }
    const precision = Dec.calcPrecisionMultiplier(0);
    // Get the truncated quotient and remainder
    const { quotient, remainder } = this.int.divmod(precision);
    // If remainder is zero
    if (remainder.equals(big_integer_1.default(0))) {
      return quotient;
    }
    return quotient.add(big_integer_1.default(1));
  }
  /**
   * Similar to chopPrecisionAndRound, but always rounds down
   */
  chopPrecisionAndTruncate() {
    const precision = Dec.calcPrecisionMultiplier(0);
    return this.int.divide(precision);
  }
  toString(prec = Dec.precision, locale = false) {
    const precision = Dec.calcPrecisionMultiplier(0);
    const int = this.int.abs();
    const { quotient: integer, remainder: fraction } = int.divmod(precision);
    let fractionStr = fraction.toString(10);
    for (let i = 0, l = fractionStr.length; i < Dec.precision - l; i++) {
      fractionStr = "0" + fractionStr;
    }
    fractionStr = fractionStr.substring(0, prec);
    const isNegative =
      this.isNegative() &&
      !(integer.eq(big_integer_1.default(0)) && fractionStr.length === 0);
    const integerStr = locale
      ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        coin_utils_1.CoinUtils.integerStringToUSLocaleString(integer.toString())
      : integer.toString();
    return `${isNegative ? "-" : ""}${integerStr}${
      fractionStr.length > 0 ? "." + fractionStr : ""
    }`;
  }
  round() {
    return new int_1.Int(this.chopPrecisionAndRound());
  }
  roundUp() {
    return new int_1.Int(this.chopPrecisionAndRoundUp());
  }
  truncate() {
    return new int_1.Int(this.chopPrecisionAndTruncate());
  }
  roundDec() {
    return new Dec(this.chopPrecisionAndRound(), 0);
  }
  roundUpDec() {
    return new Dec(this.chopPrecisionAndRoundUp(), 0);
  }
  truncateDec() {
    return new Dec(this.chopPrecisionAndTruncate(), 0);
  }
}
exports.Dec = Dec;
Dec.precision = 18;
// Bytes required to represent the above precision is 18.
// Ceiling[Log2[999 999 999 999 999 999]]
Dec.decimalPrecisionBits = 60;
// Max bit length for `Dec` is 256 + 60(decimalPrecisionBits)
// The int in the `Dec` is handled as integer assuming that it has 18 precision.
// (2 ** (256 + 60) - 1)
Dec.maxDec = big_integer_1.default(
  "133499189745056880149688856635597007162669032647290798121690100488888732861290034376435130433535"
);
Dec.precisionMultipliers = {};
//# sourceMappingURL=decimal.js.map
