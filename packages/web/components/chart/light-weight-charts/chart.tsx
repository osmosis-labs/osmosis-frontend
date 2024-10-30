import dayjs from "dayjs";
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
  timepointToDate,
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

const defaultOptions: DeepPartial<TimeChartOptions> = {
  layout: {
    fontFamily: theme.fontFamily.caption.join(","),
    background: {
      type: ColorType.Solid,
      color: "transparent",
    },
    textColor: theme.colors.osmoverse[500],
    fontSize: 12,
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
      style: LineStyle.Solid,
      width: 1,
      color: `${theme.colors.osmoverse[300]}2b`,
      labelVisible: false,
    },
    vertLine: {
      labelBackgroundColor: theme.colors.osmoverse[850],
      style: LineStyle.Solid,
      width: 1,
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
        case TickMarkType.Month:
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

const defaultOptionsWithSeries = (
  series?: Series[]
): DeepPartial<TimeChartOptions> => ({
  ...defaultOptions,
  timeScale: {
    ...defaultOptions.timeScale,
    tickMarkFormatter: (timePoint: Time, tickMarkType: TickMarkType) => {
      const formatOptions: Intl.DateTimeFormatOptions = {};

      const isOneDay = series?.every((value) =>
        value.data.every((data) => {
          const date = dayjs(timepointToDate(data.time));
          const diffDays = Math.abs(date.diff(Date.now(), "days"));
          return diffDays <= 1 && diffDays >= 0;
        })
      );

      if (isOneDay) {
        formatOptions.hour = "numeric";
        formatOptions.minute = "numeric";
      } else {
        switch (tickMarkType) {
          case TickMarkType.Year:
          case TickMarkType.Month:
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
      }

      return timepointToString(timePoint, formatOptions, "en-US");
    },
  },
});

interface ChartProps<T extends TimeChartOptions, K extends Time> {
  options?: DeepPartial<T>;
  series?: Series[];
  Controller: new (
    params: ChartControllerParams<TimeChartOptions, K>
  ) => ChartController<TimeChartOptions, K>;
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
    const chart = useRef<ChartController<TimeChartOptions, K>>();

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
          ...defaultOptionsWithSeries(series),
          ...options,
        },
        series,
        container,
        onCrosshairMove,
      });
    }

    useEffect(() => {
      chart.current?.applyOptions({
        options: {
          ...defaultOptionsWithSeries(series),
          ...options,
        },
        series,
      });
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
