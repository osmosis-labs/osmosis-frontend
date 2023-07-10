import { Dec } from "@keplr-wallet/unit";
import { action, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";

/** Manages user input of decimal values. */
export class DecimalConfig {
  @observable
  protected _decRaw: string;

  constructor() {
    this._decRaw = "0";

    makeObservable(this);
  }

  get decimal() {
    return this._decRaw;
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

  readonly toDec = computedFn(() => {
    if (this._decRaw.endsWith(".")) {
      return new Dec(this._decRaw.slice(0, -1));
    }
    return new Dec(this._decRaw);
  });

  /** Raw value, which may be terminated with a `'.'`. `0`s are trimmed. */
  toString() {
    return trimZerosFromEnd(this._decRaw);
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
