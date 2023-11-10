import { PricePretty } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import { action, autorun, computed, makeObservable, observable } from "mobx";

import { IPriceStore } from "../price";
import {
  PriceRange,
  QueriesExternalStore,
  TimeFrame,
} from "../queries-external";

const INITIAL_ZOOM = 1.05;
const ZOOM_STEP = 0.05;

export interface ChartTick {
  time: number;
  close: number;
}

export class ObservableAssetInfoConfig {
  @observable
  protected _historicalRange: PriceRange = "7d";

  @observable
  protected _zoom: number = INITIAL_ZOOM;

  @observable
  protected _hoverPrice: number = 0;

  protected _disposers: (() => void)[] = [];

  @computed
  protected get queryTokenHistoricalChart() {
    if (this.queryDenom || !this.coingeckoId) {
      let tf: TimeFrame = 5;

      switch (this._historicalRange) {
        /**
         * For 1D, 7D and 1M ranges, we'll use a timeframe of 1 hour
         */
        case "1d":
        case "7d":
          tf = 60;
          break;
        /**
         * For 1Y and 1M ranges we'll use a timeframe of 1 day
         */
        case "1mo":
        case "1y":
          tf = 1440;
          break;
        case "all":
          tf = 10080;
          break;
      }

      return this.queriesExternalStore.queryTokenHistoricalChart.get(
        this.queryDenom ?? this.denom,
        tf
      );
    }

    let from = dayjs(new Date());
    const to = dayjs(Date.now());

    /**
     * We set the range of data to be displayed by type
     */
    switch (this._historicalRange) {
      case "1h":
        from = from.subtract(1, "hour");
        break;
      case "1d":
        from = from.subtract(1, "day");
        break;
      case "7d":
        from = from.subtract(1, "week");
        break;
      case "1mo":
        from = from.subtract(1, "month");
        break;
      case "1y":
        from = from.subtract(1, "year");
        break;
    }

    return this.queriesExternalStore.queryCoinGeckoMarketChartCoins.get(
      this.coingeckoId,
      this._historicalRange === "all" ? 0 : from.unix(),
      to.unix()
    );
  }

  @computed
  get historicalChartData(): ChartTick[] {
    if (!this.queryTokenHistoricalChart) {
      return [];
    }

    if (this.queryDenom) {
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

    return this.queryTokenHistoricalChart.getRawChartPrices;
  }

  @computed
  get isHistoricalChartUnavailable(): boolean {
    return (
      !this.queryTokenHistoricalChart ||
      (!this.isHistoricalChartLoading && this.historicalChartData.length === 0)
    );
  }

  @computed
  get isHistoricalChartLoading(): boolean {
    if (!this.queryTokenHistoricalChart) {
      return false;
    }

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
  get lastChartPrice(): ChartTick | undefined {
    const prices: ChartTick[] = [...this.historicalChartData];

    return prices.pop();
  }

  get historicalRange(): PriceRange {
    return this._historicalRange;
  }

  constructor(
    public denom: string,
    protected readonly queriesExternalStore: QueriesExternalStore,
    protected readonly priceStore: IPriceStore,
    public queryDenom: string | null,
    public coingeckoId?: string
  ) {
    makeObservable(this);

    // Init last hover price to current price in pool once loaded
    this._disposers.push(
      autorun(() => {
        if (this.lastChartPrice) {
          const { close } = this.lastChartPrice;

          this.setHoverPrice(close);
        }
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
