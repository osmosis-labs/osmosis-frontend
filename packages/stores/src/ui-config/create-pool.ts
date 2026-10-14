import { fromBech32 } from "@cosmjs/encoding";
import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@osmosis-labs/keplr-hooks";
import { ChainGetter } from "@osmosis-labs/keplr-stores";
import type {
  CreatePoolBalance,
  CreatePoolConfigOpts,
} from "@osmosis-labs/types";
import { AppCurrency, CoinPretty, Dec, RatePretty } from "@osmosis-labs/unit";
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
} from "@osmosis-labs/utils";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";

import type { ObservableQueryPool } from "../queries-external/pools";

export type {
  CreatePoolBalance,
  CreatePoolConfigOpts,
} from "@osmosis-labs/types";

/** Amount input state for one asset in a new pool. Balances are looked up
 *  through `getBalance` so the owner can feed them from any source. */
export class CreatePoolAssetAmount {
  @observable.ref
  protected _sendCurrency: AppCurrency;

  @observable
  protected _amount: string = "";

  @observable
  protected _fraction: number | undefined = undefined;

  constructor(
    sendCurrency: AppCurrency,
    protected readonly getBalance: (currency: AppCurrency) => CoinPretty
  ) {
    this._sendCurrency = sendCurrency;

    makeObservable(this);
  }

  get sendCurrency(): AppCurrency {
    return this._sendCurrency;
  }

  get fraction(): number | undefined {
    return this._fraction;
  }

  get isMax(): boolean {
    return this._fraction === 1;
  }

  @action
  setSendCurrency(currency: AppCurrency) {
    this._sendCurrency = currency;
  }

  @action
  setAmount(amount: string) {
    if (amount.startsWith(".")) {
      amount = "0" + amount;
    }

    if (this._fraction != null) {
      this._fraction = undefined;
    }
    this._amount = amount;
  }

  @action
  setIsMax(isMax: boolean) {
    this._fraction = isMax ? 1 : undefined;
  }

  @action
  setFraction(value: number | undefined) {
    this._fraction = value;
  }

  @computed
  get balance(): CoinPretty {
    return this.getBalance(this._sendCurrency);
  }

  /** Human-readable amount. Derived from the balance when a fraction is set. */
  @computed
  get amount(): string {
    if (this._fraction != null) {
      const balance = this.balance;
      if (balance.toDec().lte(new Dec(0))) {
        return "0";
      }

      return balance
        .mul(new Dec(this._fraction))
        .trim(true)
        .locale(false)
        .hideDenom(true)
        .toString();
    }

    return this._amount;
  }

  @computed
  get error(): Error | undefined {
    const amount = this.amount;
    if (amount === "") {
      return new EmptyAmountError("Amount is empty");
    }
    if (Number.isNaN(parseFloat(amount))) {
      return new InvalidNumberAmountError("Invalid form of number");
    }
    let dec;
    try {
      dec = new Dec(amount);
      if (dec.equals(new Dec(0))) {
        return new ZeroAmountError("Amount is zero");
      }
    } catch {
      return new InvalidNumberAmountError("Invalid form of number");
    }
    if (dec.lt(new Dec(0))) {
      return new NegativeAmountError("Amount is negative");
    }
    if (dec.gt(this.balance.toDec())) {
      return new InsufficientAmountError("Insufficient amount");
    }
  }
}

export class ObservableCreatePoolConfig {
  @observable
  protected _sender: string;

  /** User balances, set by the UI from tRPC data. */
  @observable.ref
  protected _balances: CreatePoolBalance[] = [];

  @observable.shallow
  protected _assets: {
    percentage?: string;
    scalingFactor?: number;
    amountConfig: CreatePoolAssetAmount;
  }[] = [];

  @observable
  protected _poolType: ObservableQueryPool["type"] | null = null;

  @observable
  protected _swapFee: string = "0";

  @observable
  protected _scalingFactorControllerAddress: string = "";

  @observable
  public _acknowledgeFee = false;

  @observable
  public _duplicateAcknowledged = false;

  /** Set by the create-pool UI when an exact-duplicate pool is detected and
   *  the user must explicitly acknowledge before proceeding. */
  @observable
  public _duplicateBlocking = false;

  protected _opts: CreatePoolConfigOpts;

  @observable
  protected chainId: string;

  constructor(
    readonly chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    opts: CreatePoolConfigOpts = {
      minAssetsCount: 2,
      maxAssetsCount: 4,
    }
  ) {
    this.chainId = initialChainId;

    this._sender = sender;
    this._opts = opts;

    makeObservable(this);
  }

  get assets(): {
    percentage?: string;
    scalingFactor?: number;
    amountConfig: CreatePoolAssetAmount;
  }[] {
    return this._assets;
  }

  @action
  setChain(chainId: string) {
    this.chainId = chainId;
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

  get balances(): CreatePoolBalance[] {
    return this._balances;
  }

  get acknowledgeFee() {
    return this._acknowledgeFee;
  }

  set acknowledgeFee(ack: boolean) {
    runInAction(() => (this._acknowledgeFee = ack));
  }

  get duplicateAcknowledged() {
    return this._duplicateAcknowledged;
  }

  set duplicateAcknowledged(ack: boolean) {
    runInAction(() => (this._duplicateAcknowledged = ack));
  }

  get duplicateBlocking() {
    return this._duplicateBlocking;
  }

  set duplicateBlocking(blocking: boolean) {
    runInAction(() => (this._duplicateBlocking = blocking));
  }

  @computed
  get sendableCurrencies(): AppCurrency[] {
    return this._balances
      .filter(
        (bal) =>
          new Dec(bal.amount).gt(new Dec(0)) &&
          !bal.currency.coinDenom.toLowerCase().includes("gamm")
      )
      .map((bal) => bal.currency);
  }

  /** Balance of the currency, zero if the user holds none. */
  getBalance = (currency: AppCurrency): CoinPretty => {
    const balance = this._balances.find(
      (bal) => bal.currency.coinMinimalDenom === currency.coinMinimalDenom
    );
    return new CoinPretty(currency, balance?.amount ?? "0");
  };

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
      const { prefix } = fromBech32(this._scalingFactorControllerAddress);
      if (bech32Prefix && prefix !== bech32Prefix) {
        throw new Error(`Unexpected bech32 prefix: ${prefix}`);
      }
    } catch {
      return new InvalidScalingFactorControllerAddress(
        "Invalid scaling factor controller address"
      );
    }
  }

  @action
  setBalances(balances: CreatePoolBalance[]) {
    this._balances = balances;
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
    const config = new CreatePoolAssetAmount(currency, this.getBalance);

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
