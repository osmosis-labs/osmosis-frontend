import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@osmosis-labs/keplr-hooks";
import type {
  AddLiquidityBalance,
  AddLiquidityPoolData,
  Currency,
} from "@osmosis-labs/types";
import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  IntPretty,
  RatePretty,
} from "@osmosis-labs/unit";
import {
  CalculatingShareOutAmountError,
  NotInitializedError,
} from "@osmosis-labs/utils";
import { action, computed, makeObservable, observable } from "mobx";

import { OSMO_MEDIUM_TX_FEE } from ".";
import { ManageLiquidityConfigBase } from "./base";

type PoolAssetCurrency = Currency & {
  originCurrency?: Currency & {
    pegMechanism?: "algorithmic" | "collateralized" | "hybrid";
  };
};

export type {
  AddLiquidityBalance,
  AddLiquidityPoolData,
} from "@osmosis-labs/types";

/** Amount input of a single pool asset. Validates against the sender's balance
 *  supplied by the parent config, so it needs no query store. */
export class PoolAssetAmountConfig {
  @observable
  protected _amount: string = "";

  @observable
  protected _fraction: number | undefined = undefined;

  constructor(
    readonly sendCurrency: PoolAssetCurrency,
    protected readonly getBalance: (currency: Currency) => CoinPretty
  ) {
    makeObservable(this);
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

  @computed
  get balance(): CoinPretty {
    return this.getBalance(this.sendCurrency);
  }

  @computed
  get amount(): string {
    if (this._fraction != null) {
      const result = this.balance;
      if (result.toDec().lte(new Dec(0))) {
        return "0";
      }

      return result
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
    if (this.amount === "") {
      return new EmptyAmountError("Amount is empty");
    }
    if (Number.isNaN(parseFloat(this.amount))) {
      return new InvalidNumberAmountError("Invalid form of number");
    }
    let dec;
    try {
      dec = new Dec(this.amount);
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

    return;
  }
}

/** Use to config user input UI for eventually sending a valid add liquidity msg.
 *  Supports specifying a single asset LP amount, or evenly adding liquidity from an arbitrary number of pool assets.
 *  Holds no query stores: pool data and balances are pushed in with `setPool` and `setBalances`.
 */
type AmountConfigsCache = {
  poolId: string;
  sender: string;
  /** Asset denoms and decimals the configs were built for. */
  assetsKey: string;
  configs: PoolAssetAmountConfig[];
};

/** Identifies the pool's asset currencies by denom and decimals, in order. */
function getAssetsKey(pool: AddLiquidityPoolData): string {
  return pool.assets
    .map(
      ({ amount: { currency } }) =>
        `${currency.coinMinimalDenom}:${currency.coinDecimals}`
    )
    .join(",");
}

export class ObservableAddLiquidityConfig extends ManageLiquidityConfigBase {
  @observable.ref
  protected _pool: AddLiquidityPoolData | undefined = undefined;

  @observable.ref
  protected _balances: Map<string, string> = new Map();

  @observable.ref
  protected _shareOutAmount: IntPretty | undefined = undefined;

  @observable
  protected _isSingleAmountIn: boolean = false;

  /*
	 Used to get the amount config if the mode is single amount in.
	 */
  @observable
  protected _singleAmountInConfigIndex: number = 0;

  protected _cacheAmountConfigs?: AmountConfigsCache;

  constructor(poolId: string, sender: string) {
    super(poolId, sender);

    makeObservable(this);
  }

  /** The pool data the config was last given, e.g. to build join msgs. */
  get pool(): AddLiquidityPoolData | undefined {
    return this._pool;
  }

  @action
  setPool(pool: AddLiquidityPoolData | undefined) {
    this._pool = pool;

    // A refreshed pool can resolve an asset's currency differently (e.g. a
    // guessed currency from a persisted cache). Typed amounts and the share
    // out estimate were computed with the old decimals, so start over rather
    // than show amounts that no longer match what would be sent.
    const cache = this._cacheAmountConfigs;
    if (pool && cache && cache.assetsKey !== getAssetsKey(pool)) {
      this._cacheAmountConfigs = this.makeAmountConfigs(pool);
      this._shareOutAmount = undefined;
    }
  }

  protected makeAmountConfigs(pool: AddLiquidityPoolData): AmountConfigsCache {
    return {
      poolId: this.poolId,
      sender: this.sender,
      assetsKey: getAssetsKey(pool),
      configs: pool.assets.map(
        ({ amount: { currency } }) =>
          new PoolAssetAmountConfig(currency, (currency) =>
            this.getBalance(currency)
          )
      ),
    };
  }

  @action
  setBalances(balances: AddLiquidityBalance[] | undefined) {
    this._balances = new Map(
      (balances ?? []).map(({ denom, amount }) => [denom, amount])
    );
  }

  /** Sender's balance of the given currency, zero if none. */
  getBalance(currency: Currency): CoinPretty {
    return new CoinPretty(
      currency,
      new Int(this._balances.get(currency.coinMinimalDenom) ?? "0")
    );
  }

  get stableSwapInfo() {
    return this._pool?.stableSwapInfo;
  }

  get isSingleAmountIn(): boolean {
    return this._isSingleAmountIn;
  }

  @computed
  get singleAmountInAsset():
    | {
        weight: IntPretty;
        weightFraction: RatePretty;
        amount: CoinPretty;
        currency: Currency & {
          originCurrency?: Currency & {
            pegMechanism?: "algorithmic" | "collateralized" | "hybrid";
          };
        };
      }
    | undefined {
    return this.poolAssets.find(
      (asset) =>
        asset.currency.coinMinimalDenom ===
        this.singleAmountInConfig?.sendCurrency.coinMinimalDenom
    );
  }

  @computed
  get supportsSingleAmountIn(): boolean {
    if (!this._pool) return false;
    if (this._pool.type === "stable") return false;
    // Typed single asset amounts depend on the asset's decimals
    if (this._pool.hasGuessedCurrency) return false;

    return true;
  }

  /*
	 Return the `PoolAssetAmountConfig` of selected single amount in.
	 Return undefined if the mode is no single amount in
	 or `this._singleAmountInConfigIndex` is out of range in poolAssetConfigs.
	 */
  @computed
  get singleAmountInConfig(): PoolAssetAmountConfig | undefined {
    if (!this.isSingleAmountIn) {
      return;
    }

    if (this.poolAssetConfigs.length === 0) {
      return;
    }

    if (this.poolAssetConfigs.length <= this._singleAmountInConfigIndex) {
      return;
    }

    return this.poolAssetConfigs[this._singleAmountInConfigIndex];
  }

  @action
  setIsSingleAmountIn(value: boolean) {
    if (!this._pool) return;

    if (this._pool.type === "stable") {
      console.warn(
        "Single asset join pool currently not supported for stable pools"
      );
      return;
    }

    if (!this.supportsSingleAmountIn) return;

    this._isSingleAmountIn = value;

    if (value === true) {
      // set to OSMO if possible
      const osmoIndex = this.poolAssetConfigs.findIndex(
        (poolAssetConfig) => poolAssetConfig.sendCurrency.coinDenom === "OSMO"
      );
      if (osmoIndex !== -1) {
        this.setSingleAmountInConfigIndex(osmoIndex);
        return;
      }

      // set to highest amount, or first in list
      let maxAmount = new Dec(0);
      let maxIndex = 0;
      this.poolAssetConfigs.forEach((poolAssetConfig, index) => {
        try {
          const curAmt = new Dec(poolAssetConfig.amount);
          if (curAmt.gt(maxAmount)) {
            maxAmount = curAmt;
            maxIndex = index;
          }
        } catch {}
      });
      if (maxIndex !== -1) {
        this.setSingleAmountInConfigIndex(maxIndex);
      }
    }
  }

  @action
  setSingleAmountInConfigIndex(index: number) {
    this._singleAmountInConfigIndex = index;
  }

  @computed
  get singleAmountInPriceImpact(): RatePretty | undefined {
    if (!this.isSingleAmountIn) {
      return;
    }

    try {
      const config = this.singleAmountInConfig;
      if (!config || config.amount === "") {
        return;
      }

      const poolAsset = this.poolAssets.find(
        (asset) =>
          asset.currency.coinMinimalDenom ===
          config.sendCurrency.coinMinimalDenom
      );
      if (!poolAsset) {
        return;
      }

      /*
       The spot price is ( Bi / Wi ) / (Bo / Wo).
       And "single amount in" only changes the Bi or Bo.
       Others can be handles as constant.
       So, we can calculate the price impact by just consider the added amount of one asset.
       */
      return new RatePretty(
        new Dec(1).sub(
          poolAsset.amount
            .toDec()
            .quo(
              poolAsset.amount
                .toDec()
                .add(
                  new CoinPretty(
                    config.sendCurrency,
                    new Dec(config.amount).mul(
                      DecUtils.getTenExponentNInPrecisionRange(
                        config.sendCurrency.coinDecimals
                      )
                    )
                  ).toDec()
                )
            )
        )
      );
    } catch (e) {
      console.error(e);
    }
  }

  @computed
  get singleAmountInBalance(): CoinPretty | undefined {
    if (!this.singleAmountInAsset) return;

    return this.getBalance(this.singleAmountInAsset.currency);
  }

  @computed
  get poolAssetConfigs(): PoolAssetAmountConfig[] {
    const pool = this._pool;
    if (!pool) {
      return [];
    }

    if (
      !this._cacheAmountConfigs ||
      this._cacheAmountConfigs.poolId !== this.poolId ||
      this._cacheAmountConfigs.sender !== this.sender ||
      this._cacheAmountConfigs.assetsKey !== getAssetsKey(pool) ||
      this._cacheAmountConfigs.configs.length === 0
    ) {
      this._cacheAmountConfigs = this.makeAmountConfigs(pool);
    }

    return this._cacheAmountConfigs.configs;
  }

  @computed
  get poolAssets(): {
    weight: IntPretty;
    weightFraction: RatePretty;
    amount: CoinPretty;
    currency: PoolAssetCurrency;
  }[] {
    const pool = this._pool;
    if (!pool) {
      return [];
    }

    return pool.assets.map(({ amount, weight }) => {
      const weights: {
        weight: IntPretty;
        weightFraction: RatePretty;
      } =
        weight && pool.totalWeight
          ? {
              weight: new IntPretty(weight),
              weightFraction: new RatePretty(
                weight.toDec().quoTruncate(pool.totalWeight.toDec())
              ),
            }
          : {
              weight: new IntPretty(1), // Assume stable pools have even weight
              weightFraction: new RatePretty(
                new Dec(1).quo(new Dec(pool.assets.length))
              ),
            };

      return {
        ...weights,
        amount,
        currency: amount.currency as PoolAssetCurrency,
      };
    });
  }

  @computed
  get totalWeight(): IntPretty {
    let result = new IntPretty(new Int(0));
    for (const asset of this.poolAssets) {
      result = result.add(asset.weight);
    }
    return result;
  }

  @computed
  get totalShare(): IntPretty {
    if (!this._pool) {
      return new IntPretty(new Int(0));
    }

    return new IntPretty(this._pool.totalShare);
  }

  get shareOutAmount(): IntPretty | undefined {
    return this._shareOutAmount;
  }

  @action
  setAmountAt(index: number, amount: string, isMax = false): void {
    const amountConfig = this.poolAssetConfigs[index];
    amountConfig.setAmount(amount);

    if (amountConfig.error === undefined) {
      /*
        share out amount = (token in amount * total share) / pool asset
       */
      const tokenInAmount = new IntPretty(new Dec(amountConfig.amount));
      const totalShare = this.totalShare;
      const poolAsset = this.poolAssets.find(
        (asset) =>
          asset.currency.coinMinimalDenom ===
          amountConfig.sendCurrency.coinMinimalDenom
      );

      if (tokenInAmount.toDec().equals(new Dec(0))) {
        this._shareOutAmount = undefined;
        return;
      }

      if (totalShare.toDec().equals(new Dec(0))) {
        this._shareOutAmount = undefined;
        return;
      }

      if (!poolAsset) {
        this._shareOutAmount = undefined;
        return;
      }

      // totalShare / poolAsset.amount = totalShare per poolAssetAmount = total share per tokenInAmount
      // tokenInAmount * (total share per tokenInAmount) = totalShare of given tokenInAmount aka shareOutAmount;
      // tokenInAmount in terms of totalShare unit

      // shareOutAmount / totalShare = totalShare proportion of tokenInAmount;
      // totalShare proportion of tokenInAmount * otherTotalPoolAssetAmount = otherPoolAssetAmount

      const shareOutAmount = tokenInAmount
        .mul(totalShare)
        .quo(poolAsset.amount);
      const otherConfigs = this.poolAssetConfigs.slice();
      otherConfigs.splice(index, 1);

      for (const otherConfig of otherConfigs) {
        const poolAsset = this.poolAssets.find(
          (asset) =>
            asset.currency.coinMinimalDenom ===
            otherConfig.sendCurrency.coinMinimalDenom
        );

        if (!poolAsset) {
          this._shareOutAmount = undefined;
          return;
        }

        otherConfig.setAmount(
          shareOutAmount
            .mul(poolAsset.amount)
            .quo(totalShare)
            .trim(true)
            .shrink(true)
            .maxDecimals(isMax ? 6 : 2)
            .locale(false)
            .toString()
        );
      }

      this._shareOutAmount = shareOutAmount;
    } else {
      this._shareOutAmount = undefined;
    }
  }

  getAmountAt(index: number): string {
    return this.poolAssetConfigs[index].amount;
  }

  getSenderBalanceAt(index: number): CoinPretty {
    return this.getBalance(this.poolAssetConfigs[index].sendCurrency);
  }

  @action
  setMax() {
    if (this.isSingleAmountIn && this.singleAmountInConfig) {
      const config = this.singleAmountInConfig;
      config.setIsMax(true);
      this.setAmountAt(this._singleAmountInConfigIndex, config.amount);
      config.setIsMax(false);
      return;
    }

    const balancePrettyList = this.poolAssetConfigs.map((poolAssetConfig) =>
      this.getBalance(poolAssetConfig.sendCurrency)
    );
    if (
      balancePrettyList.some((balancePretty) =>
        balancePretty.toDec().equals(new Dec(0))
      )
    ) {
      return this.poolAssetConfigs.forEach((poolAssetConfig) =>
        poolAssetConfig.setAmount("0")
      );
    }
    let feasibleMaxFound = false;
    const totalShare = this.totalShare;
    balancePrettyList.forEach((balancePretty) => {
      if (feasibleMaxFound) {
        return;
      }
      const baseBalanceInt = new IntPretty(balancePretty);
      const basePoolAsset = this.poolAssets.find(
        (poolAsset) =>
          poolAsset.currency.coinMinimalDenom ===
          balancePretty.currency.coinMinimalDenom
      );
      if (!basePoolAsset) return;
      const baseShareOutAmount = baseBalanceInt
        .mul(totalShare)
        .quo(basePoolAsset.amount);
      const outAmountInfoList = this.poolAssets.map((poolAsset) => {
        const coinMinimalDenom = poolAsset.currency.coinMinimalDenom;
        if (basePoolAsset.currency.coinMinimalDenom === coinMinimalDenom) {
          return {
            coinMinimalDenom,
            outAmount: baseBalanceInt,
          };
        }
        return {
          coinMinimalDenom,
          outAmount: baseShareOutAmount.mul(poolAsset.amount).quo(totalShare),
        };
      });
      const hasInsufficientBalance = outAmountInfoList.some((outAmountInfo) => {
        const balanceInfo = balancePrettyList.find(
          (balance) =>
            balance.currency.coinMinimalDenom === outAmountInfo.coinMinimalDenom
        );
        if (!balanceInfo) return false;
        return balanceInfo.toDec().lt(outAmountInfo.outAmount.toDec());
      });
      if (hasInsufficientBalance) {
        return;
      }
      feasibleMaxFound = true;

      const osmoIndex = this.poolAssetConfigs.findIndex((poolAssetConfig) => {
        return poolAssetConfig.sendCurrency.coinMinimalDenom === "uosmo";
      });

      if (osmoIndex !== -1) {
        const osmoOutAmountInfo = outAmountInfoList.find(
          (outAmountInfo) => outAmountInfo.coinMinimalDenom === "uosmo"
        );
        if (!osmoOutAmountInfo) return;
        const osmoBalanceInfo = balancePrettyList.find(
          (balance) => balance.currency.coinMinimalDenom === "uosmo"
        );
        if (!osmoBalanceInfo) return;
        const osmoOutAmount = osmoBalanceInfo
          .toDec()
          .sub(new Dec(OSMO_MEDIUM_TX_FEE))
          .lt(osmoOutAmountInfo.outAmount.toDec())
          ? osmoOutAmountInfo.outAmount.sub(new Dec(OSMO_MEDIUM_TX_FEE))
          : osmoOutAmountInfo.outAmount;

        return this.setAmountAt(
          osmoIndex,
          osmoOutAmount
            .trim(true)
            .shrink(true)
            /** osmo is used to pay tx fees, should have some padding left for future tx? if no padding needed maxDecimals to 6 else 2*/
            .maxDecimals(6)
            .locale(false)
            .toString(),
          true
        );
      }

      /**TODO: should use cheaper coin to setAmount for higher accuracy*/
      const baseOutAmountInfo = outAmountInfoList.find((outAmountInfo) => {
        return (
          outAmountInfo.coinMinimalDenom ===
          this.poolAssetConfigs[0].sendCurrency.coinMinimalDenom
        );
      });
      if (!baseOutAmountInfo) return;

      this.setAmountAt(
        0,
        baseOutAmountInfo?.outAmount
          .trim(true)
          .shrink(true)
          .maxDecimals(6)
          .locale(false)
          .toString(),
        true
      );
    });
  }

  @computed
  get error(): Error | undefined {
    if (this.poolAssetConfigs.length === 0) {
      return new NotInitializedError("Not initialized yet");
    }

    if (this.isSingleAmountIn && this.singleAmountInConfig) {
      const config = this.singleAmountInConfig;
      const error = config.error;
      if (error != null) {
        return error;
      }

      return;
    } else {
      for (const config of this.poolAssetConfigs) {
        const error = config.error;
        if (error != null) {
          return error;
        }
      }
    }

    if (!this.shareOutAmount || this.shareOutAmount.toDec().lte(new Dec(0))) {
      return new CalculatingShareOutAmountError(
        "Calculating the share out amount"
      );
    }
  }
}
