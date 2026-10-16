import { AppCurrency, Dec, DecUtils } from "@osmosis-labs/unit";
import { isValidNumericalRawInput } from "@osmosis-labs/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";

/** Safely converts a raw input string to a Dec value.
 * Returns "0" for empty strings or lone decimals that can't be parsed.
 */
function safeInputToDec(input: string): string {
  const trimmed = input.trim();
  if (trimmed === "" || trimmed === ".") return "0";
  return trimmed;
}

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
      return;
    }

    // Trim and handle empty/whitespace-only input consistently
    const trimmed = value.trim();
    if (trimmed === "") {
      this._decRaw = "0";
      return;
    }

    // Validate the input - reject invalid characters
    if (!isValidNumericalRawInput(trimmed)) {
      // Invalid input - ignore it, keep the previous value
      return;
    }

    // Handle leading decimal point after validation
    if (trimmed.startsWith(".")) {
      this._decRaw = "0" + trimmed;
    } else {
      this._decRaw = trimmed;
    }
  }

  /** Price where decimal adjustment is removed and converted to base asset decimals.
   *  Intended for performing computation. */
  readonly toDec = computedFn(() => {
    if (this._decRaw.endsWith(".")) {
      return this.removeCurrencyDecimals(
        safeInputToDec(this._decRaw.slice(0, -1))
      );
    }
    return this.removeCurrencyDecimals(safeInputToDec(this._decRaw));
  });

  /** Current price adjusted based on base and quote currency decimals. */
  readonly toDecWithCurrencyDecimals = computedFn(() => {
    if (this._decRaw.endsWith(".")) {
      return new Dec(safeInputToDec(this._decRaw.slice(0, -1)));
    }
    return new Dec(safeInputToDec(this._decRaw));
  });

  /** Raw value, which may be terminated with a `'.'`.
   *  Includes currency decimals for display.
   *  Preserves user input including trailing zeros to allow typing values like "0.0502". */
  toString() {
    return this._decRaw;
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

export { trimZerosFromEnd } from "@osmosis-labs/utils";
