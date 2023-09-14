import { PricePretty } from "@keplr-wallet/unit";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { TokenHistoricalPrice } from "src/queries-external/token-historical-chart/types";

import { IPriceStore } from "../price";
import {
  PriceRange,
  QueriesExternalStore,
  TimeFrame,
} from "../queries-external";

const INITIAL_ZOOM = 1.05;
const ZOOM_STEP = 0.05;

export class ObservableAssetInfoConfig {
  denom: string;

  @observable
  protected _historicalRange: PriceRange = "7d";

  @observable
  protected _zoom: number = INITIAL_ZOOM;

  @observable
  protected _hoverPrice: number = 0;

  protected _disposers: (() => void)[] = [];

  @computed
  protected get queryTokenHistoricalChart() {
    let tf: TimeFrame = 60;

    if (this._historicalRange === "7d") {
      tf = 10080;
    } else if (this._historicalRange === "1mo") {
      tf = 43800;
    }

    return this.queriesExternalStore.queryTokenHistoricalChart.get(
      this.denom,
      tf
    );
  }

  @computed
  get historicalChartData(): TokenHistoricalPrice[] {
    return this.queryTokenHistoricalChart.getRawChartPrices;
  }

  @computed
  get isHistoricalChartUnavailable(): boolean {
    return (
      !this.isHistoricalChartLoading && this.historicalChartData.length === 0
    );
  }

  @computed
  get isHistoricalChartLoading(): boolean {
    return this.queryTokenHistoricalChart.isFetching;
  }

  @computed
  get yRange(): [number, number] {
    const prices = this.historicalChartData?.map(({ close }) => close) || [];
    const zoom = this._zoom;
    const padding = 0.1;

    const chartMin = Math.max(0, Math.min(...prices));
    const chartMax = Math.max(...prices);

    const delta = Math.abs(chartMax - chartMin);

    const minWithPadding = Math.max(0, chartMin - delta * padding);
    const maxWithPadding = chartMax + delta * padding;

    const zoomAdjustedMin = zoom > 1 ? chartMin / zoom : chartMin * zoom;
    const zoomAdjustedMax = chartMax * zoom;

    const finalMin = Math.min(minWithPadding, zoomAdjustedMin);
    const finalMax = Math.max(maxWithPadding, zoomAdjustedMax);

    return [finalMin, finalMax];
  }

  @computed
  get hoverPrice(): PricePretty | undefined {
    const fiat = this.priceStore.getFiatCurrency("usd");
    if (!fiat) {
      return undefined;
    }
    return new PricePretty(fiat, this._hoverPrice);
  }

  @computed
  get lastChartPrice(): TokenHistoricalPrice | undefined {
    return this.historicalChartData[this.historicalChartData.length - 1];
  }

  get historicalRange(): PriceRange {
    return this._historicalRange;
  }

  constructor(
    denom: string,
    private readonly queriesExternalStore: QueriesExternalStore,
    private readonly priceStore: IPriceStore
  ) {
    this.denom = denom;
    makeObservable(this);

    // Init last hover price to current price in pool once loaded
    this._disposers.push(
      autorun(() => {
        if (this.lastChartPrice) this.setHoverPrice(this.lastChartPrice.close);
      })
    );
  }

  @action
  readonly setHoverPrice = (price: number) => {
    this._hoverPrice = price;
  };

  @action
  readonly setZoom = (zoom: number) => {
    this._zoom = zoom;
  };

  @action
  readonly resetZoom = () => {
    this._zoom = INITIAL_ZOOM;
  };

  @action
  readonly zoomIn = () => {
    this._zoom = Math.max(1, this._zoom - ZOOM_STEP);
  };

  @action
  readonly zoomOut = () => {
    this._zoom = this._zoom + ZOOM_STEP;
  };

  @action
  setHistoricalRange = (range: PriceRange) => {
    this._historicalRange = range;
  };

  dispose() {
    this._disposers.forEach((dispose) => dispose());
  }
}
