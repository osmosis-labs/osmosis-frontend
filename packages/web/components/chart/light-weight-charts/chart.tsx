import {
  ColorType,
  DeepPartial,
  isBusinessDay,
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

const timepointToString = (
  timePoint: Time,
  formatOptions: Intl.DateTimeFormatOptions,
  locale?: string
) => {
  let date = new Date();

  if (typeof timePoint === "string") {
    date = new Date(timePoint);
  } else if (!isBusinessDay(timePoint)) {
    date = new Date((timePoint as number) * 1000);
  } else {
    date = new Date(
      Date.UTC(timePoint.year, timePoint.month - 1, timePoint.day)
    );
  }

  // from given date we should use only as UTC date or timestamp
  // but to format as locale date we can convert UTC date to local date
  const localDateFromUtc = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  );

  return localDateFromUtc.toLocaleString(locale, formatOptions);
};

export const defaultOptions: DeepPartial<TimeChartOptions> = {
  layout: {
    fontFamily: theme.fontFamily.subtitle1.join(","),
    background: {
      type: ColorType.Solid,
      color: theme.colors.osmoverse[850],
    },
    textColor: theme.colors.wosmongton[200],
    fontSize: 14,
  },
  grid: { horzLines: { visible: false }, vertLines: { visible: false } },
  rightPriceScale: { visible: false },
  leftPriceScale: { visible: false },
  crosshair: {
    horzLine: { visible: false },
    vertLine: {
      labelBackgroundColor: theme.colors.osmoverse[850],
      style: LineStyle.LargeDashed,
      width: 2,
      color: `${theme.colors.osmoverse[300]}33`,
    },
  },
  handleScroll: false,
  handleScale: false,
  kineticScroll: {
    touch: false,
    mouse: false,
  },
  localization: {
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
      <div className="relative h-full" ref={setContainer}>
        {children}
      </div>
    );
  }
);
