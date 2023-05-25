import { AmountConfig, TxChainSetter } from "@keplr-wallet/hooks";
import {
  ChainGetter,
  IQueriesStore,
  ObservableQueryBalances,
} from "@keplr-wallet/stores";
import { Dec, Int } from "@keplr-wallet/unit";
import {
  ActiveLiquidityPerTickRange,
  calculateDepositAmountForBase,
  maxSpotPrice,
  maxTick,
  minSpotPrice,
  minTick,
  priceToTick,
  roundPriceToNearestTick,
} from "@osmosis-labs/math";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { action, computed, makeObservable, observable } from "mobx";
import { DeepReadonly } from "utility-types";

import { ObservableQueryLiquidityPerTickRange } from "../../queries";
import {
  ObservableQueryTokensPairHistoricalChart,
  PriceRange,
  TokenPairHistoricalPrice,
} from "../../queries-external";
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
   Used to get historical range for price chart
   */
  @observable
  protected _historicalRange: PriceRange = "7d";

  /*
    Used to get historical data for price chart
  */
  @observable
  protected _historicalChartData: TokenPairHistoricalPrice[] = [];

  /*
    Used to get active liquidity data
  */
  @observable
  protected _activeLiquidity: ActiveLiquidityPerTickRange[] = [];

  /*
   Used to get min and max range for adding concentrated liquidity
   */
  @observable
  protected _priceRange: [Dec, Dec] = [minSpotPrice, minSpotPrice];

  @observable
  protected _fullRange: boolean = false;

  @observable
  protected _zoom: number = 1;

  @observable
  protected _hoverPrice: number = 0;

  /*
   Used to get base and quote asset deposit for adding concentrated liquidity
   */
  @observable
  protected _baseDepositAmountIn: AmountConfig;

  @observable
  protected _quoteDepositAmountIn: AmountConfig;

  constructor(
    protected readonly chainGetter: ChainGetter,
    initialChainId: string,
    readonly poolId: string,
    sender: string,
    protected readonly queriesStore: IQueriesStore,
    protected readonly queryBalances: ObservableQueryBalances,
    protected readonly queryRange: ObservableQueryLiquidityPerTickRange,
    protected readonly queryHistorical: DeepReadonly<ObservableQueryTokensPairHistoricalChart>,
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

    this.fetchHistoricalChartData();
    makeObservable(this);
  }

  private fetchHistoricalChartData() {
    const query = this.queryHistorical.get(
      this.poolId,
      this.historicalRange,
      this.baseDenom,
      this.quoteDenom
    );

    query.waitResponse().then(() => {
      this.setHistoricalChartData(query.getChartPrices);
    });
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
    return this._pool.currentSqrtPrice.mul(this._pool.currentSqrtPrice);
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
  get depositPercentages(): [Dec, Dec] {
    if (this.baseDepositOnly) return [new Dec(100), new Dec(0)];
    if (this.quoteDepositOnly) return [new Dec(0), new Dec(100)];

    const quoteDeposit = new Dec(1);
    const baseDeposit = calculateDepositAmountForBase(
      this.currentPrice,
      this.tickRange[0],
      this.tickRange[1],
      quoteDeposit
    );
    const totalDeposit = baseDeposit.add(this.currentPrice);

    return [
      baseDeposit.quo(totalDeposit).mul(new Dec(100)),
      this.currentPrice.quo(totalDeposit).mul(new Dec(100)),
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
  setHistoricalRange = (range: PriceRange) => {
    this._historicalRange = range;
    this.fetchHistoricalChartData();
  };

  get historicalRange(): PriceRange {
    return this._historicalRange;
  }

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

  @action
  setBaseDepositAmountIn = (amount: Dec | number) => {
    const amountDec = typeof amount === "number" ? new Dec(amount) : amount;
    this._baseDepositAmountIn.setAmount(amountDec.toString());
  };

  @action
  setQuoteDepositAmountIn = (amount: Dec | number) => {
    const amountDec = typeof amount === "number" ? new Dec(amount) : amount;
    this._quoteDepositAmountIn.setAmount(amountDec.toString());
  };

  get baseDepositAmountIn(): AmountConfig {
    return this._baseDepositAmountIn;
  }

  get quoteDepositAmountIn(): AmountConfig {
    return this._quoteDepositAmountIn;
  }

  get zoom(): number {
    return this._zoom;
  }

  @action
  readonly setZoom = (zoom: number) => {
    this._zoom = zoom;
  };

  @action
  readonly zoomIn = () => {
    this._zoom = Math.max(1, this._zoom - 0.2);
  };

  @action
  readonly zoomOut = () => {
    this._zoom = this._zoom + 0.2;
  };

  get historicalChartData(): TokenPairHistoricalPrice[] {
    return this._historicalChartData;
  }

  @computed
  get lastChartData(): TokenPairHistoricalPrice | null {
    return (
      this._historicalChartData[this._historicalChartData.length - 1] || null
    );
  }

  @computed
  get priceDecimal(): number {
    if (!this.lastChartData) return 2;
    if (this.lastChartData.close <= 0.001) return 5;
    if (this.lastChartData.close <= 0.01) return 4;
    if (this.lastChartData.close <= 0.1) return 3;
    return 2;
  }

  @action
  readonly setHistoricalChartData = (
    historicalData: TokenPairHistoricalPrice[]
  ) => {
    this._historicalChartData = historicalData;
  };

  @computed
  get activeLiquidity(): ActiveLiquidityPerTickRange[] {
    return this.queryRange.activeLiquidity;
  }

  @action
  readonly setHoverPrice = (price: number) => {
    this._hoverPrice = price;
  };

  get hoverPrice(): number {
    return this._hoverPrice;
  }

  @computed
  get yRange(): [number, number] {
    const data = this.historicalChartData.map(({ time, close }) => ({
      time,
      price: close,
    }));
    const zoom = this.zoom;
    const min = Number(this.range[0].toString());
    const max = Number(this.range[1].toString());
    const padding = 0.2;
    const prices = data.map((d) => d.price);

    const chartMin = Math.max(0, Math.min(...prices));
    const chartMax = Math.max(...prices);

    if (this.fullRange && prices.length) {
      return [chartMin * 0.8, chartMax * 1.2];
    }

    const absMax = Math.max(max, chartMax);
    const absMin = Math.min(min, chartMin);

    const delta = Math.abs(absMax - absMin);

    const minWithPadding = Math.max(0, absMin - delta * padding);
    const maxWithPadding = absMax + delta * padding;

    const zoomAdjustedMin = zoom > 1 ? chartMin / zoom : chartMin * zoom;
    const zoomAdjustedMax = chartMax * zoom;

    let finalMin = minWithPadding;
    let finalMax = maxWithPadding;

    if (zoomAdjustedMin < minWithPadding) finalMin = zoomAdjustedMin;
    if (zoomAdjustedMax > maxWithPadding) finalMax = zoomAdjustedMax;

    return [finalMin, finalMax];
  }

  @computed
  get depthChartData(): { price: number; depth: number }[] {
    const data = this.activeLiquidity;
    const [min, max] = this.yRange;

    if (min === max) return [];

    const depths: { price: number; depth: number }[] = [];

    for (let price = min; price <= max; price += (max - min) / 20) {
      const spotPrice = Math.min(
        Math.max(Number(minSpotPrice.toString()), price),
        Number(maxSpotPrice.toString())
      );
      depths.push({
        price,
        depth: getLiqFrom(priceToTick(new Dec(spotPrice)), data),
      });
    }

    return depths;
  }

  @computed
  get xRange(): [number, number] {
    if (!this.depthChartData.length) return [0, 0];

    return [0, Math.max(...this.depthChartData.map((d) => d.depth)) * 1.2];
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

function getLiqFrom(target: Int, list: ActiveLiquidityPerTickRange[]): number {
  for (let i = 0; i < list.length; i++) {
    if (list[i].lowerTick.lte(target) && list[i].upperTick.gte(target)) {
      return Number(list[i].liquidityAmount.toString());
    }
  }
  return 0;
}
