import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  IFeeConfig,
  InvalidNumberAmountError,
  TxChainSetter,
} from "@keplr-wallet/hooks";
import { AmountConfig } from "@keplr-wallet/hooks";
import {
  ChainGetter,
  IQueriesStore,
  ObservableQueryBalances,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";

import type { ObservableQueryPool } from "../queries";
import {
  DepositNoBalanceError,
  HighSwapFeeError,
  InvalidScalingFactorControllerAddress,
  InvalidSwapFeeError,
  MaxAssetsCountError,
  MinAssetsCountError,
  NegativePercentageError,
  NegativeSwapFeeError,
  PercentageSumError,
  ScalingFactorTooLowError,
} from "./errors";

export interface CreatePoolConfigOpts {
  minAssetsCount: number;
  maxAssetsCount: number;
}

export class ObservableCreatePoolConfig extends TxChainSetter {
  @observable
  protected _sender: string;

  @observable.ref
  protected _feeConfig: IFeeConfig | undefined;

  @observable.ref
  protected _queriesStore: IQueriesStore;

  @observable.ref
  protected _queryBalances: ObservableQueryBalances;

  @observable.shallow
  protected _assets: {
    percentage?: string;
    scalingFactor?: number;
    amountConfig: AmountConfig;
  }[] = [];

  @observable
  protected _poolType: ObservableQueryPool["type"] | null = null;

  @observable
  protected _swapFee: string = "0";

  @observable
  protected _scalingFactorControllerAddress: string = "";

  @observable
  public _acknowledgeFee = false;

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
      maxAssetsCount: 4,
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

  get assets(): {
    percentage?: string;
    scalingFactor?: number;
    amountConfig: AmountConfig;
  }[] {
    return this._assets;
  }

  @computed
  get canAddAsset(): boolean {
    return (
      this._assets.length < this._opts.maxAssetsCount &&
      this.remainingSelectableCurrencies.length > 0
    );
  }

  get sender(): string {
    return this._sender;
  }

  get poolType(): ObservableQueryPool["type"] | null {
    return this._poolType;
  }

  get queryBalances(): ObservableQueryBalances {
    return this._queryBalances;
  }

  get acknowledgeFee() {
    return this._acknowledgeFee;
  }

  set acknowledgeFee(ack: boolean) {
    runInAction(() => (this._acknowledgeFee = ack));
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

  get scalingFactorControllerAddress(): string {
    return this._scalingFactorControllerAddress;
  }

  /**
   * sendableCurrencies 중에서 현재 assets에 없는 currency들을 반환한다.
   * Among the SendableCurrencies, return currencies that are not currently in Assets.
   */
  @computed
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
  @computed
  get balancedPercentage(): RatePretty {
    if (this._poolType !== "weighted") return new RatePretty(0).ready(false);

    return new RatePretty(new Dec(1).quo(new Dec(this.assets.length)));
  }

  // ERRORS

  @computed
  get positiveBalanceError(): Error | undefined {
    if (this.sendableCurrencies.length === 0) {
      return new DepositNoBalanceError("You have no assets to deposit");
    }
  }

  @computed
  get assetCountError(): Error | undefined {
    if (this.assets.length < this._opts.minAssetsCount) {
      return new MinAssetsCountError(
        `Minimum of ${this._opts.minAssetsCount} assets required`
      );
    }
    if (this.assets.length > this._opts.maxAssetsCount) {
      return new MaxAssetsCountError(
        `Maximumm of ${this._opts.maxAssetsCount} assets allowed`
      );
    }
  }

  @computed
  get percentageError(): Error | undefined {
    if (this._poolType !== "weighted") return;

    let totalPercentage = new Dec(0);
    for (const asset of this.assets) {
      try {
        if (!asset.percentage) return;
        const percentage = new Dec(asset.percentage);

        if (percentage.lte(new Dec(0))) {
          return new NegativePercentageError("Non-positive percentage");
        }

        totalPercentage = totalPercentage.add(percentage);
      } catch {
        return new InvalidNumberAmountError("Invalid number");
      }
    }
    if (!totalPercentage.equals(new Dec(100))) {
      return new PercentageSumError("Sum of percentages is not 100");
    }
  }

  @computed
  get scalingFactorError(): Error | undefined {
    if (this._poolType !== "stable") return;

    for (const asset of this.assets) {
      if (asset.scalingFactor !== undefined && asset.scalingFactor < 1) {
        return new ScalingFactorTooLowError("Scaling factor too low");
      }
    }
  }

  @computed
  get swapFeeError(): Error | undefined {
    try {
      const dec = new Dec(this.swapFee);
      if (dec.lt(new Dec(0))) {
        return new NegativeSwapFeeError("Negative swap fee");
      }
      if (dec.gte(new Dec(100))) {
        return new HighSwapFeeError("Swap fee too high");
      }
    } catch {
      return new InvalidSwapFeeError("Invalid swap fee");
    }
  }

  @computed
  get amountError(): Error | undefined {
    for (const asset of this.assets) {
      const error = asset.amountConfig.error;
      if (error != null) {
        return error;
      }
    }
  }

  @computed
  get scalingFactorControllerError(): Error | undefined {
    if (
      this._poolType !== "stable" ||
      this._scalingFactorControllerAddress === ""
    )
      return;

    const bech32Prefix = this.chainGetter.getChain(this.chainId).bech32Config
      .bech32PrefixAccAddr;

    try {
      Bech32Address.validate(
        this._scalingFactorControllerAddress,
        bech32Prefix
      );
    } catch {
      return new InvalidScalingFactorControllerAddress(
        "Invalid scaling factor controller address"
      );
    }
  }

  @action
  setFeeConfig(config: IFeeConfig | undefined) {
    this._feeConfig = config;
  }

  @action
  setSender(bech32Address: string) {
    this._sender = bech32Address;
  }

  @action
  setPoolType(poolType: ObservableQueryPool["type"] | null) {
    this._poolType = poolType;
  }

  @action
  setScalingFactorControllerAddress(address: string) {
    if (this._poolType !== "stable") return;

    this._scalingFactorControllerAddress = address;
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
      if (this._poolType === "weighted") {
        this._assets.push({
          percentage: "0",
          amountConfig: config,
        });
      } else if (this._poolType === "stable") {
        this._assets.push({
          scalingFactor: 1,
          amountConfig: config,
        });
      }
    }
  }

  @action
  removeAssetAt(index: number) {
    this._assets.splice(index, 1);
  }

  @action
  setAssetPercentageAt(index: number, percentage: string) {
    if (this._poolType !== "weighted" || index >= this._assets.length) return;

    if (percentage.startsWith(".")) {
      percentage = "0" + percentage;
    }

    this.assets[index] = {
      ...this.assets[index],
      percentage,
    };
  }

  @action
  setScalingFactorAt(index: number, scalingFactor: string) {
    if (this._poolType !== "stable" || index >= this._assets.length) return;

    const parsedScalingFactor = parseFloat(scalingFactor);

    if (!Number.isNaN(parsedScalingFactor))
      this.assets[index] = {
        ...this.assets[index],
        scalingFactor: parsedScalingFactor,
      };
  }

  /** Set percentages for all assets for an evenly balanced pool. */
  @action
  setBalancedPercentages() {
    if (this._poolType !== "weighted") return;

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
