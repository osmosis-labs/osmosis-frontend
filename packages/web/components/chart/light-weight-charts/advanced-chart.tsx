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
  const [isReady, setIsReady] = useState(false);
  const chart = useRef<IChartingLibraryWidget>();

  const featureFlags = useFeatureFlags();
  const themeOptions: Partial<ChartingLibraryWidgetOptions> = {
    theme: "dark",
    overrides: {
      "paneProperties.background": theme.colors.osmoverse[1000],
      "paneProperties.horzGridProperties.color": theme.colors.osmoverse[1000],
      "paneProperties.vertGridProperties.color": theme.colors.osmoverse[1000],
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
      "scalesProperties.backgroundColor": theme.colors.osmoverse[1000],
      "scalesProperties.lineColor": theme.colors.osmoverse[1000],
    },
    studies_overrides: {
      "volume.volume.color.1": theme.colors.bullish[400],
      "volume.volume ma.visible": false,
    },

    loading_screen: {
      backgroundColor: theme.colors.osmoverse[1000],
      foregroundColor: theme.colors.osmoverse[1000],
    },
  };

  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    if (!container || !featureFlags._isInitialized) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const tryInit = () => {
      if (chart.current) return true;
      if (typeof window === "undefined") return false;
      const tv = (window as any).TradingView;
      if (!tv) return false;

      const widgetOptions: ChartingLibraryWidgetOptions = {
        symbol: propsRef.current.coinDenom,
        datafeed: propsRef.current.datafeed!,
        interval: "1d" as ResolutionString,
        container,
        library_path: "/tradingview/",
        custom_css_url: "/tradingview/custom-limit.css",
        custom_font_family: '"Inter", sans-serif',
        locale: "en",
        disabled_features: [
          "header_symbol_search",
          "header_compare",
          "symbol_search_hot_key",
          "symbol_info",
          "go_to_date",
          "header_quick_search",
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
        ...propsRef.current,
      };

      const widget = new tv.widget(widgetOptions);
      chart.current = widget;
      widget.onChartReady(() => setIsReady(true));
      return true;
    };

    if (!tryInit()) {
      // Script not yet loaded — poll until it is (max ~10s)
      intervalId = setInterval(() => {
        if (tryInit() && intervalId) {
          clearInterval(intervalId);
        }
      }, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      chart.current?.remove();
      chart.current = undefined;
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, featureFlags._isInitialized]);

  return (
    <div className="relative h-full w-full">
      {/* TradingView owns this div — no React children inside it */}
      <div className="h-full w-full" ref={setContainer} />
      {!isReady && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-osmoverse-1000" />
      )}
    </div>
  );
};
