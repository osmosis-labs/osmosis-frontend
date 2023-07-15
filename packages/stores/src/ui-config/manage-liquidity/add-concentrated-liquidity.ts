import { AmountConfig } from "@keplr-wallet/hooks";
import {
  ChainGetter,
  IQueriesStore,
  ObservableQueryBalances,
} from "@keplr-wallet/stores";
import { CoinPretty, Dec, DecUtils, Int, RatePretty } from "@keplr-wallet/unit";
import {
  calcAmount0,
  calcAmount1,
  maxSpotPrice,
  maxTick,
  minSpotPrice,
  minTick,
  priceToTick,
  roundPriceToNearestTick,
} from "@osmosis-labs/math";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { action, autorun, computed, makeObservable, observable } from "mobx";

import { OsmosisQueries } from "../../queries";
import { PriceConfig } from "../price";
import { InvalidRangeError } from "./errors";

/** Use to config user input UI for eventually sending a valid add concentrated liquidity msg.
 */
export class ObservableAddConcentratedLiquidityConfig {
  @observable
  protected _sender: string;

  @observable
  protected _pool: ConcentratedLiquidityPool | null = null;

  /*
	 Used to get current view type of AddConcLiquidity modal
	 */
  @observable
  protected _modalView: "overview" | "add_manual" | "add_managed" = "overview";

  /*
   Used to get min and max range for adding concentrated liquidity
   */
  @observable
  protected _priceRangeInput: [PriceConfig, PriceConfig];

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

  @observable
  protected chainId: string;

  get pool(): ConcentratedLiquidityPool | null {
    return this._pool;
  }

  get sender(): string {
    return this._sender;
  }

  get modalView(): "overview" | "add_manual" | "add_managed" {
    return this._modalView;
  }

  /** Current price adjusted with base and quote token decimals. */
  @computed
  get currentPriceWithDecimals(): Dec {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const queryPool = this.queriesStore
      .get(this.chainId)
      .osmosis!.queryPools.getPool(this.poolId);

    return queryPool?.concentratedLiquidityPoolInfo?.currentPrice ?? new Dec(0);
  }

  /** Current price, without currency decimals. */
  get currentPrice(): Dec {
    return (
      this.pool?.currentSqrtPrice
        .mul(this.pool?.currentSqrtPrice ?? new Dec(0))
        .toDec() ?? new Dec(0)
    );
  }

  /** Moderate price range, without currency decimals. */
  @computed
  get moderatePriceRange(): [Dec, Dec] {
    if (!this.pool) return [new Dec(0.1), new Dec(100)];

    return [
      roundPriceToNearestTick(
        this.currentPrice.mul(new Dec(0.5)),
        this.pool.tickSpacing,
        true
      ),
      roundPriceToNearestTick(
        this.currentPrice.mul(new Dec(1.5)),
        this.pool.tickSpacing,
        false
      ),
    ];
  }

  @computed
  get moderateTickRange(): [Int, Int] {
    return [
      roundToNearestDivisible(
        priceToTick(this.moderatePriceRange[0]),
        this.tickDivisor
      ),
      roundToNearestDivisible(
        priceToTick(this.moderatePriceRange[1]),
        this.tickDivisor
      ),
    ];
  }

  /** Aggressive price range, without currency decimals. */
  @computed
  get aggressivePriceRange(): [Dec, Dec] {
    if (!this.pool) return [new Dec(0.1), new Dec(100)];

    return [
      roundPriceToNearestTick(
        this.currentPrice.mul(new Dec(0.75)),
        this.pool.tickSpacing,
        true
      ),
      roundPriceToNearestTick(
        this.currentPrice.mul(new Dec(1.25)),
        this.pool.tickSpacing,
        false
      ),
    ];
  }

  @computed
  get aggressiveTickRange(): [Int, Int] {
    return [
      roundToNearestDivisible(
        priceToTick(this.aggressivePriceRange[0]),
        this.tickDivisor
      ),
      roundToNearestDivisible(
        priceToTick(this.aggressivePriceRange[1]),
        this.tickDivisor
      ),
    ];
  }

  /** Used to ensure ticks are cleanly divisible by. */
  protected get tickDivisor() {
    // TODO: use tickspacing from pool going forward
    return new Int(1000);
  }

  @computed
  get depositPercentages(): [RatePretty, RatePretty] {
    if (!this.pool) return [new RatePretty(0), new RatePretty(0)];
    if (this.baseDepositOnly) return [new RatePretty(1), new RatePretty(0)];
    if (this.quoteDepositOnly) return [new RatePretty(0), new RatePretty(1)];

    const amount1 = new Int(1)
      .toDec()
      .mul(
        DecUtils.getTenExponentNInPrecisionRange(
          this._quoteDepositAmountIn.sendCurrency.coinDecimals
        )
      )
      .truncate();

    const [lowerTick, upperTick] = this.tickRange;

    // calculate proportional amount of other amount
    const amount0 = calcAmount1(
      amount1,
      lowerTick,
      upperTick,
      this.pool.currentSqrtPrice
    );

    const totalDeposit = amount0.add(amount1);

    return [
      new RatePretty(amount1.toDec().quo(totalDeposit.toDec())),
      new RatePretty(amount0.toDec().quo(totalDeposit.toDec())),
    ];
  }

  get baseDenom(): string {
    return this._pool?.poolAssetDenoms[0] ?? "";
  }

  get quoteDenom(): string {
    return this._pool?.poolAssetDenoms[1] ?? "";
  }

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
    // can be 0 if no positions in pool
    if (this.currentPrice.isZero()) return false;

    const range0 = this.range[0];
    const range1 = this.range[1];
    if (typeof range0 === "string" || typeof range1 === "string") return false;

    return (
      !this.fullRange &&
      this.currentPrice.lt(range0) &&
      this.currentPrice.lt(range1)
    );
  }

  @computed
  get quoteDepositOnly(): boolean {
    // can be 0 if no positions in pool
    if (this.currentPrice.isZero()) return false;

    return (
      !this.fullRange &&
      this.currentPrice.gt(this.range[0]) &&
      this.currentPrice.gt(this.range[1])
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

  /** User-selected price range without currency decimals, rounded to nearest tick. Within +/-50x of current tick. */
  @computed
  get range(): [Dec, Dec] {
    const input0 = this._priceRangeInput[0].toDec();
    const input1 = this._priceRangeInput[1].toDec();
    if (this.fullRange || !this.pool) return [minSpotPrice, maxSpotPrice];

    const inputMinPrice = roundPriceToNearestTick(
      input0,
      this.pool.tickSpacing,
      true
    );
    const inputMaxPrice = roundPriceToNearestTick(
      input1,
      this.pool.tickSpacing,
      true
    );

    const minPrice50x = this.pool.currentSqrtPrice
      .mul(this.pool.currentSqrtPrice)
      .toDec()
      .quo(new Dec(50));
    const maxPrice50x = this.pool.currentSqrtPrice
      .mul(this.pool.currentSqrtPrice)
      .toDec()
      .mul(new Dec(50));

    return [
      inputMinPrice.lt(minPrice50x) ? minPrice50x : inputMinPrice,
      inputMaxPrice.gt(maxPrice50x) ? maxPrice50x : inputMaxPrice,
    ];
  }

  /** Price range with decimals adjusted based on currencies. */
  @computed
  get rangeWithCurrencyDecimals(): [Dec, Dec] {
    if (this.fullRange)
      return [
        this._priceRangeInput[0].addCurrencyDecimals(minSpotPrice),
        this._priceRangeInput[1].addCurrencyDecimals(maxSpotPrice),
      ];

    return [
      this._priceRangeInput[0].toDecWithCurrencyDecimals(),
      this._priceRangeInput[1].toDecWithCurrencyDecimals(),
    ];
  }

  /** Warning: not adjusted to nearest valid tick or adjusted and is currency decimals. */
  @computed
  get rangeRaw(): [string, string] {
    return [
      this._priceRangeInput[0].toString(),
      this._priceRangeInput[1].toString(),
    ];
  }

  @computed
  get tickRange(): [Int, Int] {
    if (this.fullRange || !this.pool) return [minTick, maxTick];
    try {
      // account for precision issues from price <> tick conversion
      const lowerTick = priceToTick(this.range[0]);
      const upperTick = priceToTick(this.range[1]);

      const lowerTickRounded = roundToNearestDivisible(
        lowerTick,
        this.tickDivisor
      );
      const upperTickRounded = roundToNearestDivisible(
        upperTick,
        this.tickDivisor
      );

      return [
        lowerTickRounded.lt(minTick) ? minTick : lowerTickRounded,
        upperTickRounded.gt(maxTick) ? maxTick : upperTickRounded,
      ];
    } catch (e) {
      console.error(e);
      return [minTick, maxTick];
    }
  }

  constructor(
    protected readonly chainGetter: ChainGetter,
    initialChainId: string,
    readonly poolId: string,
    sender: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly queryBalances: ObservableQueryBalances
  ) {
    this.chainId = initialChainId;

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

    this._baseDepositAmountIn.setAmount("0");
    this._quoteDepositAmountIn.setAmount("0");

    this._priceRangeInput = [
      new PriceConfig(
        this._baseDepositAmountIn.sendCurrency,
        this._quoteDepositAmountIn.sendCurrency
      ),
      new PriceConfig(
        this._baseDepositAmountIn.sendCurrency,
        this._quoteDepositAmountIn.sendCurrency
      ),
    ];

    // Set the initial range to be the moderate range
    this._priceRangeInput[0].input(this.moderatePriceRange[0]);
    this._priceRangeInput[1].input(this.moderatePriceRange[1]);

    const queryAccountBalances =
      this.queryBalances.getQueryBech32Address(sender);

    // Calculate quote amount when base amount is input and anchor is base
    // Calculate an amount1 given an amount0
    autorun(() => {
      const baseAmountRaw =
        this.baseDepositAmountIn.getAmountPrimitive().amount;
      const amount0 = new Int(baseAmountRaw);
      const anchor = this._anchorAsset;

      // TODO: check counterparty balance and subtract to not exceed that
      // potential approach: subtract from to meet counterparty balance max amount then let effect set the max balance

      if (anchor !== "base" || amount0.lte(new Int(0))) return;

      // special case: likely no positions created yet in pool
      if (!this.pool || this.pool.currentSqrtPrice.isZero()) {
        return;
      }

      if (amount0.isZero()) this._quoteDepositAmountIn.setAmount("0");

      const [lowerTick, upperTick] = this.tickRange;

      // calculate proportional amount of other amount
      const amount1 = calcAmount1(
        amount0,
        lowerTick,
        upperTick,
        this.pool.currentSqrtPrice
      );
      // include decimals, as is displayed to user
      const quoteCoin = new CoinPretty(
        this._quoteDepositAmountIn.sendCurrency,
        amount1
      );

      const quoteBalance = queryAccountBalances.getBalanceFromCurrency(
        this._quoteDepositAmountIn.sendCurrency
      );

      // set max: if quote coin higher than quote balance, set to quote balance
      if (
        this._baseDepositAmountIn.isMax &&
        quoteCoin.toDec().gt(quoteBalance.toDec())
      ) {
        this.setQuoteDepositAmountMax();
      } else {
        this._quoteDepositAmountIn.setAmount(
          quoteCoin.hideDenom(true).locale(false).trim(true).toString()
        );
      }
    });

    // Calculate base amount when quote amount is input and anchor is quote
    // calculate amount0 given an amount1
    autorun(() => {
      const quoteAmountRaw =
        this.quoteDepositAmountIn.getAmountPrimitive().amount;
      const amount1 = new Int(quoteAmountRaw);
      const anchor = this._anchorAsset;

      if (anchor !== "quote" || amount1.lte(new Int(0))) return;

      // special case: likely no positions created yet in pool
      if (!this.pool || this.pool.currentSqrtPrice.isZero()) {
        return;
      }

      if (amount1.isZero()) this._baseDepositAmountIn.setAmount("0");

      const [lowerTick, upperTick] = this.tickRange;

      // calculate proportional amount of other amount
      const amount0 = calcAmount0(
        amount1,
        lowerTick,
        upperTick,
        this.pool.currentSqrtPrice
      );
      // include decimals, as is displayed to user
      const baseCoin = new CoinPretty(
        this._baseDepositAmountIn.sendCurrency,
        amount0
      );

      const baseBalance = queryAccountBalances.getBalanceFromCurrency(
        this._baseDepositAmountIn.sendCurrency
      );

      // set max: if base coin higher than base balance, set to base balance
      if (
        this._quoteDepositAmountIn.isMax &&
        baseCoin.toDec().gt(baseBalance.toDec())
      ) {
        this.setBaseDepositAmountMax();
      } else {
        this._baseDepositAmountIn.setAmount(
          baseCoin.hideDenom(true).locale(false).trim(true).toString()
        );
      }
    });

    makeObservable(this);
  }

  @action
  setPool(pool: ConcentratedLiquidityPool) {
    this._pool = pool;

    const [baseDenom, quoteDenom] = pool.poolAssetDenoms;
    const baseCurrency = this.chainGetter
      .getChain(this.chainId)
      .forceFindCurrency(baseDenom);
    const quoteCurrency = this.chainGetter
      .getChain(this.chainId)
      .forceFindCurrency(quoteDenom);

    this._baseDepositAmountIn.setSendCurrency(baseCurrency);
    this._quoteDepositAmountIn.setSendCurrency(quoteCurrency);
    this._priceRangeInput[0].setBaseCurrency(baseCurrency);
    this._priceRangeInput[0].setQuoteCurrency(quoteCurrency);
    this._priceRangeInput[1].setBaseCurrency(baseCurrency);
    this._priceRangeInput[1].setQuoteCurrency(quoteCurrency);
  }

  @action
  setSender(sender: string) {
    this._sender = sender;
  }

  @action
  readonly setModalView = (
    viewType: "overview" | "add_manual" | "add_managed"
  ) => {
    this._modalView = viewType;
  };

  @action
  readonly setAnchorAsset = (anchor: "base" | "quote") => {
    this._anchorAsset = anchor;
  };

  @action
  readonly setBaseDepositAmountMax = () => {
    this.setAnchorAsset("base");
    this.quoteDepositAmountIn.setIsMax(false);
    this.baseDepositAmountIn.setIsMax(true);
  };

  @action
  readonly setQuoteDepositAmountMax = () => {
    this.setAnchorAsset("quote");
    this.baseDepositAmountIn.setIsMax(false);
    this.quoteDepositAmountIn.setIsMax(true);
  };

  @action
  readonly setMinRange = (min: string) => {
    if (!this.pool) return;

    this._fullRange = false;
    this._priceRangeInput[0].input(min);
  };

  @action
  readonly setMaxRange = (max: string) => {
    if (!this.pool) return;

    this._fullRange = false;
    this._priceRangeInput[1].input(max);
  };

  @action
  readonly setFullRange = (isFullRange: boolean) => {
    this._fullRange = isFullRange;
  };
}

function roundToNearestDivisible(int: Int, divisor: Int): Int {
  const remainder = int.mod(divisor);

  if (new Dec(remainder).gte(new Dec(divisor).quo(new Dec(2)))) {
    return int.add(divisor.sub(remainder));
  } else {
    return int.sub(remainder);
  }
}
