import { PricePretty } from "@keplr-wallet/unit";
import dayjs from "dayjs";
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
    /**
     * By default it's set to 5 minute for 1H range
     */
    let tf: TimeFrame = 5;

    switch (this._historicalRange) {
      /**
       * For 1D, 7D and 1M ranges, we'll use a timeframe of 1 hour
       */
      case "1d":
      case "7d":
      case "1mo":
        tf = 60;
        break;
      /**
       * For 1Y range we'll use a timeframe of 1 day
       */
      case "1y":
        tf = 1440;
        break;
      case "all":
        tf = 10080;
        break;
    }

    return this.queriesExternalStore.queryTokenHistoricalChart.get(
      this.denom,
      tf
    );
  }

  @computed
  get historicalChartData(): TokenHistoricalPrice[] {
    if (this._historicalRange === "all") {
      return this.queryTokenHistoricalChart.getRawChartPrices;
    }

    let min = dayjs(new Date());
    const max = dayjs(Date.now());
    const maxTime = max.unix() * 1000;

    /**
     * We set the range of data to be displayed by type
     */
    switch (this._historicalRange) {
      case "1h":
        min = min.subtract(1, "hour");
        break;
      case "1d":
        min = min.subtract(1, "day");
        break;
      case "7d":
        min = min.subtract(1, "week");
        break;
      case "1mo":
        min = min.subtract(1, "month");
        break;
      case "1y":
        min = min.subtract(1, "year");
        break;
    }

    const minTime = min.unix() * 1000;

    return this.queryTokenHistoricalChart.getRawChartPrices.filter(
      (price) => price.time <= maxTime && price.time >= minTime
    );
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
