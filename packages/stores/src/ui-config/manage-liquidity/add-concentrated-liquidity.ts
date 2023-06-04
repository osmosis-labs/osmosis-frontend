import { AmountConfig, TxChainSetter } from "@keplr-wallet/hooks";
import {
  ChainGetter,
  IQueriesStore,
  ObservableQueryBalances,
} from "@keplr-wallet/stores";
import { CoinPretty, Dec, Int, RatePretty } from "@keplr-wallet/unit";
import {
  calculateDepositAmountForBase,
  calculateDepositAmountForQuote,
  maxSpotPrice,
  maxTick,
  minSpotPrice,
  minTick,
  priceToTick,
  roundPriceToNearestTick,
} from "@osmosis-labs/math";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { action, autorun, computed, makeObservable, observable } from "mobx";

import { InvalidRangeError } from "./errors";

/** Use to config user input UI for eventually sending a valid add concentrated liquidity msg.
 */
export class ObservableAddConcentratedLiquidityConfig extends TxChainSetter {
  @observable
  protected _sender: string;

  @observable
  protected _pool: ConcentratedLiquidityPool;

  /*
	 Used to get current view type of AddConcLiquidity modal
	 */
  @observable
  protected _modalView: "overview" | "add_manual" | "add_managed" = "overview";

  /*
   Used to get min and max range for adding concentrated liquidity
   */
  @observable
  protected _priceRange: [Dec, Dec] = [minSpotPrice, minSpotPrice];

  @observable
  protected _fullRange: boolean = false;

  /*
   Used to get base and quote asset deposit for adding concentrated liquidity
   */
  @observable
  protected _baseDepositAmountIn: AmountConfig;

  @observable
  protected _quoteDepositAmountIn: AmountConfig;

  @observable
  protected _anchorAsset: "base" | "quote" = "base";

  constructor(
    protected readonly chainGetter: ChainGetter,
    initialChainId: string,
    readonly poolId: string,
    sender: string,
    protected readonly queriesStore: IQueriesStore,
    protected readonly queryBalances: ObservableQueryBalances,
    pool: ConcentratedLiquidityPool
  ) {
    super(chainGetter, initialChainId);

    this._pool = pool;
    this._sender = sender;

    this._baseDepositAmountIn = new AmountConfig(
      chainGetter,
      queriesStore,
      this.chainId,
      this.sender,
      undefined
    );

    this._quoteDepositAmountIn = new AmountConfig(
      chainGetter,
      queriesStore,
      this.chainId,
      this.sender,
      undefined
    );

    const [baseDenom, quoteDenom] = pool.poolAssetDenoms;
    const baseCurrency = chainGetter
      .getChain(this.chainId)
      .findCurrency(baseDenom);
    const quoteCurrency = chainGetter
      .getChain(this.chainId)
      .findCurrency(quoteDenom);

    this._baseDepositAmountIn.setSendCurrency(baseCurrency);
    this._quoteDepositAmountIn.setSendCurrency(quoteCurrency);
    this._baseDepositAmountIn.setAmount("0");
    this._quoteDepositAmountIn.setAmount("0");

    // Calculate quote amount when base amount is input and anchor is base
    autorun(() => {
      const baseAmountRaw =
        this.baseDepositAmountIn.getAmountPrimitive().amount;
      const baseAmount = new Int(baseAmountRaw);
      const anchor = this._anchorAsset;

      if (anchor !== "base" || baseAmount.lt(new Int(0))) return;

      if (baseAmount.isZero()) this.quoteDepositAmountIn.setAmount("0");

      // calculate proportional amount of other amount
      const [lowerTick, upperTick] = this.tickRange;
      const quoteAmount = calculateDepositAmountForQuote(
        this.pool.currentSqrtPrice,
        lowerTick,
        upperTick,
        baseAmount
      );
      // include decimals, as is displayed to user
      const quoteCoin = new CoinPretty(
        this._quoteDepositAmountIn.sendCurrency,
        quoteAmount
      );
      const quoteAmountWithDecimals = quoteCoin
        .hideDenom(true)
        .locale(false)
        .trim(true)
        .toString();
      this.quoteDepositAmountIn.setAmount(quoteAmountWithDecimals.toString());
    });

    // Calculate base amount when quote amount is input and anchor is quote
    autorun(() => {
      const quoteAmountRaw =
        this.quoteDepositAmountIn.getAmountPrimitive().amount;
      const quoteAmount = new Int(quoteAmountRaw);
      const anchor = this._anchorAsset;

      if (anchor !== "quote" || quoteAmount.lt(new Int(0))) return;

      if (quoteAmount.isZero()) this.baseDepositAmountIn.setAmount("0");

      // calculate proportional amount of other amount
      const [lowerTick, upperTick] = this.tickRange;
      const baseDeposit = calculateDepositAmountForBase(
        this.pool.currentSqrtPrice,
        lowerTick,
        upperTick,
        quoteAmount
      );
      // include decimals, as is displayed to user
      const baseCoin = new CoinPretty(
        this._baseDepositAmountIn.sendCurrency,
        baseDeposit
      );
      const baseAmountWithDecimals = baseCoin
        .hideDenom(true)
        .locale(false)
        .trim(true)
        .toString();
      this.baseDepositAmountIn.setAmount(baseAmountWithDecimals.toString());
    });

    makeObservable(this);
  }

  setChain(chainId: string) {
    super.setChain(chainId);
    const [baseDenom, quoteDenom] = this.pool.poolAssetDenoms;
    const baseCurrency = this.chainGetter
      .getChain(this.chainId)
      .findCurrency(baseDenom);
    const quoteCurrency = this.chainGetter
      .getChain(this.chainId)
      .findCurrency(quoteDenom);

    this._baseDepositAmountIn.setSendCurrency(baseCurrency);
    this._quoteDepositAmountIn.setSendCurrency(quoteCurrency);
  }

  get pool(): ConcentratedLiquidityPool {
    return this._pool;
  }

  @computed
  get currentPrice(): Dec {
    return (
      this._pool.currentSqrtPrice?.mul(this._pool.currentSqrtPrice) ??
      new Dec(0)
    );
  }

  @computed
  get moderatePriceRange(): [Dec, Dec] {
    return [
      roundPriceToNearestTick(this.currentPrice.mul(new Dec(0.75))),
      roundPriceToNearestTick(this.currentPrice.mul(new Dec(1.25))),
    ];
  }

  @computed
  get moderateTickRange(): [Int, Int] {
    return [
      priceToTick(this.moderatePriceRange[0]),
      priceToTick(this.moderatePriceRange[1]),
    ];
  }

  @computed
  get aggressivePriceRange(): [Dec, Dec] {
    return [
      roundPriceToNearestTick(this.currentPrice.mul(new Dec(0.5))),
      roundPriceToNearestTick(this.currentPrice.mul(new Dec(1.5))),
    ];
  }

  @computed
  get aggressiveTickRange(): [Int, Int] {
    return [
      priceToTick(this.aggressivePriceRange[0]),
      priceToTick(this.aggressivePriceRange[1]),
    ];
  }

  @computed
  get depositPercentages(): [RatePretty, RatePretty] {
    if (this.baseDepositOnly) return [new RatePretty(1), new RatePretty(0)];
    if (this.quoteDepositOnly) return [new RatePretty(0), new RatePretty(1)];

    const quoteDeposit = new Int(1);
    const [lowerTick, upperTick] = this.tickRange;
    const baseDeposit = calculateDepositAmountForBase(
      this.pool.currentSqrtPrice,
      lowerTick,
      upperTick,
      quoteDeposit
    );

    const totalDeposit = new Dec(baseDeposit.add(this.currentPrice.truncate()));

    return [
      new RatePretty(new Dec(baseDeposit).quo(totalDeposit)),
      new RatePretty(this.currentPrice.quo(totalDeposit)),
    ];
  }

  get baseDenom(): string {
    return this._pool.poolAssetDenoms[0];
  }

  get quoteDenom(): string {
    return this._pool.poolAssetDenoms[1];
  }

  @action
  setSender(sender: string) {
    this._sender = sender;
  }

  get sender(): string {
    return this._sender;
  }

  @action
  setModalView = (viewType: "overview" | "add_manual" | "add_managed") => {
    this._modalView = viewType;
  };

  get modalView(): "overview" | "add_manual" | "add_managed" {
    return this._modalView;
  }

  @action
  setAnchorAsset = (anchor: "base" | "quote") => {
    this._anchorAsset = anchor;
  };

  @action
  setMinRange = (min: Dec | number) => {
    this._priceRange = [
      roundPriceToNearestTick(typeof min === "number" ? new Dec(min) : min),
      this._priceRange[1],
    ];
  };

  @action
  setMaxRange = (max: Dec | number) => {
    this._priceRange = [
      this._priceRange[0],
      roundPriceToNearestTick(typeof max === "number" ? new Dec(max) : max),
    ];
  };

  @computed
  get range(): [Dec, Dec] {
    if (this.fullRange) return [minSpotPrice, maxSpotPrice];
    return this._priceRange;
  }

  @computed
  get tickRange(): [Int, Int] {
    if (this.fullRange) return [minTick, maxTick];
    return [priceToTick(this._priceRange[0]), priceToTick(this._priceRange[1])];
  }

  @action
  setFullRange = (isFullRange: boolean) => {
    this._fullRange = isFullRange;
  };

  get fullRange(): boolean {
    return this._fullRange;
  }

  get baseDepositAmountIn(): AmountConfig {
    return this._baseDepositAmountIn;
  }

  get quoteDepositAmountIn(): AmountConfig {
    return this._quoteDepositAmountIn;
  }

  @computed
  get baseDepositOnly(): boolean {
    return (
      !this.fullRange &&
      this.currentPrice.gt(this.range[0]) &&
      this.currentPrice.gt(this.range[1])
    );
  }

  @computed
  get quoteDepositOnly(): boolean {
    return (
      !this.fullRange &&
      this.currentPrice.lt(this.range[0]) &&
      this.currentPrice.lt(this.range[1])
    );
  }

  @computed
  get currentStrategy(): "passive" | "aggressive" | "moderate" | null {
    const isRangePassive = this.fullRange;
    const isRangeAggressive =
      !isRangePassive &&
      this.tickRange[0].equals(this.aggressiveTickRange[0]) &&
      this.tickRange[1].equals(this.aggressiveTickRange[1]);
    const isRangeModerate =
      !isRangePassive &&
      this.tickRange[0].equals(this.moderateTickRange[0]) &&
      this.tickRange[1].equals(this.moderateTickRange[1]);

    if (isRangePassive) return "passive";
    if (isRangeModerate) return "moderate";
    if (isRangeAggressive) return "aggressive";
    return null;
  }

  @computed
  get error(): Error | undefined {
    if (!this.fullRange && this.range[0].gte(this.range[1])) {
      return new InvalidRangeError(
        "lower range must be less than upper range."
      );
    }

    if (this.quoteDepositOnly) {
      return this._quoteDepositAmountIn.error;
    }

    if (this.baseDepositOnly) {
      return this._baseDepositAmountIn.error;
    }

    return this._baseDepositAmountIn.error || this._quoteDepositAmountIn.error;
  }
}
