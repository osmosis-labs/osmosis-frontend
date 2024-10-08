import { Dec, DecUtils, RatePretty } from "@keplr-wallet/unit";
import { action, computed, makeObservable, observable } from "mobx";

import { InvalidSlippageError, NegativeSlippageError } from "./errors";

export class ObservableSlippageConfig {
  static readonly defaultSelectableSlippages: ReadonlyArray<Dec> = [
    // 0.5%
    new Dec("0.005"),
    // 1%
    new Dec("0.01"),
    // 3%
    new Dec("0.03"),
    // 5%
    new Dec("0.05"),
  ];

  @observable
  protected _defaultManualSlippage: string = "0.5";

  @observable.shallow
  protected _selectableSlippages: ReadonlyArray<Dec> =
    ObservableSlippageConfig.defaultSelectableSlippages;

  @observable
  protected _selectedIndex: number = 0;

  @observable
  protected _isManualSlippage: boolean = true;

  @observable
  protected _manualSlippage: string = "0.5";

  constructor() {
    makeObservable(this);
  }

  @action
  setSelectableSlippages(slippages: ReadonlyArray<Dec>) {
    if (slippages.length === 0) {
      throw new Error("Slippages are empty");
    }

    this._selectableSlippages = slippages;

    if (this._selectableSlippages.length - 1 < this._selectedIndex) {
      this._selectedIndex = this._selectableSlippages.length - 1;
    }
  }

  @action
  select(index: number) {
    if (index < 0 || this._selectableSlippages.length - 1 < index) {
      return;
    }

    this._isManualSlippage = false;
    this._selectedIndex = index;
  }

  get isManualSlippage(): boolean {
    return this._isManualSlippage;
  }

  @action
  setIsManualSlippage(value: boolean) {
    this._isManualSlippage = value;
  }

  @action
  setManualSlippage(str: string) {
    if (isNaN(Number(str))) return;

    if (str.startsWith(".")) {
      str = "0" + str;
    }

    // within bound
    const strDec = new Dec(str);
    if (strDec.gte(new Dec(100)) || strDec.lt(new Dec(0))) return;

    this._isManualSlippage = true;
    this._manualSlippage = str;
  }

  @computed
  get manualSlippageStr(): string {
    return this._manualSlippage;
  }

  @computed
  get defaultManualSlippage(): string {
    return this._defaultManualSlippage;
  }

  @computed
  get manualSlippage(): RatePretty {
    if (!this._isManualSlippage || this._manualSlippage === "") {
      return new RatePretty(new Dec(0));
    }

    try {
      const r = new RatePretty(
        new Dec(this._manualSlippage).quo(DecUtils.getTenExponentN(2))
      );

      if (r.toDec().isNegative()) {
        return new RatePretty(new Dec(0));
      }

      return r;
    } catch {
      return new RatePretty(new Dec(0));
    }
  }

  @computed
  get slippage(): RatePretty {
    if (this._isManualSlippage) {
      return this.manualSlippage;
    }

    return new RatePretty(this._selectableSlippages[this._selectedIndex]);
  }

  @computed
  get selectableSlippages(): {
    slippage: RatePretty;
    index: number;
    selected: boolean;
  }[] {
    return this._selectableSlippages.map((slippage, i) => {
      return {
        slippage: new RatePretty(slippage),
        index: i,
        selected: !this._isManualSlippage && i === this._selectedIndex,
      };
    });
  }

  @computed
  get manualSlippageError(): Error | undefined {
    if (this._isManualSlippage) {
      try {
        const r = new RatePretty(
          new Dec(this._manualSlippage).quo(DecUtils.getTenExponentN(2))
        );
        if (r.toDec().isNegative()) {
          return new NegativeSlippageError("Slippage can not be negative");
        }
      } catch {
        return new InvalidSlippageError("Invalid slippage");
      }
    }

    return;
  }

  @action
  setDefaultSlippage(value: string) {
    this._defaultManualSlippage = value;
  }

  @action
  getSmallestSlippage(value: Dec): [number, Dec] {
    let index = this._selectableSlippages.findIndex((slippage) =>
      slippage.gte(value)
    );

    if (index === -1) {
      index = this._selectableSlippages.length - 1;
    }

    return [index, this._selectableSlippages[index]];
  }
}
