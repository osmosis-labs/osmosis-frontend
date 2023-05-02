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
  // calcualteLiquidityForY,
  minSpotPrice,
  priceToTick,
  roundPriceToNearestTick,
} from "@osmosis-labs/math";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { action, makeObservable, observable } from "mobx";

import {
  PriceRange,
  TokenPairHistoricalPrice,
} from "../../queries-external/token-pair-historical-chart/types";

/** Use to config user input UI for eventually sending a valid add concentrated liquidity msg.
 */
export class ObservableAddConcentratedLiquidityConfig extends TxChainSetter {
  @observable
  protected _poolId: string;

  @observable
  protected _sender: string;

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
  /*
   Used to get base and quote asset deposit for adding concentrated liquidity
   */
  @observable
  protected _baseDepositAmountIn: Dec = new Dec(0);

  @observable
  protected _quoteDepositAmountIn: Dec = new Dec(0);

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    poolId: string,
    sender: string,
    protected readonly queriesStore: IQueriesStore,
    protected readonly queryBalances: ObservableQueryBalances,
    protected readonly pool: ConcentratedLiquidityPool
  ) {
    super(chainGetter, initialChainId);

    this._poolId = poolId;
    this._sender = sender;

    makeObservable(this);
  }

  get poolId(): string {
    return this._poolId;
  }

  @action
  setPoolId(poolId: string) {
    this._poolId = poolId;
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
      roundPriceToNearestTick(
        typeof min === "number" ? new Dec(min) : min,
        this.pool.exponentAtPriceOne
      ),
      this._range[1],
    ];
  };

  @action
  setMaxRange = (max: Dec | number) => {
    this._range = [
      this._range[0],
      roundPriceToNearestTick(
        typeof max === "number" ? new Dec(max) : max,
        this.pool.exponentAtPriceOne
      ),
    ];
  };

  get range(): [Dec, Dec] {
    return this._range;
  }

  get tickRange(): [Int, Int] {
    return [
      priceToTick(this._range[0], this.pool.exponentAtPriceOne),
      priceToTick(this._range[1], this.pool.exponentAtPriceOne),
    ];
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

  get depthChartData(): { price: number; depth: number }[] {
    const data = this.activeLiquidity;
    const [min, max] = this.yRange;
    const exponentAtPriceOne = this.pool.exponentAtPriceOne;

    const depths: { price: number; depth: number }[] = [];
    for (let price = min; price <= max; price += (max - min) / 20) {
      const spotPrice = Math.min(
        Math.max(Number(minSpotPrice.toString()), price),
        Number(maxSpotPrice.toString())
      );
      depths.push({
        price,
        depth: getLiqFrom(
          priceToTick(new Dec(spotPrice), exponentAtPriceOne),
          data
        ),
      });
    }

    return depths;
  }

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
