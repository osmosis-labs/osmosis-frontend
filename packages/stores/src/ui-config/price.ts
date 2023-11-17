import { AppCurrency } from "@keplr-wallet/types";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { action, computed, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";

/** Manages user input of decimal values, and includes currency decimals in price calculation. */
export class PriceConfig {
  /** Raw value with currency decimals included. */
  @observable
  protected _decRaw: string;

  @observable.ref
  protected _baseCurrency: AppCurrency;

  @observable.ref
  protected _quoteCurrency: AppCurrency;

  constructor(
    initialBaseCurrency: AppCurrency,
    initialQuoteCurrency: AppCurrency
  ) {
    this._decRaw = "0";

    this._baseCurrency = initialBaseCurrency;
    this._quoteCurrency = initialQuoteCurrency;

    makeObservable(this);
  }

  /** Use this value with quo or mul to adjust a price for currencies decimals.
   *  Calculations are performed without currency decimals, whereas they're included for display. */
  @computed
  get multiplicationQuoteOverBase() {
    return DecUtils.getTenExponentN(
      this._baseCurrency.coinDecimals - this._quoteCurrency.coinDecimals
    );
  }

  @action
  setBaseCurrency(baseCurrency: AppCurrency) {
    this._baseCurrency = baseCurrency;
  }

  @action
  setQuoteCurrency(quoteCurrency: AppCurrency) {
    this._quoteCurrency = quoteCurrency;
  }

  @action
  input(value: string | Dec) {
    if (value instanceof Dec) {
      this._decRaw = value.toString();
    } else if (value.startsWith(".")) {
      this._decRaw = "0" + value;
    } else if (value === "") {
      this._decRaw = "0";
    } else {
      this._decRaw = value;
    }
  }

  /** Price where decimal adjustment is removed and converted to base asset decimals.
   *  Intended for performing computation. */
  readonly toDec = computedFn(() => {
    if (this._decRaw.endsWith(".")) {
      return this.removeCurrencyDecimals(this._decRaw.slice(0, -1));
    }
    return this.removeCurrencyDecimals(this._decRaw);
  });

  /** Current price adjusted based on base and quote currency decimals. */
  readonly toDecWithCurrencyDecimals = computedFn(() => {
    return new Dec(this._decRaw);
  });

  /** Raw value, which may be terminated with a `'.'`. `0`s are trimmed.
   *  Includes currency decimals for display. */
  toString() {
    if (new Dec(this._decRaw).isZero()) return this._decRaw;
    return trimZerosFromEnd(this._decRaw);
  }

  addCurrencyDecimals(price: Dec | string | number): Dec {
    price =
      typeof price === "string" || typeof price === "number"
        ? new Dec(price)
        : price;

    return price.mul(this.multiplicationQuoteOverBase);
  }

  removeCurrencyDecimals(price: Dec | string | number): Dec {
    price =
      typeof price === "string" || typeof price === "number"
        ? new Dec(price)
        : price;

    return price.quo(this.multiplicationQuoteOverBase);
  }
}

/** Trims 0s from end iff trailing integers from '.' are not all 0s. */
export function trimZerosFromEnd(str: string) {
  const decimalPointIndex = str.indexOf(".");

  if (decimalPointIndex === -1) {
    // No decimal point in this string, so return original
    return str;
  }

  // Return if all chars after decimal point are 0
  const charsAfterDecimal = str.substring(decimalPointIndex + 1);
  if (!charsAfterDecimal.split("").some((char) => char !== "0")) {
    return str;
  }

  let i = str.length - 1;
  while (i > decimalPointIndex && str.charAt(i) === "0") {
    i--;
  }

  // If we have only . left from the trimming, remove it as well
  if (str.charAt(i) === ".") {
    i--;
  }

  return str.substring(0, i + 1);
}
