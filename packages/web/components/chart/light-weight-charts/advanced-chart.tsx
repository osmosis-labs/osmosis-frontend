import { useEffect, useRef, useState } from "react";

import {
  ChartingLibraryWidgetOptions,
  DatafeedConfiguration,
  ErrorCallback,
  HistoryCallback,
  IBasicDataFeed,
  IChartingLibraryWidget,
  LibrarySymbolInfo,
  OnReadyCallback,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  Timezone,
  widget,
} from "~/public/tradingview";
import { theme } from "~/tailwind.config";
import { trpcHelpers } from "~/utils/helpers";

const themeOptions: Partial<ChartingLibraryWidgetOptions> = {
  theme: "dark",
  overrides: {
    "paneProperties.background": theme.colors.bullish[600],
    /* 'paneProperties.horzGridProperties.color': theme.layer3,
		'paneProperties.vertGridProperties.color': theme.layer3, */
    "paneProperties.crossHairProperties.style": 1,
    "paneProperties.legendProperties.showBarChange": false,
    "paneProperties.backgroundType": "solid",

    "mainSeriesProperties.style": 1,
    "mainSeriesProperties.candleStyle.upColor": theme.colors.bullish[400],
    "mainSeriesProperties.candleStyle.borderUpColor": theme.colors.bullish[400],
    "mainSeriesProperties.candleStyle.wickUpColor": theme.colors.bullish[400],
    "mainSeriesProperties.candleStyle.downColor": theme.colors.osmoverse[500],
    "mainSeriesProperties.candleStyle.borderDownColor":
      theme.colors.osmoverse[500],
    "mainSeriesProperties.candleStyle.wickDownColor":
      theme.colors.osmoverse[500],
    "mainSeriesProperties.statusViewStyle.symbolTextSource": "ticker",

    "scalesProperties.textColor": theme.colors.white.full,
    /* 'scalesProperties.backgroundColor': theme.layer2,
		'scalesProperties.lineColor': theme.layer3, */
  },
  studies_overrides: {
    "volume.volume.color.0": theme.colors.osmoverse[500],
    "volume.volume.color.1": theme.colors.bullish[400],
    "volume.volume ma.visible": false,
    /* 'relative strength index.plot.color': theme.accent, */
    "relative strength index.plot.linewidth": 1.5,
    "relative strength index.hlines background.color": "#134A9F",
  },
  loading_screen: {
    backgroundColor: theme.colors.osmoverse[900],
    foregroundColor: theme.colors.osmoverse[900],
  },
};

const configurationData: DatafeedConfiguration = {
  supported_resolutions: ["60", "1D", "1W", "1M", "12M"] as ResolutionString[],
  exchanges: [
    {
      value: "dYdX", // `exchange` argument for the `searchSymbols` method, if a user selects this exchange
      name: "dYdX", // filter name
      desc: "dYdX v4 exchange", // full exchange name displayed in the filter popup
    },
  ],
  symbols_types: [
    {
      name: "crypto",
      value: "crypto", // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
    },
  ],
};

const getHistoricalDatafeed = (): IBasicDataFeed => ({
  onReady(callback: OnReadyCallback) {
    setTimeout(() => callback(configurationData), 0);
  },
  searchSymbols: (
    _: string,
    __: string,
    ___: string,
    onResult: SearchSymbolsCallback
  ) => {
    onResult([]);
  },
  resolveSymbol: async (
    denom: string,
    onResult: ResolveCallback,
    onError: ErrorCallback
  ) => {
    try {
      const asset = await trpcHelpers.edge.assets.getUserAsset.fetch({
        findMinDenomOrSymbol: denom,
      });

      const pricescale = 10 ** asset.coinDecimals;

      const symbolInfo: LibrarySymbolInfo = {
        ticker: asset.coinName,
        name: asset.coinDenom,
        description: asset.coinName,
        type: "crypto",
        exchange: "Osmosis",
        listed_exchange: "Osmosis",
        has_intraday: true,
        has_daily: true,
        minmov: 1,
        pricescale,
        session: "24x7",
        /* intraday_multipliers: ["5", "60", "720", "1440", "1440"], */
        supported_resolutions: configurationData.supported_resolutions!,
        data_status: "endofday",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone,
        format: "price",
      };

      setTimeout(() => onResult(symbolInfo), 0);
    } catch (error) {
      setTimeout(() => onError((error as Error).message), 0);
    }
  },

  getBars: async (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: {
      countBack: number;
      from: number;
      to: number;
      firstDataRequest: boolean;
    },
    onResult: HistoryCallback,
    onError: ErrorCallback
  ) => {
    try {
      if (!symbolInfo) return;

      const { countBack, firstDataRequest } = periodParams;

      const customTimeFrame = {
        timeFrame: 5,
      };

      switch (resolution) {
        case "60":
          customTimeFrame.timeFrame = 5;
          break;
        case "1D":
          customTimeFrame.timeFrame = 60;
          break;
        case "1W":
          customTimeFrame.timeFrame = 720;
          break;
        case "1M":
          customTimeFrame.timeFrame = 1440;
          break;
        case "12M":
          customTimeFrame.timeFrame = 1440;
          break;
      }

      const bars = await trpcHelpers.edge.assets.getAssetHistoricalPrice.fetch({
        coinDenom: symbolInfo.name,
        timeFrame: {
          custom: customTimeFrame,
        },
      });

      if (bars.length === 0 || bars.length < countBack) {
        onResult([], {
          noData: true,
        });

        return;
      }

      if (firstDataRequest) {
        onResult(
          bars.map((bar) => ({
            ...bar,
            time: bar.time * 1000,
          })),
          {
            noData: false,
          }
        );
      }
    } catch (error) {
      onError((error as Error).message);
    }
  },

  subscribeBars() {},

  unsubscribeBars: () => {},
});

type AdvancedChartProps = Omit<
  Partial<ChartingLibraryWidgetOptions>,
  "symbol"
> & {
  coinDenom: string;
};

export const AdvancedChart = (props: AdvancedChartProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const chart = useRef<IChartingLibraryWidget>();

  if (container && chart.current === undefined) {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.coinDenom,
      datafeed: getHistoricalDatafeed(),
      interval: "1d" as ResolutionString,
      container,
      library_path: "/tradingview/",
      locale: "en",
      debug: true,
      disabled_features: [
        "header_symbol_search",
        "header_compare",
        "symbol_search_hot_key",
        "symbol_info",
        "go_to_date",
        "timeframes_toolbar",
        "header_quick_search",
        "header_symbol_search",
        "symbol_search_hot_key",
        "compare_symbol_search_spread_operators",
        "studies_symbol_search_spread_operators",
      ],
      enabled_features: [
        "remove_library_container_border",
        "hide_last_na_study_output",
        "dont_show_boolean_study_arguments",
        "hide_left_toolbar_by_default",
      ],
      autosize: true,
      ...themeOptions,
      ...props,
    };

    chart.current = new widget(widgetOptions);
  }

  useEffect(() => {
    return () => {
      chart.current?.remove();
      chart.current = undefined;
    };
  }, []);

  return <div className="relative h-full" ref={setContainer} />;
};
