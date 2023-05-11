import { TxChainSetter } from "@keplr-wallet/hooks";
import {
  ChainGetter,
  IQueriesStore,
  ObservableQueryBalances,
} from "@keplr-wallet/stores";
import { Dec, Int } from "@keplr-wallet/unit";
import {
  ActiveLiquidityPerTickRange,
  maxSpotPrice,
  minSpotPrice,
  priceToTick,
  roundPriceToNearestTick,
} from "@osmosis-labs/math";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { action, computed, makeObservable, observable } from "mobx";

import {
  PriceRange,
  TokenPairHistoricalPrice,
} from "../../queries-external/token-pair-historical-chart/types";

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
  protected _range: [Dec, Dec] = [minSpotPrice, minSpotPrice];

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
  protected _baseDepositAmountIn: Dec = new Dec(0);

  @observable
  protected _quoteDepositAmountIn: Dec = new Dec(0);

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

    makeObservable(this);
  }

  get pool(): ConcentratedLiquidityPool {
    return this._pool;
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
  };

  get historicalRange(): PriceRange {
    return this._historicalRange;
  }

  @action
  setMinRange = (min: Dec | number) => {
    this._range = [
      roundPriceToNearestTick(typeof min === "number" ? new Dec(min) : min),
      this._range[1],
    ];
  };

  @action
  setMaxRange = (max: Dec | number) => {
    this._range = [
      this._range[0],
      roundPriceToNearestTick(typeof max === "number" ? new Dec(max) : max),
    ];
  };

  get range(): [Dec, Dec] {
    return this._range;
  }

  @computed
  get tickRange(): [Int, Int] {
    return [priceToTick(this._range[0]), priceToTick(this._range[1])];
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
    this._baseDepositAmountIn =
      typeof amount === "number" ? new Dec(amount) : amount;
  };

  @action
  setQuoteDepositAmountIn = (amount: Dec | number) => {
    this._quoteDepositAmountIn =
      typeof amount === "number" ? new Dec(amount) : amount;
  };

  get baseDepositAmountIn(): Dec {
    return this._baseDepositAmountIn;
  }

  get quoteDepositAmountIn(): Dec {
    return this._quoteDepositAmountIn;
  }

  get zoom(): number {
    return this._zoom;
  }

  @action
  setZoom = (zoom: number) => {
    this._zoom = zoom;
  };

  @action
  zoomIn = () => {
    this._zoom = Math.max(1, this._zoom - 0.2);
  };

  @action
  zoomOut = () => {
    this._zoom = this._zoom + 0.2;
  };

  get historicalChartData(): TokenPairHistoricalPrice[] {
    return this._historicalChartData;
  }

  get lastChartData(): TokenPairHistoricalPrice | null {
    return (
      this._historicalChartData[this._historicalChartData.length - 1] || null
    );
  }

  get priceDecimal(): number {
    if (!this.lastChartData) return 2;
    if (this.lastChartData.close <= 0.001) return 5;
    if (this.lastChartData.close <= 0.01) return 4;
    if (this.lastChartData.close <= 0.1) return 3;
    return 2;
  }

  @action
  setHistoricalChartData = (historicalData: TokenPairHistoricalPrice[]) => {
    this._historicalChartData = historicalData;
  };

  @action
  setActiveLiquidity = (activeliquidity: ActiveLiquidityPerTickRange[]) => {
    this._activeLiquidity = activeliquidity;
  };

  get activeLiquidity(): ActiveLiquidityPerTickRange[] {
    return this._activeLiquidity;
  }

  @action
  setHoverPrice = (price: number) => {
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
    const delta = Math.abs(chartMax - chartMin);

    const minWithPadding = Math.max(
      0,
      Math.min(chartMin - delta * padding, min - delta * padding)
    );
    const maxWithPadding = Math.max(
      chartMax + delta * padding,
      max + delta * padding
    );

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
    return [0, Math.max(...this.depthChartData.map((d) => d.depth)) * 1.2];
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
