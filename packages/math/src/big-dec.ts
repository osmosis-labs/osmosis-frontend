import {
  bigIntAbs as abs,
  bigIntPow as pow,
  CoinUtils,
  Dec,
  exponentDecStringToDecString,
  Int,
  isExponentDecString,
  isValidDecimalString,
} from "@osmosis-labs/unit";

export class BigDec {
  public static readonly precision = 36;
  // Bytes required to represent the above precision is 36.
  // Ceiling[Log2[999 999 999 999 999 999]]
  protected static readonly decimalPrecisionBits = 120;
  // Max bit length for `BigDec` is 1024 + 120(decimalPrecisionBits)
  // The int in the `BigDec` is handled as integer assuming that it has 36 precision.
  // (2 ** (1024 + 120) - 1)
  protected static readonly maxDec = BigInt(
    "238954404268933865125126537965647370348186772435315621289825771761405069515984212194479937258429577313733767604974644713064293001386859963477865690977385256586189347544846179894960090613343571873484581297429015320656710070604819135113469266235546964237890007694823296373534385169983015617629084799101278271338071223315759934627648900036785340415"
  );

  protected static readonly precisionMultipliers: {
    [key: string]: bigint | undefined;
  } = {};
  protected static calcPrecisionMultiplier(prec: number): bigint {
    if (prec < 0) {
      throw new Error("Invalid prec");
    }
    if (prec > BigDec.precision) {
      throw new Error("Too much precision");
    }
    if (BigDec.precisionMultipliers[prec.toString()]) {
      return BigDec.precisionMultipliers[prec.toString()]!;
    }

    const zerosToAdd = BigDec.precision - prec;
    const multiplier = pow(BigInt(10), BigInt(zerosToAdd));
    BigDec.precisionMultipliers[prec.toString()] = multiplier;
    return multiplier;
  }

  protected static reduceDecimalsFromString(str: string): {
    res: string;
    isDownToZero: boolean;
  } {
    const decimalPointIndex = str.indexOf(".");
    if (decimalPointIndex < 0) {
      return {
        res: str,
        isDownToZero: false,
      };
    }

    const exceededDecimals =
      str.length - 1 - decimalPointIndex - BigDec.precision;
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

  protected int: bigint;

  /**
   * Create a new BigDec from integer with decimal place at prec
   * @param value - Parse a number | bigint | string into a BigDec.
   * If int is string and contains dot(.), prec is ignored and automatically calculated.
   * @param prec - Precision
   */
  constructor(value: number | string | bigint | Int | Dec, prec: number = 0) {
    if (typeof value === "number") {
      value = value.toString();
    }

    if (value instanceof Dec) {
      value = value.toString();
    }

    if (typeof value === "string") {
      if (value.length === 0) {
        throw new Error("empty string");
      }
      if (!isValidDecimalString(value)) {
        if (isExponentDecString(value)) {
          value = exponentDecStringToDecString(value);
        } else {
          throw new Error(`invalid decimal: ${value}`);
        }
      }
      // Even if an input with more than 36 decimals, it does not throw an error and ignores the rest.
      const reduced = BigDec.reduceDecimalsFromString(value);
      if (reduced.isDownToZero) {
        // However, as a result, if the input becomes 0, a problem may occur in mul or quo. In this case, print a warning.
        console.warn(
          `Got ${value}. BigDec can only handle up to 36 decimals. However, since the decimal point of the input exceeds 36 digits, the remainder is discarded. As a result, input becomes 0.`
        );
      }
      value = reduced.res;
      if (value.indexOf(".") >= 0) {
        prec = value.length - value.indexOf(".") - 1;
        value = value.replace(".", "");
      }
      this.int = BigInt(value);
    } else if (value instanceof Int) {
      this.int = BigInt(value.toString());
    } else {
      this.int = BigInt(value);
    }

    this.int = this.int * BigDec.calcPrecisionMultiplier(prec);

    this.checkBitLen();
  }

  protected checkBitLen(): void {
    if (abs(this.int) > BigDec.maxDec) {
      throw new Error(`Integer out of range ${this.int.toString()}`);
    }
  }

  public isZero(): boolean {
    return this.int === BigInt(0);
  }

  public isNegative(): boolean {
    return this.int < BigInt(0);
  }

  public isPositive(): boolean {
    return this.int > BigInt(0);
  }

  public equals(d2: BigDec): boolean {
    return this.int === d2.int;
  }

  public toDec(): Dec {
    return new Dec(this.toString());
  }

  /**
   * Alias for the greater method.
   */
  public gt(d2: BigDec): boolean {
    return this.int > d2.int;
  }

  /**
   * Alias for the greaterOrEquals method.
   */
  public gte(d2: BigDec): boolean {
    return this.int >= d2.int;
  }

  /**
   * Alias for the lesser method.
   */
  public lt(d2: BigDec): boolean {
    return this.int < d2.int;
  }

  /**
   * Alias for the lesserOrEquals method.
   */
  public lte(d2: BigDec): boolean {
    return this.int <= d2.int;
  }

  /**
   * reverse the decimal sign.
   */
  public neg(): BigDec {
    return new BigDec(-this.int, BigDec.precision);
  }

  /**
   * Returns the absolute value of a decimals.
   */
  public abs(): BigDec {
    return new BigDec(abs(this.int), BigDec.precision);
  }

  public add(d2: BigDec): BigDec {
    return new BigDec(this.int + d2.int, BigDec.precision);
  }

  public sub(d2: BigDec): BigDec {
    return new BigDec(this.int - d2.int, BigDec.precision);
  }

  public pow(n: Int): BigDec {
    if (n.isZero()) {
      return new BigDec(1);
    }

    if (n.isNegative()) {
      return new BigDec(1).quo(this.pow(n.abs()));
    }

    let base = new BigDec(this.int, BigDec.precision);
    let tmp = new BigDec(1);

    for (let i = n; i.gt(new Int(1)); i = i.div(new Int(2))) {
      if (!i.mod(new Int(2)).isZero()) {
        tmp = tmp.mul(base);
      }
      base = base.mul(base);
    }

    return base.mul(tmp);
  }

  public mul(d2: BigDec): BigDec {
    return new BigDec(
      this.mulRaw(d2).chopPrecisionAndRound(),
      BigDec.precision
    );
  }

  public mulRoundUp(d2: BigDec): BigDec {
    return new BigDec(
      this.mulRaw(d2).chopPrecisionAndRoundUp(),
      BigDec.precision
    );
  }

  public mulTruncate(d2: BigDec): BigDec {
    return new BigDec(
      this.mulRaw(d2).chopPrecisionAndTruncate(),
      BigDec.precision
    );
  }

  protected mulRaw(d2: BigDec): BigDec {
    return new BigDec(this.int * d2.int, BigDec.precision);
  }

  public quo(d2: BigDec): BigDec {
    return new BigDec(
      this.quoRaw(d2).chopPrecisionAndRound(),
      BigDec.precision
    );
  }

  public quoTruncate(d2: BigDec): BigDec {
    return new BigDec(
      this.quoRaw(d2).chopPrecisionAndTruncate(),
      BigDec.precision
    );
  }

  public quoRoundUp(d2: BigDec): BigDec {
    return new BigDec(
      this.quoRaw(d2).chopPrecisionAndRoundUp(),
      BigDec.precision
    );
  }

  protected quoRaw(d2: BigDec): BigDec {
    const precision = BigDec.calcPrecisionMultiplier(0);

    // multiply precision twice
    const mul = this.int * precision * precision;
    return new BigDec(mul / d2.int, BigDec.precision);
  }

  public isInteger(): boolean {
    const precision = BigDec.calcPrecisionMultiplier(0);
    return this.int % precision === BigInt(0);
  }

  /**
   * Remove a Precision amount of rightmost digits and perform bankers rounding
   * on the remainder (gaussian rounding) on the digits which have been removed.
   */
  protected chopPrecisionAndRound(): bigint {
    // Remove the negative and add it back when returning
    if (this.isNegative()) {
      const absoulteDec = this.abs();
      const choped = absoulteDec.chopPrecisionAndRound();
      return -choped;
    }

    const precision = BigDec.calcPrecisionMultiplier(0);
    const fivePrecision = precision / BigInt(2);

    // Get the truncated quotient and remainder
    const quotient = this.int / precision;
    const remainder = this.int % precision;

    // If remainder is zero
    if (remainder === BigInt(0)) {
      return quotient;
    }

    if (remainder < fivePrecision) {
      return quotient;
    } else if (remainder > fivePrecision) {
      return quotient + BigInt(1);
    } else {
      // Exactly half: round to the even neighbour, as cosmos-sdk's
      // chopPrecisionAndRound does (quo.Bit(0) == 0 keeps quo).
      if (quotient % BigInt(2) === BigInt(0)) {
        return quotient;
      } else {
        return quotient + BigInt(1);
      }
    }
  }

  protected chopPrecisionAndRoundUp(): bigint {
    // Remove the negative and add it back when returning
    if (this.isNegative()) {
      const absoulteDec = this.abs();
      // truncate since d is negative...
      const choped = absoulteDec.chopPrecisionAndTruncate();
      return -choped;
    }

    const precision = BigDec.calcPrecisionMultiplier(0);

    // Get the truncated quotient and remainder
    const quotient = this.int / precision;
    const remainder = this.int % precision;

    // If remainder is zero
    if (remainder === BigInt(0)) {
      return quotient;
    }

    return quotient + BigInt(1);
  }

  /**
   * Similar to chopPrecisionAndRound, but always rounds down
   */
  protected chopPrecisionAndTruncate(): bigint {
    const precision = BigDec.calcPrecisionMultiplier(0);
    return this.int / precision;
  }

  public toString(
    prec: number = BigDec.precision,
    locale: boolean = false
  ): string {
    const precision = BigDec.calcPrecisionMultiplier(0);
    const int = abs(this.int);
    const integer = int / precision;
    const fraction = int % precision;

    let fractionStr = fraction.toString(10);
    for (let i = 0, l = fractionStr.length; i < BigDec.precision - l; i++) {
      fractionStr = "0" + fractionStr;
    }
    fractionStr = fractionStr.substring(0, prec);

    const isNegative =
      this.isNegative() && !(integer === BigInt(0) && fractionStr.length === 0);

    const integerStr = locale
      ? // @ts-ignore
        CoinUtils.integerStringToUSLocaleString(integer.toString())
      : integer.toString();

    return `${isNegative ? "-" : ""}${integerStr}${
      fractionStr.length > 0 ? "." + fractionStr : ""
    }`;
  }

  /**
   * Serialize as a decimal string. Native `bigint` fields make
   * `JSON.stringify` throw otherwise.
   */
  public toJSON(): string {
    return this.toString();
  }

  public round(): Int {
    return new Int(this.chopPrecisionAndRound());
  }

  public roundUp(): Int {
    return new Int(this.chopPrecisionAndRoundUp());
  }

  public truncate(): Int {
    return new Int(this.chopPrecisionAndTruncate());
  }

  public roundDec(): BigDec {
    return new BigDec(this.chopPrecisionAndRound(), 0);
  }

  public roundUpDec(): BigDec {
    return new BigDec(this.chopPrecisionAndRoundUp(), 0);
  }

  public truncateDec(): BigDec {
    return new BigDec(this.chopPrecisionAndTruncate(), 0);
  }
}
