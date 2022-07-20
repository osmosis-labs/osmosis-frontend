import { observable, computed, makeObservable, action } from "mobx";
import { TxChainSetter, IFeeConfig } from "@keplr-wallet/hooks";
import {
  ObservableQueryBalances,
  ChainGetter,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { AmountConfig } from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { CREATE_POOL_MAX_ASSETS } from ".";

export interface CreatePoolConfigOpts {
  minAssetsCount: number;
  maxAssetsCount: number;
}

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
    amountConfig: AmountConfig;
  }[] = [];

  @observable
  protected _swapFee: string = "0";

  @observable
  public acknowledgeFee = false;

  protected _opts: CreatePoolConfigOpts;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    queriesStore: IQueriesStore,
    queryBalances: ObservableQueryBalances,
    feeConfig?: IFeeConfig,
    opts: CreatePoolConfigOpts = {
      minAssetsCount: 2,
      maxAssetsCount: 8,
    }
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;
    this._queriesStore = queriesStore;
    this._queryBalances = queryBalances;
    this._feeConfig = feeConfig;
    this._opts = opts;

    makeObservable(this);
  }

  get feeConfig(): IFeeConfig | undefined {
    return this._feeConfig;
  }

  @action
  setFeeConfig(config: IFeeConfig | undefined) {
    this._feeConfig = config;
  }

  get assets(): {
    percentage: string;
    amountConfig: AmountConfig;
  }[] {
    return this._assets;
  }

  get canAddAsset(): boolean {
    return (
      this._assets.length < CREATE_POOL_MAX_ASSETS &&
      this.remainingSelectableCurrencies.length > 0
    );
  }

  get sender(): string {
    return this._sender;
  }

  @action
  setSender(bech32Address: string) {
    this._sender = bech32Address;
  }

  get queryBalances(): ObservableQueryBalances {
    return this._queryBalances;
  }

  @computed
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

  /**
   * sendableCurrencies 중에서 현재 assets에 없는 currency들을 반환한다.
   * Among the SendableCurrencies, return currencies that are not currently in Assets.
   */
  get remainingSelectableCurrencies(): AppCurrency[] {
    return this.sendableCurrencies.filter((cur) => {
      return (
        this.assets.find(
          (asset) =>
            asset.amountConfig.sendCurrency.coinMinimalDenom ===
            cur.coinMinimalDenom
        ) == null
      );
    });
  }

  /** Get the humanized (non-rounded) percentage for creating a balanced pool
   *  from the current number of assets.
   */
  get balancedPercentage(): RatePretty {
    return new RatePretty(new Dec(1).quo(new Dec(this.assets.length)));
  }

  // ERRORS

  get positiveBalanceError(): Error | undefined {
    if (this.sendableCurrencies.length === 0) {
      return new Error("You have no assets to deposit");
    }
  }

  get percentageError(): Error | undefined {
    if (this.assets.length < this._opts.minAssetsCount) {
      return new Error(
        `Minimum of ${this._opts.minAssetsCount} assets required`
      );
    }
    if (this.assets.length > this._opts.maxAssetsCount) {
      return new Error(
        `Maximumm of ${this._opts.maxAssetsCount} assets allowed`
      );
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
  }

  get swapFeeError(): Error | undefined {
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
  }

  get amountError(): Error | undefined {
    for (const asset of this.assets) {
      const error = asset.amountConfig.error;
      if (error != null) {
        return error;
      }
    }
  }

  @action
  setSwapFee(swapFee: string): void {
    this._swapFee = swapFee;
  }

  @action
  addAsset(currency: AppCurrency) {
    const config = new AmountConfig(
      this.chainGetter,
      this._queriesStore,
      this.chainId,
      this.sender,
      this.feeConfig
    );
    config.setSendCurrency(currency);

    if (this.canAddAsset) {
      this._assets.push({
        percentage: "",
        amountConfig: config,
      });
    }
  }

  @action
  removeAssetAt(index: number) {
    this._assets.splice(index, 1);
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

  /** Set percentages for all assets for an evenly balanced pool. */
  @action
  setBalancedPercentages() {
    this.assets.forEach((_, index) => {
      this.setAssetPercentageAt(
        index,
        new Dec(1)
          .quo(new Dec(this.assets.length))
          .mul(new Dec(100))
          .add(
            new Dec(
              this.assets.length % 2 === 1 && this.assets.length - 1 === index
                ? 1
                : 0
            )
          )
          .truncate()
          .toString()
      );
    });
  }
}
