import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { AmountConfig } from "@osmosis-labs/keplr-hooks";
import {
  ChainGetter,
  IQueriesStore,
  ObservableQueryBalances,
} from "@osmosis-labs/keplr-stores";
import {
  BigDec,
  calcAmount0,
  calcAmount1,
  maxSpotPrice,
  maxTick,
  minSpotPrice,
  minTick,
  priceToTick,
  roundPriceToNearestTick,
  roundToNearestDivisible,
} from "@osmosis-labs/math";
import type { ConcentratedPoolRawResponse, Pool } from "@osmosis-labs/server";
import {
  FakeFeeConfig,
  IPriceStore,
  OsmosisQueries,
  PriceConfig,
} from "@osmosis-labs/stores";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { useCallback, useEffect, useState } from "react";

import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/** Maintains a single instance of `ObservableAddConcentratedLiquidityConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `poolId`, `bech32Address` on render.
 *
 *  Provides memoized callbacks for sending common messages associated with adding concentrated liquidity.
 */
export function useAddConcentratedLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string
): {
  config: ObservableAddConcentratedLiquidityConfig;
  addLiquidity: (superfluidValidatorAddress?: string) => Promise<void>;
  increaseLiquidity: (positionId: string) => Promise<void>;
} {
  const { accountStore, queriesStore, priceStore } = useStore();
  const osmosisQueries = queriesStore.get(osmosisChainId).osmosis!;
  const { logEvent } = useAmplitudeAnalytics();

  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";

  const { data: pool, isFetched: isPoolFetched } =
    api.edge.pools.getPool.useQuery(
      { poolId },
      {
        refetchInterval: 5_000, // 5 seconds
      }
    );

  const [config] = useState(
    () =>
      new ObservableAddConcentratedLiquidityConfig(
        chainGetter,
        osmosisChainId,
        poolId,
        address,
        queriesStore,
        queriesStore.get(osmosisChainId).queryBalances,
        priceStore
      )
  );
  // react dev tools will unmount the component so only dispose if
  // in production environment, where the component will only unmount once
  useEffect(
    () => () => {
      if (process.env.NODE_ENV === "production") {
        config.dispose();
      }
    },
    [config]
  );

  if (pool && pool.type === "concentrated") config.setPool(pool);

  const { data: baseDepositPrice } = api.edge.assets.getAssetPrice.useQuery({
    coinMinimalDenom: pool?.reserveCoins[0].currency.coinMinimalDenom ?? "",
  });

  const { data: quoteDepositPrice } = api.edge.assets.getAssetPrice.useQuery({
    coinMinimalDenom: pool?.reserveCoins[1].currency.coinMinimalDenom ?? "",
  });

  if (baseDepositPrice && quoteDepositPrice) {
    config.setPrices(baseDepositPrice, quoteDepositPrice);
  }

  const { data: historicalPriceData } =
    api.edge.assets.getAssetPairHistoricalPrice.useQuery(
      {
        poolId,
        baseCoinMinimalDenom:
          pool?.reserveCoins[0].currency.coinMinimalDenom ?? "",
        quoteCoinMinimalDenom:
          pool?.reserveCoins[1].currency.coinMinimalDenom ?? "",
        timeDuration: "7d",
      },
      { enabled: isPoolFetched }
    );
  if (historicalPriceData)
    config.setHistoricalPriceMinMax(
      historicalPriceData.min,
      historicalPriceData.max
    );

  const addLiquidity = useCallback(
    (superfluidValidatorAddress?: string) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          const quoteCoin = {
            currency: config.quoteDepositAmountIn.sendCurrency,
            amount: config.quoteDepositAmountIn.amount,
          };
          const baseCoin = {
            currency: config.baseDepositAmountIn.sendCurrency,
            amount: config.baseDepositAmountIn.amount,
          };
          let quoteDepositValue = undefined;
          let baseDepositValue = undefined;
          if (config.baseDepositOnly) {
            baseDepositValue = baseCoin;
          } else if (config.quoteDepositOnly) {
            quoteDepositValue = quoteCoin;
          } else {
            quoteDepositValue = quoteCoin;
            baseDepositValue = baseCoin;
          }

          const baseEvent = {
            isSingleAsset:
              !Boolean(baseDepositValue) || !Boolean(quoteDepositValue),
            volatilityType: config.currentStrategy ?? "",
            poolId,
            rangeHigh: Number(config.rangeWithCurrencyDecimals[1].toString()),
            rangeLow: Number(config.rangeWithCurrencyDecimals[0].toString()),
          };
          logEvent([
            EventName.ConcentratedLiquidity.addLiquidityStarted,
            baseEvent,
          ]);

          await account?.osmosis.sendCreateConcentratedLiquidityPositionMsg(
            config.poolId,
            config.tickRange[0],
            config.tickRange[1],
            superfluidValidatorAddress,
            baseDepositValue,
            quoteDepositValue,
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else {
                osmosisQueries.queryLiquiditiesPerTickRange
                  .getForPoolId(poolId)
                  .waitFreshResponse()
                  .then(() => resolve());

                logEvent([
                  EventName.ConcentratedLiquidity.addLiquidityCompleted,
                  baseEvent,
                ]);
              }
            }
          );
        } catch (e: any) {
          console.error(e);
          reject(e.message);
        }
      });
    },
    [
      poolId,
      account?.osmosis,
      osmosisQueries.queryLiquiditiesPerTickRange,
      config.baseDepositAmountIn.sendCurrency,
      config.baseDepositAmountIn.amount,
      config.quoteDepositAmountIn.sendCurrency,
      config.quoteDepositAmountIn.amount,
      config.baseDepositOnly,
      config.quoteDepositOnly,
      config.tickRange,
      config.currentStrategy,
      config.rangeWithCurrencyDecimals,
      config.poolId,
      logEvent,
    ]
  );

  const increaseLiquidity = useCallback(
    (positionId: string) =>
      new Promise<void>(async (resolve, reject) => {
        const coin0 = config.quoteDepositOnly
          ? {
              denom: config.baseDepositAmountIn.sendCurrency.coinMinimalDenom,
              amount: "0",
            }
          : config.baseDepositAmountIn.getAmountPrimitive();
        const coin1 = config.baseDepositOnly
          ? {
              denom: config.quoteDepositAmountIn.sendCurrency.coinMinimalDenom,
              amount: "0",
            }
          : config.quoteDepositAmountIn.getAmountPrimitive();

        logEvent([EventName.ConcentratedLiquidity.addMoreLiquidityStarted]);

        try {
          await account!.osmosis.sendAddToConcentratedLiquidityPositionMsg(
            positionId,
            coin0,
            coin1,
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else {
                osmosisQueries.queryLiquiditiesPerTickRange
                  .getForPoolId(poolId)
                  .waitFreshResponse();

                logEvent([
                  EventName.ConcentratedLiquidity.addMoreLiquidityCompleted,
                ]);

                resolve();
              }
            }
          );
        } catch (e: any) {
          console.error(e);
          reject(e.message);
        }
      }),
    [
      poolId,
      osmosisQueries.queryLiquiditiesPerTickRange,
      config.baseDepositAmountIn,
      config.quoteDepositAmountIn,
      config.baseDepositOnly,
      config.quoteDepositOnly,
      account,
      logEvent,
    ]
  );

  return { config, addLiquidity, increaseLiquidity };
}

export const MODERATE_STRATEGY_MULTIPLIER = 0.25;
export const AGGRESSIVE_STRATEGY_MULTIPLIER = 0.05;

/** Use to config user input UI for eventually sending a valid add concentrated liquidity msg.
 */
export class ObservableAddConcentratedLiquidityConfig {
  @observable
  protected _sender: string;

  @observable.ref
  protected _pool: Pool | null = null;

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
  protected _baseDepositPrice: PricePretty | null = null;

  @observable
  protected _quoteDepositPrice: PricePretty | null = null;

  @observable
  protected _anchorAsset: "base" | "quote" = "base";

  @observable
  protected _superfluidStakingElected = false;

  @observable
  protected chainId: string;

  @observable
  protected _minHistoricalPrice: number | null = null;

  @observable
  protected _maxHistoricalPrice: number | null = null;

  @computed
  get pool() {
    if (this._pool?.type !== "concentrated") return null;

    const [base, quote] = this._pool.reserveCoins;
    const multiplicationQuoteOverBase = DecUtils.getTenExponentN(
      (base.currency.coinDecimals ?? 0) - (quote.currency.coinDecimals ?? 0)
    );

    const pool = {
      ...this._pool,
      type: "concentrated",
      raw: this._pool.raw as ConcentratedPoolRawResponse,
    };

    const currentSqrtPrice = new BigDec(pool.raw.current_sqrt_price);

    return {
      ...pool,
      poolAssetDenoms: [base.currency.coinDenom, quote.currency.coinDenom],
      currentSqrtPrice,
      currentPrice: currentSqrtPrice
        .mul(currentSqrtPrice)
        .toDec()
        .mul(multiplicationQuoteOverBase),
      tickSpacing: Number(pool.raw.tick_spacing),
    };
  }

  get sender(): string {
    return this._sender;
  }

  get modalView(): "overview" | "add_manual" | "add_managed" {
    return this._modalView;
  }

  /** Flag indicating that the user prefers superfluid staking for this full range position. */
  get shouldBeSuperfluidStaked() {
    return this._superfluidStakingElected && this.fullRange;
  }

  /** Current price adjusted with base and quote token decimals. */
  @computed
  get currentPriceWithDecimals(): Dec {
    const queryPool = this.queriesStore
      .get(this.chainId)
      .osmosis!.queryPools.getPool(this.poolId);

    return queryPool?.concentratedLiquidityPoolInfo?.currentPrice ?? new Dec(0);
  }

  /** Current price, without currency decimals. */
  @computed
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
    if (
      !this.pool ||
      this._minHistoricalPrice === null ||
      this._maxHistoricalPrice === null
    )
      return [new Dec(0.1), new Dec(100)];

    const min = this._minHistoricalPrice;
    const max = this._maxHistoricalPrice;

    // query returns prices with decimals for display
    const minPrice7d = this._priceRangeInput[0].removeCurrencyDecimals(min);
    const maxPrice7d = this._priceRangeInput[1].removeCurrencyDecimals(max);
    const priceDiff = maxPrice7d
      .sub(minPrice7d)
      .mul(new Dec(MODERATE_STRATEGY_MULTIPLIER));

    return [
      roundPriceToNearestTick(
        minPrice7d.sub(priceDiff).abs(),
        this.pool.tickSpacing,
        true
      ),
      roundPriceToNearestTick(
        maxPrice7d.add(priceDiff).abs(),
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

  /** Initial custom price range, without currency decimals. */
  @computed
  get initialCustomPriceRange(): [Dec, Dec] {
    if (!this.pool) return [new Dec(0.1), new Dec(100)];

    return [
      roundPriceToNearestTick(
        this.currentPrice.mul(new Dec(0.45)),
        this.pool.tickSpacing,
        true
      ),
      roundPriceToNearestTick(
        this.currentPrice.mul(new Dec(1.55)),
        this.pool.tickSpacing,
        false
      ),
    ];
  }

  @computed
  get initialCustomTickRange(): [Int, Int] {
    return [
      roundToNearestDivisible(
        priceToTick(this.initialCustomPriceRange[0]),
        this.tickDivisor
      ),
      roundToNearestDivisible(
        priceToTick(this.initialCustomPriceRange[1]),
        this.tickDivisor
      ),
    ];
  }

  /** Aggressive price range, without currency decimals. */
  @computed
  get aggressivePriceRange(): [Dec, Dec] {
    if (
      !this.pool ||
      this._minHistoricalPrice === null ||
      this._maxHistoricalPrice === null
    )
      return [new Dec(0.1), new Dec(100)];

    const min = this._minHistoricalPrice;
    const max = this._maxHistoricalPrice;

    // query returns prices with decimals for display
    const minPrice1Mo = this._priceRangeInput[0].removeCurrencyDecimals(min);
    const maxPrice1Mo = this._priceRangeInput[1].removeCurrencyDecimals(max);
    const priceDiff = maxPrice1Mo
      .sub(minPrice1Mo)
      .mul(new Dec(AGGRESSIVE_STRATEGY_MULTIPLIER));

    return [
      roundPriceToNearestTick(
        minPrice1Mo.sub(priceDiff).abs(),
        this.pool.tickSpacing,
        true
      ),
      roundPriceToNearestTick(
        maxPrice1Mo.add(priceDiff).abs(),
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
    return new Int(this.pool?.tickSpacing ?? 100);
  }

  @computed
  get depositPercentages(): [RatePretty, RatePretty] {
    if (!this.pool) return [new RatePretty(0), new RatePretty(0)];
    if (this.baseDepositOnly) return [new RatePretty(1), new RatePretty(0)];
    if (this.quoteDepositOnly) return [new RatePretty(0), new RatePretty(1)];

    const amount1 = new Int(1)
      .toDec()
      .mul(
        DecUtils.getTenExponentN(
          this._quoteDepositAmountIn.sendCurrency.coinDecimals
        )
      )
      .truncate();

    const [lowerTick, upperTick] = this.tickRange;

    // calculate proportional amount of other amount
    const amount0 = calcAmount0(
      amount1,
      lowerTick,
      upperTick,
      this.pool.currentSqrtPrice
    );

    const amount0Value = this._baseDepositPrice
      ? this._baseDepositPrice.mul(
          new CoinPretty(this._baseDepositAmountIn.sendCurrency, amount0)
        )
      : new CoinPretty(this._baseDepositAmountIn.sendCurrency, 1);
    const amount1Value = this._quoteDepositPrice
      ? this._quoteDepositPrice.mul(
          new CoinPretty(this._quoteDepositAmountIn.sendCurrency, amount1)
        )
      : new CoinPretty(this._quoteDepositAmountIn.sendCurrency, 1);

    const totalValue = amount0Value.toDec().add(amount1Value.toDec());

    if (totalValue.isZero()) return [new RatePretty(0), new RatePretty(0)];

    return [
      new RatePretty(amount0Value.toDec().quo(totalValue)),
      new RatePretty(amount1Value.toDec().quo(totalValue)),
    ];
  }

  get baseDenom(): string {
    return this.pool?.poolAssetDenoms[0] ?? "";
  }

  get quoteDenom(): string {
    return this.pool?.poolAssetDenoms[1] ?? "";
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
  protected get range(): [Dec, Dec] {
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
    if (this.fullRange) {
      return [
        this._priceRangeInput[0].addCurrencyDecimals(minSpotPrice),
        // for display, avoid using max spot price since the price chart would get flattened
        this.currentPriceWithDecimals.mul(new Dec(2)),
      ];
    }

    return [
      this._priceRangeInput[0].toDecWithCurrencyDecimals(),
      this._priceRangeInput[1].toDecWithCurrencyDecimals(),
    ];
  }

  /** Warning: not adjusted to nearest valid tick or adjusted and **does include** currency decimals. */
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

      let lowerTickRounded = roundToNearestDivisible(
        lowerTick,
        this.tickDivisor
      );
      let upperTickRounded = roundToNearestDivisible(
        upperTick,
        this.tickDivisor
      );

      // If they rounded to the same value, pad both to respect the
      // user's desired range.
      if (lowerTickRounded.equals(upperTickRounded)) {
        lowerTickRounded = lowerTickRounded.sub(this.tickDivisor);
        upperTickRounded = upperTickRounded.add(this.tickDivisor);
      }

      return [
        lowerTickRounded.lt(minTick) ? minTick : lowerTickRounded,
        upperTickRounded.gt(maxTick) ? maxTick : upperTickRounded,
      ];
    } catch (e) {
      console.error(e);
      return [minTick, maxTick];
    }
  }

  protected _disposers: (() => void)[] = [];

  constructor(
    protected readonly chainGetter: ChainGetter,
    initialChainId: string,
    readonly poolId: string,
    sender: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly queryBalances: ObservableQueryBalances,
    protected readonly priceStore: IPriceStore
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

    const queryAccountBalances =
      this.queryBalances.getQueryBech32Address(sender);

    let initialized = false;

    // Set the initial range to be the initial custom range
    this._disposers.push(
      autorun(() => {
        if (
          this.pool &&
          this._baseDepositAmountIn.sendCurrency &&
          this._quoteDepositAmountIn.sendCurrency &&
          this._minHistoricalPrice !== null &&
          this._maxHistoricalPrice !== null &&
          !initialized
        ) {
          const multiplicationQuoteOverBase = DecUtils.getTenExponentN(
            (this._baseDepositAmountIn.sendCurrency.coinDecimals ?? 0) -
              (this._quoteDepositAmountIn.sendCurrency.coinDecimals ?? 0)
          );

          // Set the initial range to be the moderate range
          this.setMinRange(
            this.moderatePriceRange[0]
              .mul(multiplicationQuoteOverBase)
              .toString()
          );
          this.setMaxRange(
            this.moderatePriceRange[1]
              .mul(multiplicationQuoteOverBase)
              .toString()
          );

          initialized = true;
        }
      })
    );

    // Calculate quote amount when base amount is input and anchor is base
    // Calculate an amount1 given an amount0
    this._disposers.push(
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
      })
    );

    // Calculate base amount when quote amount is input and anchor is quote
    // calculate amount0 given an amount1
    this._disposers.push(
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
      })
    );

    makeObservable(this);
  }

  dispose() {
    this._disposers.forEach((dispose) => dispose());
  }

  @action
  setPool(pool: Pool) {
    if (pool.type !== "concentrated") throw new Error("Wrong pool type");

    this._pool = pool;

    const [baseCurrency, quoteCurrency] = pool.reserveCoins.map(
      (coin) => coin.currency
    );

    this._baseDepositAmountIn.setSendCurrency(baseCurrency);
    this._quoteDepositAmountIn.setSendCurrency(quoteCurrency);
    this._priceRangeInput[0].setBaseCurrency(baseCurrency);
    this._priceRangeInput[0].setQuoteCurrency(quoteCurrency);
    this._priceRangeInput[1].setBaseCurrency(baseCurrency);
    this._priceRangeInput[1].setQuoteCurrency(quoteCurrency);

    // subtract CL create pos tx gas when setting max amount of stake currency
    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;
    const createPosGasConfig = new FakeFeeConfig(
      this.chainGetter,
      this.chainId,
      3_000_000 //osmosisMsgOpts.clCreatePosition.gas
    );
    if (stakeCurrency.coinMinimalDenom === baseCurrency.coinMinimalDenom) {
      this._baseDepositAmountIn.setFeeConfig(createPosGasConfig);
    } else if (
      stakeCurrency.coinMinimalDenom === quoteCurrency.coinMinimalDenom
    ) {
      this._quoteDepositAmountIn.setFeeConfig(createPosGasConfig);
    }
  }

  @action
  readonly setElectSuperfluidStaking = (elected: boolean) => {
    this._superfluidStakingElected = elected;
  };

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
  readonly setHistoricalPriceMinMax = (min: number, max: number) => {
    if (min !== Infinity) this._minHistoricalPrice = min;
    if (max !== Infinity) this._maxHistoricalPrice = max;
  };

  @action
  readonly setPrices = (
    baseDepositPrice: PricePretty,
    quoteDepositPrice: PricePretty
  ) => {
    this._baseDepositPrice = baseDepositPrice;
    this._quoteDepositPrice = quoteDepositPrice;
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

export class InvalidRangeError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, InvalidRangeError.prototype);
  }
}
