import { AppCurrency } from "@keplr-wallet/types";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { action, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";

/** Manages user input of decimal values, and includes currency decimals in price calculation. */
export class PriceConfig {
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
    } else if (value === "") {
      this._decRaw = "0";
    } else if (value.startsWith(".")) {
      this._decRaw = "0" + value;
    } else {
      this._decRaw = value;
    }
  }

  /** Price, converted to base asset decimals. */
  readonly toDec = computedFn(() => {
    const multiplicationQuoteOverBase = DecUtils.getTenExponentN(
      this._baseCurrency.coinDecimals - this._quoteCurrency.coinDecimals
    );

    if (this._decRaw.endsWith(".")) {
      return new Dec(this._decRaw.slice(0, -1)).quo(
        multiplicationQuoteOverBase
      );
    }
    return new Dec(this._decRaw).quo(multiplicationQuoteOverBase);
  });

  /** Raw value, which may be terminated with a `'.'`. `0`s are trimmed. */
  toString() {
    return trimZerosFromEnd(this._decRaw);
  }

  addCurrencyDecimals(price: Dec): Dec {
    const multiplicationQuoteOverBase = DecUtils.getTenExponentN(
      this._baseCurrency.coinDecimals - this._quoteCurrency.coinDecimals
    );

    return price.mul(multiplicationQuoteOverBase);
  }
}

export function trimZerosFromEnd(str: string) {
  const decimalPointIndex = str.indexOf(".");

  if (decimalPointIndex === -1) {
    // No decimal point in this string, so return original
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
