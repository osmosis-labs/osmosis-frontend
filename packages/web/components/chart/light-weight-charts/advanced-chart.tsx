import { useEffect, useRef, useState } from "react";

import { useFeatureFlags } from "~/hooks";
import type {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
} from "~/public/tradingview";
import { theme } from "~/tailwind.config";

type AdvancedChartProps = Omit<
  Partial<ChartingLibraryWidgetOptions>,
  "symbol"
> & {
  coinDenom: string;
};

export const AdvancedChart = (props: AdvancedChartProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const chart = useRef<IChartingLibraryWidget>();

  const featureFlags = useFeatureFlags();
  const themeOptions: Partial<ChartingLibraryWidgetOptions> = {
    theme: "dark",
    overrides: {
      "paneProperties.background":
        theme.colors.osmoverse[featureFlags.limitOrders ? 1000 : 900],
      "paneProperties.horzGridProperties.color":
        theme.colors.osmoverse[featureFlags.limitOrders ? 1000 : 900],
      "paneProperties.vertGridProperties.color":
        theme.colors.osmoverse[featureFlags.limitOrders ? 1000 : 900],
      "linetoolarc.backgroundColor": theme.colors.osmoverse[850],
      "linetoolnote.backgroundColor": theme.colors.osmoverse[850],
      "linetooltext.backgroundColor": theme.colors.osmoverse[850],
      "linetoolbrush.backgroundColor": theme.colors.osmoverse[850],
      "paneProperties.crossHairProperties.style": 1,
      "paneProperties.legendProperties.showBarChange": false,
      "paneProperties.backgroundType": "solid",

      "mainSeriesProperties.style": 1,
      "mainSeriesProperties.candleStyle.upColor": theme.colors.bullish[400],
      "mainSeriesProperties.candleStyle.borderUpColor":
        theme.colors.bullish[400],
      "mainSeriesProperties.candleStyle.wickUpColor": theme.colors.bullish[400],
      "mainSeriesProperties.statusViewStyle.symbolTextSource": "ticker",

      "scalesProperties.textColor": theme.colors.white.full,
      "scalesProperties.backgroundColor":
        theme.colors.osmoverse[featureFlags.limitOrders ? 1000 : 900],
      "scalesProperties.lineColor":
        theme.colors.osmoverse[featureFlags.limitOrders ? 1000 : 900],
    },
    studies_overrides: {
      "volume.volume.color.1": theme.colors.bullish[400],
      "volume.volume ma.visible": false,
    },

    loading_screen: {
      backgroundColor:
        theme.colors.osmoverse[featureFlags.limitOrders ? 1000 : 900],
      foregroundColor:
        theme.colors.osmoverse[featureFlags.limitOrders ? 1000 : 900],
    },
  };

  if (container && chart.current === undefined && featureFlags._isInitialized) {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.coinDenom,
      datafeed: props.datafeed!,
      interval: "1d" as ResolutionString,
      container,
      library_path: "/tradingview/",
      custom_css_url: featureFlags.limitOrders
        ? "/tradingview/custom-limit.css"
        : "/tradingview/custom.css",
      custom_font_family: '"Inter", sans-serif',
      locale: "en",
      disabled_features: [
        "header_symbol_search",
        "header_compare",
        "symbol_search_hot_key",
        "symbol_info",
        "go_to_date",
        "header_quick_search",
        "header_symbol_search",
        "symbol_search_hot_key",
        "compare_symbol_search_spread_operators",
        "studies_symbol_search_spread_operators",
        "use_localstorage_for_settings",
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

    chart.current = new TradingView.widget(widgetOptions);
  }

  useEffect(() => {
    return () => {
      chart.current?.remove();
      chart.current = undefined;
    };
  }, []);

  return <div className="relative h-full" ref={setContainer} />;
};
