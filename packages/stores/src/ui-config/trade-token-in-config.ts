import { action, computed, makeObservable, observable, override } from "mobx";
import { AmountConfig, IFeeConfig } from "@keplr-wallet/hooks";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  IntPretty,
  RatePretty,
} from "@keplr-wallet/unit";
import {
  OptimizedRoutes,
  Pool,
  RoutePathWithAmount,
} from "@osmosis-labs/pools";
import { NoSendCurrencyError, InsufficientBalanceError } from "./errors";

export class ObservableTradeTokenInConfig extends AmountConfig {
  @observable.ref
  protected _pools: Pool[];
  @observable
  protected _incentivizedPoolIds: string[];

  @observable
  protected _inCurrencyMinimalDenom: string | undefined = undefined;
  @observable
  protected _outCurrencyMinimalDenom: string | undefined = undefined;
  @observable
  protected _error: Error | undefined = undefined;

  constructor(
    chainGetter: ChainGetter,
    queriesStore: IQueriesStore,
    protected readonly initialChainId: string,
    sender: string,
    feeConfig: IFeeConfig | undefined,
    pools: Pool[],
    incentivizedPoolIds: string[] = []
  ) {
    super(chainGetter, queriesStore, initialChainId, sender, feeConfig);

    this._pools = pools;
    this._incentivizedPoolIds = incentivizedPoolIds;

    makeObservable(this);
  }

  @action
  setPools(pools: Pool[]) {
    this._pools = pools;
  }

  @action
  setIncentivizedPoolIds(poolIds: string[]) {
    this._incentivizedPoolIds = poolIds;
  }

  @override
  setSendCurrency(currency: AppCurrency | undefined) {
    if (currency) {
      this._inCurrencyMinimalDenom = currency.coinMinimalDenom;
    } else {
      this._inCurrencyMinimalDenom = undefined;
    }
  }

  @action
  setOutCurrency(currency: AppCurrency | undefined) {
    if (currency) {
      this._outCurrencyMinimalDenom = currency.coinMinimalDenom;
    } else {
      this._outCurrencyMinimalDenom = undefined;
    }
  }

  @action
  switchInAndOut() {
    // give back the swap fee amount
    const outAmount = this.expectedSwapResult.amount;
    if (outAmount.toDec().isZero()) {
      this.setAmount("");
    } else {
      this.setAmount(
        outAmount
          .shrink(true)
          .maxDecimals(6)
          .trim(true)
          .hideDenom(true)
          .toString()
      );
    }

    // Since changing in and out affects each other, it is important to use the stored value.
    const prevInCurrency = this.sendCurrency.coinMinimalDenom;
    const prevOutCurrency = this.outCurrency.coinMinimalDenom;

    this._inCurrencyMinimalDenom = prevOutCurrency;
    this._outCurrencyMinimalDenom = prevInCurrency;
  }

  get pools(): Pool[] {
    return this._pools;
  }

  @computed
  protected get currencyMap(): Map<string, AppCurrency> {
    return this.sendableCurrencies.reduce<Map<string, AppCurrency>>(
      (previous, current) => previous.set(current.coinMinimalDenom, current),
      new Map()
    );
  }

  @override
  get sendCurrency(): AppCurrency {
    if (this.sendableCurrencies.length === 0) {
      // For the case before pools are initially fetched,
      // it temporarily returns unknown currency rather than handling the case of undefined.
      return {
        coinMinimalDenom: "_unknown",
        coinDenom: "UNKNOWN",
        coinDecimals: 0,
      };
    }

    if (this._inCurrencyMinimalDenom) {
      const currency = this.currencyMap.get(this._inCurrencyMinimalDenom);
      if (currency) {
        return currency;
      }
    }

    return this.sendableCurrencies[0];
  }

  @computed
  get outCurrency(): AppCurrency {
    if (this.sendableCurrencies.length <= 1) {
      // For the case before pools are initially fetched,
      // it temporarily returns unknown currency rather than handling the case of undefined.
      return {
        coinMinimalDenom: "_unknown",
        coinDenom: "UNKNOWN",
        coinDecimals: 0,
      };
    }

    if (this._outCurrencyMinimalDenom) {
      const currency = this.currencyMap.get(this._outCurrencyMinimalDenom);
      if (currency) {
        return currency;
      }
    }

    return this.sendableCurrencies[1];
  }

  @computed
  get sendableCurrencies(): AppCurrency[] {
    if (this.pools.length === 0) {
      return [];
    }

    const chainInfo = this.chainInfo;

    // Get all coin denom in the pools.
    const coinDenomSet = new Set<string>();
    for (const pool of this.pools) {
      for (const poolAsset of pool.poolAssets) {
        coinDenomSet.add(poolAsset.denom);
      }
    }

    const coinDenoms = Array.from(coinDenomSet);

    const currencyMap = chainInfo.currencies.reduce<Map<string, AppCurrency>>(
      (previous, current) => {
        previous.set(current.coinMinimalDenom, current);
        return previous;
      },
      new Map()
    );

    return coinDenoms
      .filter((coinDenom) => {
        return currencyMap.has(coinDenom);
      })
      .map((coinDenom) => {
        // eslint-disable-next-line
        return currencyMap.get(coinDenom)!;
      });
  }

  @computed
  protected get optimizedRoutes(): OptimizedRoutes {
    const stakeCurrencyMinDenom = this.chainGetter.getChain(this.initialChainId)
      .stakeCurrency.coinMinimalDenom;
    return new OptimizedRoutes(
      this.pools,
      this._incentivizedPoolIds,
      stakeCurrencyMinDenom
    );
  }

  @computed
  get optimizedRoutePaths(): RoutePathWithAmount[] {
    this.setError(undefined);
    const amount = this.getAmountPrimitive();
    if (
      !amount.amount ||
      new Int(amount.amount).lte(new Int(0)) ||
      amount.denom === "_unknown" ||
      this.outCurrency.coinMinimalDenom === "_unknown"
    ) {
      return [];
    }

    try {
      return this.optimizedRoutes.getOptimizedRoutesByTokenIn(
        {
          denom: amount.denom,
          amount: new Int(amount.amount),
        },
        this.outCurrency.coinMinimalDenom,
        5
      );
    } catch (e: any) {
      this.setError(e);
      return [];
    }
  }

  @computed
  get expectedSwapResult(): {
    amount: CoinPretty;
    beforeSpotPriceWithoutSwapFeeInOverOut: IntPretty;
    beforeSpotPriceWithoutSwapFeeOutOverIn: IntPretty;
    beforeSpotPriceInOverOut: IntPretty;
    beforeSpotPriceOutOverIn: IntPretty;
    afterSpotPriceInOverOut: IntPretty;
    afterSpotPriceOutOverIn: IntPretty;
    effectivePriceInOverOut: IntPretty;
    effectivePriceOutOverIn: IntPretty;
    tokenInFeeAmount: CoinPretty;
    swapFee: RatePretty;
    priceImpact: RatePretty;
    isMultihopOsmoFeeDiscount: boolean;
  } {
    const paths = this.optimizedRoutePaths;
    this.setError(undefined);
    const zero = {
      amount: new CoinPretty(this.outCurrency, new Dec(0)).ready(false),
      beforeSpotPriceWithoutSwapFeeInOverOut: new IntPretty(0).ready(false),
      beforeSpotPriceWithoutSwapFeeOutOverIn: new IntPretty(0),
      beforeSpotPriceInOverOut: new IntPretty(0).ready(false),
      beforeSpotPriceOutOverIn: new IntPretty(0).ready(false),
      afterSpotPriceInOverOut: new IntPretty(0).ready(false),
      afterSpotPriceOutOverIn: new IntPretty(0).ready(false),
      effectivePriceInOverOut: new IntPretty(0).ready(false),
      effectivePriceOutOverIn: new IntPretty(0).ready(false),
      tokenInFeeAmount: new CoinPretty(this.sendCurrency, new Dec(0)).ready(
        false
      ),
      swapFee: new RatePretty(0).ready(false),
      priceImpact: new RatePretty(0).ready(false),
      isMultihopOsmoFeeDiscount: false,
    };

    if (paths.length === 0 || this.amount === "" || this.amount === "0") {
      return zero;
    }

    const multiplicationInOverOut = DecUtils.getTenExponentN(
      this.outCurrency.coinDecimals - this.sendCurrency.coinDecimals
    );
    const result = this.optimizedRoutes.calculateTokenOutByTokenIn(paths);

    if (!result.amount.gt(new Int(0))) {
      this.setError(new Error("Not enough liquidity"));
      return zero;
    }

    const beforeSpotPriceWithoutSwapFeeInOverOutDec =
      result.beforeSpotPriceInOverOut.mulTruncate(
        new Dec(1).sub(result.swapFee)
      );

    return {
      amount: new CoinPretty(this.outCurrency, result.amount).locale(false),
      beforeSpotPriceWithoutSwapFeeInOverOut: new IntPretty(
        beforeSpotPriceWithoutSwapFeeInOverOutDec.mulTruncate(
          multiplicationInOverOut
        )
      ),
      beforeSpotPriceWithoutSwapFeeOutOverIn:
        beforeSpotPriceWithoutSwapFeeInOverOutDec.gt(new Dec(0)) &&
        multiplicationInOverOut.gt(new Dec(0))
          ? new IntPretty(
              new Dec(1)
                .quoTruncate(beforeSpotPriceWithoutSwapFeeInOverOutDec)
                .quoTruncate(multiplicationInOverOut)
            )
          : new IntPretty(0),
      beforeSpotPriceInOverOut: new IntPretty(
        result.beforeSpotPriceInOverOut.mulTruncate(multiplicationInOverOut)
      ),
      beforeSpotPriceOutOverIn: multiplicationInOverOut.gt(new Dec(0))
        ? new IntPretty(
            result.beforeSpotPriceOutOverIn.quoTruncate(multiplicationInOverOut)
          )
        : new IntPretty(0),
      afterSpotPriceInOverOut: new IntPretty(
        result.afterSpotPriceInOverOut.mulTruncate(multiplicationInOverOut)
      ),
      afterSpotPriceOutOverIn: multiplicationInOverOut.gt(new Dec(0))
        ? new IntPretty(
            result.afterSpotPriceOutOverIn.quoTruncate(multiplicationInOverOut)
          )
        : new IntPretty(0),
      effectivePriceInOverOut: new IntPretty(
        result.effectivePriceInOverOut.mulTruncate(multiplicationInOverOut)
      ),
      effectivePriceOutOverIn: multiplicationInOverOut.gt(new Dec(0))
        ? new IntPretty(
            result.effectivePriceOutOverIn.quoTruncate(multiplicationInOverOut)
          )
        : new IntPretty(0),
      tokenInFeeAmount: new CoinPretty(
        this.sendCurrency,
        result.tokenInFeeAmount
      ).locale(false),
      swapFee: new RatePretty(result.swapFee),
      priceImpact: new RatePretty(result.priceImpact),
      isMultihopOsmoFeeDiscount: result.multiHopOsmoDiscount,
    };
  }

  /** Calculated spot price with amount of 1 token in. */
  @computed
  get beforeSpotPriceWithoutSwapFeeOutOverIn(): IntPretty {
    let paths;
    const one = new Int(
      DecUtils.getTenExponentNInPrecisionRange(this.sendCurrency.coinDecimals)
        .truncate()
        .toString()
    );
    try {
      paths = this.optimizedRoutes.getOptimizedRoutesByTokenIn(
        {
          denom: this.sendCurrency.coinMinimalDenom,
          amount: one,
        },
        this.outCurrency.coinMinimalDenom,
        5
      );
    } catch {
      return new IntPretty(0).ready(false);
    }

    if (paths.length === 0) {
      return new IntPretty(0).ready(false);
    }

    const estimate = this.optimizedRoutes.calculateTokenOutByTokenIn(paths);
    const multiplicationInOverOut = DecUtils.getTenExponentN(
      this.outCurrency.coinDecimals - this.sendCurrency.coinDecimals
    );
    const beforeSpotPriceWithoutSwapFeeInOverOutDec =
      estimate.beforeSpotPriceInOverOut.mulTruncate(
        new Dec(1).sub(estimate.swapFee)
      );

    // low price vs in asset
    if (
      beforeSpotPriceWithoutSwapFeeInOverOutDec.isZero() ||
      multiplicationInOverOut.isZero()
    ) {
      return new IntPretty(0).ready(false);
    }

    return new IntPretty(
      new Dec(1)
        .quoTruncate(beforeSpotPriceWithoutSwapFeeInOverOutDec)
        .quoTruncate(multiplicationInOverOut)
    );
  }

  @override
  get error(): Error | undefined {
    const sendCurrency = this.sendCurrency;
    if (!sendCurrency) {
      return new NoSendCurrencyError("Currency to send not set");
    }

    if (this.amount) {
      const dec = new Dec(this.amount);
      const balance = this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(this.sender)
        .getBalanceFromCurrency(this.sendCurrency);
      const balanceDec = balance.toDec();
      if (dec.gt(balanceDec)) {
        return new InsufficientBalanceError("Insufficient balance");
      }
    }

    return this._error;
  }

  @action
  setError(error: Error | undefined) {
    this._error = error;
  }
}
