import bigInteger from "big-integer";
import { Int } from "./int";
export declare class BigDec {
  static readonly precision = 36;
  protected static readonly decimalPrecisionBits = 60;
  protected static readonly maxDec: bigInteger.BigInteger;
  protected static readonly precisionMultipliers: {
    [key: string]: bigInteger.BigInteger | undefined;
  };
  protected static calcPrecisionMultiplier(prec: number): bigInteger.BigInteger;
  protected static reduceDecimalsFromString(str: string): {
    res: string;
    isDownToZero: boolean;
  };
  protected int: bigInteger.BigInteger;
  /**
   * Create a new BigDec from integer with decimal place at prec
   * @param int - Parse a number | bigInteger | string into a BigDec.
   * If int is string and contains dot(.), prec is ignored and automatically calculated.
   * @param prec - Precision
   */
  constructor(int: bigInteger.BigNumber | Int, prec?: number);
  protected checkBitLen(): void;
  isZero(): boolean;
  isNegative(): boolean;
  isPositive(): boolean;
  equals(d2: BigDec): boolean;
  /**
   * Alias for the greater method.
   */
  gt(d2: BigDec): boolean;
  /**
   * Alias for the greaterOrEquals method.
   */
  gte(d2: BigDec): boolean;
  /**
   * Alias for the lesser method.
   */
  lt(d2: BigDec): boolean;
  /**
   * Alias for the lesserOrEquals method.
   */
  lte(d2: BigDec): boolean;
  /**
   * reverse the decimal sign.
   */
  neg(): BigDec;
  /**
   * Returns the absolute value of a decimals.
   */
  abs(): BigDec;
  add(d2: BigDec): BigDec;
  sub(d2: BigDec): BigDec;
  pow(n: Int): BigDec;
  mul(d2: BigDec): BigDec;
  mulTruncate(d2: BigDec): BigDec;
  protected mulRaw(d2: BigDec): BigDec;
  quo(d2: BigDec): BigDec;
  quoTruncate(d2: BigDec): BigDec;
  quoRoundUp(d2: BigDec): BigDec;
  protected quoRaw(d2: BigDec): BigDec;
  isInteger(): boolean;
  /**
   * Remove a Precision amount of rightmost digits and perform bankers rounding
   * on the remainder (gaussian rounding) on the digits which have been removed.
   */
  protected chopPrecisionAndRound(): bigInteger.BigInteger;
  protected chopPrecisionAndRoundUp(): bigInteger.BigInteger;
  /**
   * Similar to chopPrecisionAndRound, but always rounds down
   */
  protected chopPrecisionAndTruncate(): bigInteger.BigInteger;
  toString(prec?: number, locale?: boolean): string;
  round(): Int;
  roundUp(): Int;
  truncate(): Int;
  roundDec(): BigDec;
  roundUpDec(): BigDec;
  truncateDec(): BigDec;
}
