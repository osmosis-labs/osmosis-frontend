import { PricePretty } from "@keplr-wallet/unit";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { useMemo } from "react";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import type { TokenHistoricalPrice } from "~/server/queries/imperator";
import { api } from "~/utils/trpc";

export const useAssetInfoConfig = (
  denom: string,
  queryDenom: string | null
) => {
  const config = useMemo(() => new ObservableAssetInfoConfig(), []);

  const customTimeFrame = useMemo(() => {
    let frame = 60;
    let numRecentFrames: number | undefined = undefined;

    switch (config.historicalRange) {
      case "1h":
        frame = 5;
        numRecentFrames = 12;
        break;
      case "1d":
        frame = 5;
        numRecentFrames = 288;
        break;
      case "7d":
        frame = 120;
        numRecentFrames = 168;
        break;
      case "1mo":
        frame = 1440;
        numRecentFrames = 30;
        break;
      case "1y":
        frame = 1440;
        numRecentFrames = 365;
        break;
      case "all":
        frame = 43800;
        break;
    }

    return {
      timeFrame: frame,
      numRecentFrames,
    };
  }, [config.historicalRange]);

  const {
    data: historicalPriceData,
    isLoading,
    isError,
  } = api.edge.assets.getAssetHistoricalPrice.useQuery(
    {
      coinDenom: denom ?? queryDenom,
      timeFrame: {
        custom: customTimeFrame,
      },
    },
    {
      enabled: Boolean(denom ?? queryDenom),
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  if (historicalPriceData) config.setHistoricalData(historicalPriceData);
  config.setIsHistoricalDataLoading(isLoading);
  config.setHistoricalDataError(isError);

  return config;
};

export const AvailablePriceRanges = [
  "1h",
  "1d",
  "7d",
  "1mo",
  "1y",
  "all",
] as const;

export type PriceRange = (typeof AvailablePriceRanges)[number];

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

  @observable
  protected _historicalData: TokenHistoricalPrice[] = [];

  @observable
  protected _historicalDataError: boolean = false;

  @observable
  protected _isHistoricalDataLoading: boolean = false;

  protected _disposers: (() => void)[] = [];

  @action
  readonly setHistoricalData = (data: TokenHistoricalPrice[]) => {
    this._historicalData = data;
  };

  @computed
  get historicalChartData() {
    return this._historicalData.map((data) => ({
      ...data,
      time: data.time * 1000,
    }));
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
  get historicalChartUnavailable(): boolean {
    return this._historicalDataError;
  }

  @computed
  get isHistoricalDataLoading(): boolean {
    return this._isHistoricalDataLoading;
  }

  @computed
  get hoverPrice(): PricePretty | undefined {
    const fiat = DEFAULT_VS_CURRENCY;
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

  constructor() {
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
  readonly setHistoricalDataError = (error: boolean) => {
    this._historicalDataError = error;
  };

  @action
  readonly setIsHistoricalDataLoading = (isLoading: boolean) => {
    this._isHistoricalDataLoading = isLoading;
  };

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
