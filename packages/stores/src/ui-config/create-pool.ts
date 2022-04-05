import { observable, makeObservable, action } from "mobx";
import { computedFn } from "mobx-utils";
import { TxChainSetter, IFeeConfig } from "@keplr-wallet/hooks";
import {
  ObservableQueryBalances,
  ChainGetter,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { Dec } from "@keplr-wallet/unit";
import { ObservableAmountConfig } from "./amount-config";
import { CREATE_POOL_MAX_ASSETS } from ".";

export class ObservableCreatePoolConfig extends TxChainSetter {
  @observable
  protected _sender: string;

  @observable.ref
  protected _feeConfig: IFeeConfig | undefined = undefined;

  @observable.ref
  protected _queriesStore: IQueriesStore;

  @observable.ref
  protected _queryBalances: ObservableQueryBalances;

  @observable.shallow
  protected _assets: {
    percentage: string;
    amountConfig: ObservableAmountConfig;
  }[] = [];

  @observable
  protected _swapFee: string = "0";

  @observable
  public acknowledgeFee = false;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    queriesStore: IQueriesStore,
    queryBalances: ObservableQueryBalances,
    feeConfig?: IFeeConfig
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;
    this._queriesStore = queriesStore;
    this._queryBalances = queryBalances;
    this._feeConfig = feeConfig;

    makeObservable(this);
  }

  get feeConfig(): IFeeConfig | undefined {
    return this._feeConfig;
  }

  get assets(): {
    percentage: string;
    amountConfig: ObservableAmountConfig;
  }[] {
    return this._assets;
  }

  get canAddAsset(): boolean {
    return this._assets.length < CREATE_POOL_MAX_ASSETS;
  }

  @action
  addAsset(currency: AppCurrency) {
    const config = new ObservableAmountConfig(
      this.chainGetter,
      this._queriesStore,
      this.chainId,
      this.sender,
      currency
    );
    if (this.feeConfig) {
      config.setFeeConfig(this.feeConfig);
    }

    if (this.canAddAsset) {
      this._assets.push({
        percentage: "",
        amountConfig: config,
      });
    }
  }

  @action
  clearAssets() {
    this._assets = [];
  }

  @action
  setAssetPercentageAt(index: number, percentage: string) {
    if (percentage.startsWith(".")) {
      percentage = "0" + percentage;
    }

    this.assets[index] = {
      ...this.assets[index],
      percentage,
    };
  }

  @action
  removeAssetAt(index: number) {
    this._assets.splice(index, 1);
  }

  get sender(): string {
    return this._sender;
  }

  get queryBalances(): ObservableQueryBalances {
    return this._queryBalances;
  }

  get sendableCurrencies(): AppCurrency[] {
    return this._queryBalances
      .getQueryBech32Address(this._sender)
      .positiveBalances.filter(
        (bal) => !bal.currency.coinDenom.toLowerCase().includes("gamm")
      )
      .map((bal) => {
        return bal.currency;
      });
  }

  get swapFee(): string {
    return this._swapFee;
  }

  @action
  setSwapFee(swapFee: string): void {
    this._swapFee = swapFee;
  }

  /**
   * sendableCurrencies 중에서 현재 assets에 없는 currency들을 반환한다.
   * Among the SendableCurrencies, return currencies that are not currently in Assets.
   */
  get remainingSelectableCurrencies(): AppCurrency[] {
    return this.sendableCurrencies.filter((cur) => {
      return (
        this.assets.find(
          (asset) =>
            asset.amountConfig.currency.coinMinimalDenom ===
            cur.coinMinimalDenom
        ) == null
      );
    });
  }

  readonly getErrorOfPercentage = computedFn((): Error | undefined => {
    if (this.assets.length < 2) {
      return new Error("Minimum of 2 assets required");
    }
    if (this.assets.length > 8) {
      return new Error("Too many assets");
    }

    let totalPercentage = new Dec(0);
    for (const asset of this.assets) {
      try {
        const percentage = new Dec(asset.percentage);

        if (percentage.lte(new Dec(0))) {
          return new Error("Non-positive percentage");
        }

        totalPercentage = totalPercentage.add(percentage);
      } catch {
        return new Error("Invalid number");
      }
    }
    if (!totalPercentage.equals(new Dec(100))) {
      return new Error("Sum of percentages is not 100%");
    }

    try {
      const dec = new Dec(this.swapFee);
      if (dec.lt(new Dec(0))) {
        return new Error("Negative swap fee");
      }
      if (dec.gte(new Dec(100))) {
        return new Error("Swap fee too high");
      }
    } catch {
      return new Error("Invalid swap fee");
    }
  });

  readonly getErrorOfAmount = computedFn((): Error | undefined => {
    for (const asset of this.assets) {
      const error = asset.amountConfig.error;
      if (error != null) {
        return error;
      }
    }
  });
}
