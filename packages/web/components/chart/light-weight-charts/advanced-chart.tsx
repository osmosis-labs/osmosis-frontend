import { useEffect, useRef } from "react";

import { UDFCompatibleDatafeed } from "~/public/datafeeds/udf";
import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
  widget,
} from "~/public/tradingview";
import { theme } from "~/tailwind.config";

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

export const AdvancedChart = (props: Partial<ChartingLibraryWidgetOptions>) => {
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: new UDFCompatibleDatafeed(
        "https://demo_feed.tradingview.com",
        undefined,
        {
          maxResponseLength: 1000,
          expectedOrder: "latestFirst",
        }
      ),
      interval: props.interval as ResolutionString,
      container: chartContainerRef.current,
      library_path: "/tradingview/",
      locale: "en",
      enabled_features: ["use_localstorage_for_settings"],
      fullscreen: props.fullscreen,
      autosize: true,
      ...themeOptions,
    };

    // @ts-ignore
    const tvWidget = (window.tvWidget = new widget(widgetOptions));

    console.log(widgetOptions);

    return () => {
      tvWidget.remove();
    };
  }, [props]);

  return <div className="relative h-full" ref={chartContainerRef} />;
};
