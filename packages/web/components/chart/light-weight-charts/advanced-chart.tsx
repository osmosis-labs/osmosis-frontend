import { useEffect, useEffectEvent, useRef, useState } from "react";

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

  // The live widget and the symbol it shows.
  const widgetRef = useRef<IChartingLibraryWidget | null>(null);
  const symbolRef = useRef<string | null>(null);

  // Reads the latest props without re-creating the widget when they change.
  const createWidget = useEffectEvent((container: HTMLDivElement) => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.coinDenom,
      datafeed: props.datafeed!,
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

    const widget = new TradingView.widget(widgetOptions);
    widgetRef.current = widget;
    symbolRef.current = props.coinDenom;
    widget.onChartReady(() => setIsReady(true));
    return widget;
  });

  // A new denom is switched on the existing chart. Rebuilding the widget
  // instead blanks the chart behind the loading overlay until it is ready.
  useEffect(() => {
    if (!isReady || symbolRef.current === props.coinDenom) return;
    widgetRef.current?.activeChart().setSymbol(props.coinDenom);
    symbolRef.current = props.coinDenom;
  }, [isReady, props.coinDenom]);

  const isFeatureFlagsInitialized = featureFlags._isInitialized;
  useEffect(() => {
    if (!container || !isFeatureFlagsInitialized) return;

    let widget: { remove: () => void } | undefined;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const tryInit = () => {
      if (widget) return true;
      // The TradingView script may not have loaded yet; wait for it.
      if (typeof window === "undefined" || !(window as any).TradingView) {
        return false;
      }
      widget = createWidget(container);
      return true;
    };

    if (!tryInit()) {
      intervalId = setInterval(() => {
        if (tryInit() && intervalId) clearInterval(intervalId);
      }, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      widget?.remove();
      widgetRef.current = null;
      symbolRef.current = null;
      setIsReady(false);
    };
  }, [container, isFeatureFlagsInitialized]);

  return (
    <div className="relative h-full w-full">
      {/* TradingView owns this div, no React children inside it */}
      <div className="h-full w-full" ref={setContainer} />
      {!isReady && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-osmoverse-1000" />
      )}
    </div>
  );
};
