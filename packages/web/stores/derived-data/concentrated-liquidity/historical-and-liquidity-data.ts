import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { Dec, Int } from "@keplr-wallet/unit";
import {
  ActiveLiquidityPerTickRange,
  maxSpotPrice,
  minSpotPrice,
  priceToTick,
} from "@osmosis-labs/math";
import {
  ObservableQueryLiquidityPerTickRange,
  ObservableQueryTokensPairHistoricalChart,
  OsmosisQueries,
  PriceRange,
  TokenPairHistoricalPrice,
} from "@osmosis-labs/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { DeepReadonly } from "utility-types";

export class ObservableHistoricalAndLiquidityData {
  /*
   Used to get historical range for price chart
  */
  @observable
  protected _historicalRange: PriceRange = "7d";

  @observable
  protected _zoom: number = 1;

  @observable
  protected _hoverPrice: number = 0;

  @observable
  protected _priceRange: [Dec, Dec] | null = null;

  constructor(
    protected readonly chainGetter: ChainGetter,
    readonly chainId: string,
    readonly poolId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly queryRange: DeepReadonly<ObservableQueryLiquidityPerTickRange>,
    protected readonly queryTokenPairHistoricalPrice: DeepReadonly<ObservableQueryTokensPairHistoricalChart>
  ) {
    makeObservable(this);
  }

  @computed
  protected get queries() {
    const osmosisQueries = this.queriesStore.get(this.chainId).osmosis;
    if (!osmosisQueries) throw Error("Did not supply Osmosis chain ID");
    return osmosisQueries;
  }

  @computed
  get pool() {
    return this.queries.queryPools.getPool(this.poolId);
  }

  @computed
  get historicalChartUnavailable(): boolean {
    return (
      !this.queryTokenPairPrice.isFetching &&
      this.historicalChartData.length === 0
    );
  }

  get baseDenom(): string {
    return this.pool?.poolAssetDenoms
      ? this.chainGetter
          .getChain(this.chainId)
          .forceFindCurrency(this.pool.poolAssetDenoms[0]).coinDenom
      : "";
  }

  get quoteDenom(): string {
    return this.pool?.poolAssetDenoms
      ? this.chainGetter
          .getChain(this.chainId)
          .forceFindCurrency(this.pool.poolAssetDenoms[1]).coinDenom
      : "";
  }

  get baseCurrency(): AppCurrency | undefined {
    const baseDenom = this.pool?.poolAssetDenoms[0];

    if (!baseDenom) return undefined;

    return this.chainGetter.getChain(this.chainId).findCurrency(baseDenom);
  }

  get quoteCurrency(): AppCurrency | undefined {
    return this.chainGetter
      .getChain(this.chainId)
      .findCurrency(this.quoteDenom);
  }

  @computed
  get lastChartData(): TokenPairHistoricalPrice | null {
    return (
      this.historicalChartData[this.historicalChartData.length - 1] || null
    );
  }

  @action
  setHistoricalRange = (range: PriceRange) => {
    this._historicalRange = range;
  };

  get historicalRange(): PriceRange {
    return this._historicalRange;
  }

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
  get priceDecimal(): number {
    if (!this.lastChartData) return 2;
    if (this.lastChartData.close <= 0.001) return 5;
    if (this.lastChartData.close <= 0.01) return 4;
    if (this.lastChartData.close <= 0.1) return 3;
    return 2;
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

  @action
  readonly setPriceRange = (range: [Dec, Dec]) => {
    this._priceRange = range;
  };

  @computed
  get historicalChartData(): TokenPairHistoricalPrice[] {
    return this.queryTokenPairPrice.getChartPrices;
  }

  @computed
  get queryTokenPairPrice() {
    return this.queryTokenPairHistoricalPrice.get(
      this.poolId,
      this.historicalRange,
      this.baseDenom,
      this.quoteDenom
    );
  }

  get range(): [Dec, Dec] | null {
    return this._priceRange;
  }

  @computed
  get yRange(): [number, number] {
    const data = this.historicalChartData.map(({ time, close }) => ({
      time,
      price: close,
    }));
    const zoom = this.zoom;
    const padding = 0.1;

    const prices = data.map((d) => d.price);

    const chartMin = Math.max(0, Math.min(...prices));
    const chartMax = Math.max(...prices);

    const absMax = this.range
      ? Math.max(Number(this.range[1].toString()), chartMax)
      : chartMax;
    const absMin = this.range
      ? Math.min(Number(this.range[0].toString()), chartMin)
      : chartMin;

    const delta = Math.abs(absMax - absMin);

    const minWithPadding = Math.max(0, absMin - delta * padding);
    const maxWithPadding = absMax + delta * padding;

    const zoomAdjustedMin = zoom > 1 ? absMin / zoom : absMin * zoom;
    const zoomAdjustedMax = absMax * zoom;

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
}

function getLiqFrom(target: Int, list: ActiveLiquidityPerTickRange[]): number {
  for (let i = 0; i < list.length; i++) {
    if (list[i].lowerTick.lte(target) && list[i].upperTick.gte(target)) {
      return Number(list[i].liquidityAmount.toString());
    }
  }
  return 0;
}
