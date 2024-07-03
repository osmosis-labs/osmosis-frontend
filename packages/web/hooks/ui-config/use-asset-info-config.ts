import { PricePretty } from "@keplr-wallet/unit";
import {
  DEFAULT_VS_CURRENCY,
  type TokenHistoricalPrice,
} from "@osmosis-labs/server";
import dayjs from "dayjs";
import { Time } from "lightweight-charts";
import { action, computed, makeObservable, observable } from "mobx";
import { useEffect, useMemo } from "react";

import { timepointToString } from "~/components/chart/light-weight-charts/utils";
import { api } from "~/utils/trpc";

export const useAssetInfoConfig = (
  denom: string,
  coinMinimalDenom?: string,
  coingeckoId?: string
) => {
  const config = useMemo(
    () => new ObservableAssetInfoConfig(denom, coinMinimalDenom),
    [denom, coinMinimalDenom]
  );

  useEffect(
    () => () => {
      if (process.env.NODE_ENV === "production") {
        config.dispose();
      }
    },
    [config]
  );

  const customTimeFrame = useMemo(() => {
    let frame = 60;
    let numRecentFrames: number | undefined = undefined;

    switch (config.historicalRange) {
      case "1h":
        frame = 5;
        numRecentFrames = 14;
        break;
      case "1d":
        frame = 15;
        numRecentFrames = 97;
        break;
      case "7d":
        frame = 720;
        numRecentFrames = 15;
        break;
      case "1mo":
        frame = 1440;
        numRecentFrames = 30;
        break;
      case "1y":
        frame = 10080;
        numRecentFrames = 54;
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
      coinDenom: coinMinimalDenom ?? denom,
      timeFrame: {
        custom: customTimeFrame,
      },
    },
    {
      enabled: Boolean(coinMinimalDenom ?? denom),
      staleTime: 1000 * 60 * 3, // 3 minutes
      cacheTime: 1000 * 60 * 6, // 6 minutes
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

  const enableCoinGecko =
    Boolean(coingeckoId) &&
    coingeckoId !== undefined &&
    historicalPriceData !== undefined &&
    historicalPriceData.length === 0 &&
    !isLoading;

  const {
    data: coingeckoHistoricalPriceData,
    isLoading: isLoadingCoingecko,
    isError: isErrorCoingecko,
  } = api.edge.assets.getCoingeckoAssetHistoricalPrice.useQuery(
    {
      /**
       * We need to add a fallback but just to avoid ts errors,
       * using `enabled` prop we make sure that we do not trigger
       * the query if the id is undefined
       */
      id: coingeckoId ?? "",
      timeFrame: config.historicalRange,
    },
    {
      select(data) {
        const historicalData = data?.prices.map(([timestamp, price]) => ({
          time: timestamp / 1000,
          close: price,
          high: price,
          low: price,
          open: price,
          volume: 0,
        }));

        if (config.historicalRange === "all") {
          return historicalData;
        }

        let min = dayjs(new Date());
        const max = dayjs(Date.now());
        const maxTime = max.unix();

        switch (config.historicalRange) {
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

        const minTime = min.unix();

        return historicalData?.filter(
          (price) => price.time <= maxTime && price.time >= minTime
        );
      },
      enabled: enableCoinGecko,
      staleTime: 1000 * 60 * 3, // 3 minutes
      cacheTime: 1000 * 60 * 6, // 6 minutes
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  if (enableCoinGecko) {
    if (coingeckoHistoricalPriceData)
      config.setHistoricalData(coingeckoHistoricalPriceData);
    config.setIsHistoricalDataLoading(isLoadingCoingecko);
    config.setHistoricalDataError(isErrorCoingecko);
  }

  return config;
};

export const AvailablePriceRanges = {
  "1h": "1h",
  "1d": "1d",
  "7d": "7d",
  "1mo": "1mo",
  "1y": "1y",
  all: "all",
} as const;

export type PriceRange =
  (typeof AvailablePriceRanges)[keyof typeof AvailablePriceRanges];

export const AssetChartAvailableDataTypes = ["price", "volume"] as const;

export type AssetChartDataType = (typeof AssetChartAvailableDataTypes)[number];

export const AssetChartModes = {
  advanced: "advanced",
  simple: "simple",
} as const;

export type AssetChartMode =
  (typeof AssetChartModes)[keyof typeof AssetChartModes];

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
  protected _dataType: AssetChartDataType = "price";

  @observable
  protected _mode: AssetChartMode = "simple";

  @observable
  protected _zoom: number = INITIAL_ZOOM;

  @observable
  protected _hoverData?: number = undefined;

  @observable
  protected _hoverDate?: Time = undefined;

  @observable
  protected _historicalData: TokenHistoricalPrice[] = [];

  @observable
  protected _historicalDataError: boolean = false;

  @observable
  protected _isHistoricalDataLoading: boolean = false;

  protected _disposers: (() => void)[] = [];

  denom: string;

  coinMinimalDenom?: string;

  @action
  readonly setHistoricalData = (data: TokenHistoricalPrice[]) => {
    this._historicalData = data;
  };

  @computed
  get historicalChartData() {
    const currentTime = new Date().getTime();

    return this._historicalData.filter(
      (data) => data.time * 1000 <= currentTime
    );
  }

  @computed
  get historicalChartUnavailable(): boolean {
    return (
      this._historicalDataError ||
      (!this.isHistoricalDataLoading && this.historicalChartData.length === 0)
    );
  }

  @computed
  get isHistoricalDataLoading(): boolean {
    return this._isHistoricalDataLoading;
  }

  @computed
  get hoverData(): PricePretty | undefined {
    const fiat = DEFAULT_VS_CURRENCY;

    if (!fiat || this._hoverData === undefined) {
      return undefined;
    }

    return new PricePretty(fiat, this._hoverData);
  }

  @computed
  get hoverDate(): string | null {
    if (!this._hoverDate) {
      return null;
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    return timepointToString(this._hoverDate, formatOptions, "en-US");
  }

  @computed
  get lastChartData(): ChartTick | undefined {
    const data: ChartTick[] = [...this.historicalChartData];

    return data.pop();
  }

  @computed
  get historicalRange(): PriceRange {
    return this._historicalRange;
  }

  @computed
  get dataType(): AssetChartDataType {
    return this._dataType;
  }

  @computed
  get mode(): AssetChartMode {
    return this._mode;
  }

  constructor(denom: string, coinMinimalDenom?: string) {
    makeObservable(this);

    this.denom = denom;
    this.coinMinimalDenom = coinMinimalDenom;
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
  readonly setHoverData = (data?: number, time?: Time) => {
    this._hoverData = data;
    this._hoverDate = time;
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

  @action
  setDataType = (data: AssetChartDataType) => {
    this._dataType = data;
  };

  @action
  setMode = (mode: AssetChartMode) => {
    this._mode = mode;
  };

  dispose() {
    this._disposers.forEach((dispose) => dispose());
  }
}
