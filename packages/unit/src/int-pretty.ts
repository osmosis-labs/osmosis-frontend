import bigInteger from "big-integer";
import { DeepReadonly } from "utility-types";

import { CoinUtils } from "./coin-utils";
import { DecUtils } from "./dec-utils";
import { Dec } from "./decimal";

export type IntPrettyOptions = {
  maxDecimals: number;
  trim: boolean;
  shrink: boolean;
  ready: boolean;
  locale: boolean;
  // If this is true, toString() will return the string with prefix like < 0.001 if a value cannot be expressed with a max decimals.
  inequalitySymbol: boolean;
  inequalitySymbolSeparator: string;
};

export class IntPretty {
  protected dec: Dec;
  protected floatingDecimalPointRight = 0;

  protected _options: IntPrettyOptions = {
    maxDecimals: 0,
    trim: false,
    shrink: false,
    ready: true,
    locale: true,
    inequalitySymbol: false,
    inequalitySymbolSeparator: " ",
  };
  // note if you add another field, update clone()

  constructor(num: Dec | { toDec(): Dec } | bigInteger.BigNumber) {
    if (typeof num === "object" && "toDec" in num) {
      num = num.toDec();
    } else if (!(num instanceof Dec)) {
      num = new Dec(num);
    }

    if (num.isZero()) {
      this.dec = num;
      return;
    }

    // Get string representation and find decimal position
    const decStr = num.toString();
    const decimalIndex = decStr.indexOf('.');
    
    // If no decimal point no precision needed
    if (decimalIndex === -1) {
      this.dec = num;
      this._options.maxDecimals = 0;
      return;
    }
  
    // Count significant digits by walking backwards until non-zero digit
    const decimalPart = decStr.slice(decimalIndex + 1);
    let trailingZeros = 0;
    for (let i = decimalPart.length - 1; i >= 0 && decimalPart[i] === '0'; i--) {
      trailingZeros++;
    }
    const decPrecision = decimalPart.length - trailingZeros;

    this.dec = num;
    this._options.maxDecimals = decPrecision;
  }

  get options(): DeepReadonly<IntPrettyOptions> {
    return this._options;
  }

  moveDecimalPointLeft(delta: number): IntPretty {
    const pretty = this.clone();
    pretty.floatingDecimalPointRight += -delta;
    return pretty;
  }

  moveDecimalPointRight(delta: number): IntPretty {
    const pretty = this.clone();
    pretty.floatingDecimalPointRight += delta;
    return pretty;
  }

  /**
   * @deprecated Use`moveDecimalPointLeft`
   */
  increasePrecision(delta: number): IntPretty {
    return this.moveDecimalPointLeft(delta);
  }

  /**
   * @deprecated Use`moveDecimalPointRight`
   */
  decreasePrecision(delta: number): IntPretty {
    return this.moveDecimalPointRight(delta);
  }

  maxDecimals(max: number): IntPretty {
    const pretty = this.clone();
    pretty._options.maxDecimals = max;
    return pretty;
  }

  inequalitySymbol(bool: boolean): IntPretty {
    const pretty = this.clone();
    pretty._options.inequalitySymbol = bool;
    return pretty;
  }

  inequalitySymbolSeparator(str: string): IntPretty {
    const pretty = this.clone();
    pretty._options.inequalitySymbolSeparator = str;
    return pretty;
  }

  trim(bool: boolean): IntPretty {
    const pretty = this.clone();
    pretty._options.trim = bool;
    return pretty;
  }

  shrink(bool: boolean): IntPretty {
    const pretty = this.clone();
    pretty._options.shrink = bool;
    return pretty;
  }

  locale(locale: boolean): IntPretty {
    const pretty = this.clone();
    pretty._options.locale = locale;
    return pretty;
  }

  /**
   * Ready indicates the actual value is ready to show the users.
   * Even if the ready option is false, it expects that the value can be shown to users (probably as 0).
   * The method that returns prettied value may return `undefined` or `null` if the value is not ready.
   * But, alternatively, it can return the 0 value that can be shown the users anyway, but indicates that the value is not ready.
   * @param bool
   */
  ready(bool: boolean): IntPretty {
    const pretty = this.clone();
    pretty._options.ready = bool;
    return pretty;
  }

  get isReady(): boolean {
    return this._options.ready;
  }

  add(target: Dec | { toDec(): Dec }): IntPretty {
    if (!(target instanceof Dec)) {
      target = target.toDec();
    }

    const pretty = new IntPretty(this.toDec().add(target));
    pretty._options = {
      ...this._options,
    };
    return pretty;
  }

  sub(target: Dec | { toDec(): Dec }): IntPretty {
    if (!(target instanceof Dec)) {
      target = target.toDec();
    }

    const pretty = new IntPretty(this.toDec().sub(target));
    pretty._options = {
      ...this._options,
    };
    return pretty;
  }

  mul(target: Dec | { toDec(): Dec }): IntPretty {
    if (!(target instanceof Dec)) {
      target = target.toDec();
    }

    const pretty = new IntPretty(this.toDec().mul(target));
    pretty._options = {
      ...this._options,
    };
    return pretty;
  }

  quo(target: Dec | { toDec(): Dec }): IntPretty {
    if (!(target instanceof Dec)) {
      target = target.toDec();
    }

    const pretty = new IntPretty(this.toDec().quo(target));
    pretty._options = {
      ...this._options,
    };
    return pretty;
  }

  toDec(): Dec {
    if (this.floatingDecimalPointRight === 0) {
      return this.dec;
    } else if (this.floatingDecimalPointRight > 0) {
      return this.dec.mulTruncate(
        DecUtils.getTenExponentN(this.floatingDecimalPointRight)
      );
    } else {
      // Since a decimal in Dec cannot exceed 18, it cannot be computed at once.
      let i = -this.floatingDecimalPointRight;
      let dec = this.dec;
      while (i > 0) {
        if (i >= Dec.precision) {
          dec = dec.mulTruncate(DecUtils.getTenExponentN(-Dec.precision));
          i -= Dec.precision;
        } else {
          dec = dec.mulTruncate(DecUtils.getTenExponentN(-(i % Dec.precision)));
          break;
        }
      }
      return dec;
    }
  }

  toString(): string {
    return this.toStringWithSymbols("", "");
  }

  toStringWithSymbols(prefix: string, suffix: string): string {
    const dec = this.toDec();

    if (
      this._options.inequalitySymbol &&
      !dec.isZero() &&
      dec.abs().lt(DecUtils.getTenExponentN(-this._options.maxDecimals))
    ) {
      const isNeg = dec.isNegative();

      return `${isNeg ? ">" : "<"}${this._options.inequalitySymbolSeparator}${
        isNeg ? "-" : ""
      }${prefix}${DecUtils.getTenExponentN(-this._options.maxDecimals).toString(
        this._options.maxDecimals,
        this._options.locale
      )}${suffix}`;
    }

    let result: string;
    if (!this._options.shrink) {
      result = dec.toString(this._options.maxDecimals, this._options.locale);
    } else {
      result = CoinUtils.shrinkDecimals(
        dec,
        0,
        this._options.maxDecimals,
        this._options.locale
      );
    }
    if (this._options.trim) {
      result = DecUtils.trim(result);
    }

    const isNeg = result.charAt(0) === "-";
    if (isNeg) {
      result = result.slice(1);
    }

    return `${isNeg ? "-" : ""}${prefix}${result}${suffix}`;
  }

  clone(): IntPretty {
    // doing a constructor call is slow, so we use this method instead
    return Object.setPrototypeOf(
      { dec: this.dec, floatingDecimalPointRight: this.floatingDecimalPointRight, _options: { ...this._options } },
      IntPretty.prototype
    );
  }
}
