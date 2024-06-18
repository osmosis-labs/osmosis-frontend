import {
  ColorType,
  DeepPartial,
  LineStyle,
  MouseEventParams,
  TickMarkType,
  Time,
  TimeChartOptions,
} from "lightweight-charts";
import React, {
  memo,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  priceFormatter,
  timepointToString,
} from "~/components/chart/light-weight-charts/utils";
import { theme } from "~/tailwind.config";

import {
  ChartController,
  ChartControllerParams,
  Series,
} from "./chart-controller";

function resizeSubscribe(callback: (this: Window, ev: UIEvent) => unknown) {
  window.addEventListener("resize", callback);

  return () => {
    window.removeEventListener("resize", callback);
  };
}

export const defaultOptions: DeepPartial<TimeChartOptions> = {
  layout: {
    fontFamily: theme.fontFamily.subtitle1.join(","),
    background: {
      type: ColorType.Solid,
      color: "transparent",
    },
    textColor: theme.colors.osmoverse[500],
    fontSize: 14,
  },
  grid: { horzLines: { visible: false }, vertLines: { visible: false } },
  rightPriceScale: {
    autoScale: true,
    borderVisible: false,
    ticksVisible: false,
    entireTextOnly: true,
    scaleMargins: {
      top: 0.25,
      bottom: 0.1,
    },
  },
  leftPriceScale: {
    autoScale: true,
    borderVisible: false,
    ticksVisible: false,
    entireTextOnly: true,
    scaleMargins: {
      top: 0.25,
      bottom: 0.1,
    },
  },
  crosshair: {
    horzLine: {
      labelBackgroundColor: theme.colors.osmoverse[850],
      style: LineStyle.Dashed,
      width: 2,
      color: `${theme.colors.osmoverse[300]}2b`,
      labelVisible: false,
    },
    vertLine: {
      labelBackgroundColor: theme.colors.osmoverse[850],
      style: LineStyle.Dashed,
      width: 2,
      color: `${theme.colors.osmoverse[300]}2b`,
      labelVisible: false,
    },
  },
  handleScroll: false,
  handleScale: false,
  kineticScroll: {
    touch: false,
    mouse: false,
  },
  localization: {
    priceFormatter,
    timeFormatter: (timePoint: Time) => {
      const formatOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };

      return timepointToString(timePoint, formatOptions, "en-US");
    },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    lockVisibleTimeRangeOnResize: true,
    allowBoldLabels: false,
    borderVisible: false,
    fixLeftEdge: true,
    fixRightEdge: true,
    tickMarkFormatter: (timePoint: Time, tickMarkType: TickMarkType) => {
      const formatOptions: Intl.DateTimeFormatOptions = {};

      switch (tickMarkType) {
        case TickMarkType.Year:
          formatOptions.year = "numeric";
          break;

        case TickMarkType.Month:
          formatOptions.month = "short";
          formatOptions.year = "numeric";
          break;

        case TickMarkType.DayOfMonth:
          formatOptions.day = "numeric";
          formatOptions.month = "short";
          break;

        case TickMarkType.Time:
          formatOptions.hour = "numeric";
          formatOptions.minute = "numeric";
          break;

        case TickMarkType.TimeWithSeconds:
          formatOptions.hour = "numeric";
          formatOptions.minute = "numeric";
          formatOptions.second = "2-digit";
          break;
      }

      return timepointToString(timePoint, formatOptions, "en-US");
    },
  },
  autoSize: true,
};

export interface ChartProps<T = TimeChartOptions, K = Time> {
  options?: DeepPartial<T>;
  series?: Series[];
  Controller: new (params: ChartControllerParams<T, K>) => ChartController<
    T,
    K
  >;
  onCrosshairMove?: (params: MouseEventParams<K>) => void;
}

export const Chart = memo(
  <T extends TimeChartOptions, K extends Time>(
    props: PropsWithChildren<ChartProps<T, K>>
  ) => {
    const {
      options = { height: undefined },
      children,
      series,
      onCrosshairMove,
      Controller,
    } = props;
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const chart = useRef<ChartController<T, K>>();

    useSyncExternalStore(
      resizeSubscribe,
      () => {
        chart.current?.resize();
      },
      () => true
    );

    if (container && chart.current === undefined) {
      chart.current = new Controller({
        options: {
          ...defaultOptions,
          ...options,
        },
        series,
        container,
        onCrosshairMove,
      });
    }

    useEffect(() => {
      chart.current?.applyOptions({ options, series });
    }, [options, series]);

    useEffect(() => {
      return () => {
        chart.current?.remove();
        chart.current = undefined;
      };
    }, []);

    return (
      <div className="relative h-full [&_table]:table-auto" ref={setContainer}>
        {children}
      </div>
    );
  }
);
