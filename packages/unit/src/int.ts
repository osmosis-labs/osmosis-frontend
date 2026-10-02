import { Dec } from "./decimal";
import {
  exponentDecStringToDecString,
  isExponentDecString,
  isValidIntegerString,
} from "./etc";

// `**` on bigint requires an ES2016+ target, so use square-and-multiply instead.
const pow = (base: bigint, exp: bigint): bigint => {
  let result = BigInt(1);
  while (exp > BigInt(0)) {
    if (exp % BigInt(2) === BigInt(1)) result *= base;
    base *= base;
    exp /= BigInt(2);
  }
  return result;
};

const abs = (n: bigint): bigint => (n < BigInt(0) ? -n : n);

export class Int {
  // (2 ** 256) - 1
  protected static maxInt = BigInt(
    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  );

  protected int: bigint;

  /**
   * @param int - Parse a number | bigint | string into a bigInt.
   */
  constructor(int: number | string | bigint) {
    if (typeof int === "number") {
      int = int.toString();
    }

    if (typeof int === "string") {
      if (!isValidIntegerString(int)) {
        if (isExponentDecString(int)) {
          int = exponentDecStringToDecString(int);
        } else {
          throw new Error(`invalid integer: ${int}`);
        }
      }

      this.int = BigInt(int);
    } else {
      this.int = BigInt(int);
    }

    this.checkBitLen();
  }

  protected checkBitLen(): void {
    if (abs(this.int) > Int.maxInt) {
      throw new Error(`Integer out of range ${this.int.toString()}`);
    }
  }

  public toString(): string {
    return this.int.toString(10);
  }

  /**
   * Serialize as a decimal string. Native `bigint` fields make
   * `JSON.stringify` throw otherwise.
   */
  public toJSON(): string {
    return this.toString();
  }

  public isNegative(): boolean {
    return this.int < BigInt(0);
  }

  public isPositive(): boolean {
    return this.int > BigInt(0);
  }

  public isZero(): boolean {
    return this.int === BigInt(0);
  }

  public equals(i: Int): boolean {
    return this.int === i.int;
  }

  public gt(i: Int): boolean {
    return this.int > i.int;
  }

  public gte(i: Int): boolean {
    return this.int >= i.int;
  }

  public lt(i: Int): boolean {
    return this.int < i.int;
  }

  public lte(i: Int): boolean {
    return this.int <= i.int;
  }

  public abs(): Int {
    return new Int(abs(this.int));
  }

  public absUInt(): Uint {
    return new Uint(abs(this.int));
  }

  public add(i: Int): Int {
    return new Int(this.int + i.int);
  }

  public sub(i: Int): Int {
    return new Int(this.int - i.int);
  }

  public mul(i: Int): Int {
    return new Int(this.int * i.int);
  }

  public div(i: Int): Int {
    return new Int(this.int / i.int);
  }

  public mod(i: Int): Int {
    return new Int(this.int % i.int);
  }

  public neg(): Int {
    return new Int(-this.int);
  }

  public pow(i: Uint): Int {
    return new Int(pow(this.int, i.toBigNumber()));
  }

  public toDec(): Dec {
    return new Dec(this);
  }

  public toBigNumber(): bigint {
    return this.int;
  }
}

export class Uint {
  // (2 ** 256) - 1
  protected static maxUint = (BigInt(1) << BigInt(256)) - BigInt(1);

  protected uint: bigint;

  /**
   * @param uint - Parse a number | bigint | string into a bigUint.
   */
  constructor(uint: number | string | bigint) {
    if (typeof uint === "number") {
      uint = uint.toString();
    }

    if (typeof uint === "string") {
      if (!isValidIntegerString(uint)) {
        if (isExponentDecString(uint)) {
          uint = exponentDecStringToDecString(uint);
        } else {
          throw new Error(`invalid integer: ${uint}`);
        }
      }

      this.uint = BigInt(uint);
    } else {
      this.uint = BigInt(uint);
    }

    if (this.uint < BigInt(0)) {
      throw new TypeError("Uint should not be negative");
    }

    this.checkBitLen();
  }

  protected checkBitLen(): void {
    if (this.uint > Uint.maxUint) {
      throw new Error(`Integer out of range ${this.uint.toString()}`);
    }
  }

  public toString(): string {
    return this.uint.toString(10);
  }

  /**
   * Serialize as a decimal string. Native `bigint` fields make
   * `JSON.stringify` throw otherwise.
   */
  public toJSON(): string {
    return this.toString();
  }

  public isZero(): boolean {
    return this.uint === BigInt(0);
  }

  public equals(i: Uint): boolean {
    return this.uint === i.uint;
  }

  public gt(i: Uint): boolean {
    return this.uint > i.uint;
  }

  public gte(i: Uint): boolean {
    return this.uint >= i.uint;
  }

  public lt(i: Uint): boolean {
    return this.uint < i.uint;
  }

  public lte(i: Uint): boolean {
    return this.uint <= i.uint;
  }

  public add(i: Uint): Uint {
    return new Uint(this.uint + i.uint);
  }

  public sub(i: Uint): Uint {
    return new Uint(this.uint - i.uint);
  }

  public mul(i: Uint): Uint {
    return new Uint(this.uint * i.uint);
  }

  public div(i: Uint): Uint {
    return new Uint(this.uint / i.uint);
  }

  public mod(i: Uint): Uint {
    return new Uint(this.uint % i.uint);
  }

  public pow(i: Uint): Uint {
    return new Uint(pow(this.uint, i.toBigNumber()));
  }

  public toDec(): Dec {
    return new Dec(new Int(this.toString()));
  }

  public toBigNumber(): bigint {
    return this.uint;
  }
}
