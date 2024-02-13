import { Dec } from "@keplr-wallet/unit";
import {
  AreaData,
  AreaStyleOptions,
  ColorType,
  createChart,
  DeepPartial,
  IChartApi,
  isBusinessDay,
  ISeriesApi,
  LineStyle,
  MouseEventParams,
  SeriesOptionsCommon,
  TickMarkType,
  Time,
  TimeChartOptions,
} from "lightweight-charts";
import { useState } from "react";
import { useEffect, useRef } from "react";

import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

type TooltipInitFn = (container: UseChartReturn["container"]) => HTMLDivElement;
type TooltipCrosshairMoveFn = (
  handler: MouseEventParams<Time>,
  container: UseChartReturn["container"],
  tooltip: HTMLDivElement
) => void;

export interface ChartAreaSeriesOptions {
  data: AreaData[];
  options: DeepPartial<AreaStyleOptions & SeriesOptionsCommon>;
}

export interface UseChartProps {
  options: DeepPartial<TimeChartOptions>;
  tooltip?: {
    init: TooltipInitFn;
    crosshairMove: TooltipCrosshairMoveFn;
  } | null;
  areaSeriesOptions?: ChartAreaSeriesOptions[];
}

export type UseChartReturn = ReturnType<typeof useChart>;

const defaultTooltipInit: TooltipInitFn = (container) => {
  const toolTip = document.createElement("div");
  toolTip.className =
    "rounded-xl bg-osmoverse-1000 absolute hidden p-3 left-3 top-3 pointer-events-none z-[1000] drop-shadow-xl";
  container.current?.appendChild(toolTip);

  return toolTip;
};

const defaultTooltipCrosshairMove: TooltipCrosshairMoveFn = (
  param,
  container,
  toolTip
) => {
  if (!container.current) {
    return;
  }

  if (
    param.point === undefined ||
    !param.time ||
    param.point.x < 0 ||
    param.point.x > container.current.clientWidth ||
    param.point.y < 0 ||
    param.point.y > container.current.clientHeight
  ) {
    toolTip.style.display = "none";
  } else {
    toolTip.style.display = "block";

    const dataSeries = Array.from(param.seriesData, ([key, value]) => ({
      key,
      value,
    }));

    const [_, secondSeriesData] = dataSeries;

    const content = dataSeries
      .map((series, index) => {
        const seriesData = series.value as AreaData;

        return `
      <div>
        <p class="${
          index === 0 ? "text-wosmongton-300" : "text-ammelia-400"
        } font-medium">${seriesData.customValues?.denom}</p>
        <h6 class="text-white inline-flex whitespace-nowrap">
          <span>${secondSeriesData ? "$" : ""}</span>
          <span>${formatPretty(new Dec(seriesData.value), {
            maxDecimals: 2,
            notation: "compact",
          })}</span>
        </h6>
      </div>
    `;
      })
      .join("");

    const toolTipWidth = secondSeriesData ? 180 : 90;
    const toolTipHeight = 64;
    const toolTipMargin = 15;

    toolTip.innerHTML = `<div class="flex flex-row gap-6">
      ${content}
    </div>
    `;

    const y = param.point.y;
    let left = param.point.x + toolTipMargin;
    if (left > container.current.clientWidth - toolTipWidth) {
      left = param.point.x - toolTipMargin - toolTipWidth;
    }

    let top = y + toolTipMargin;

    if (top > container.current.clientHeight - toolTipHeight) {
      top = y - toolTipHeight - toolTipMargin;
    }

    toolTip.style.left = left + "px";
    toolTip.style.top = top + "px";
  }
};

const defaultChartOptions: DeepPartial<TimeChartOptions> = {
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
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    lockVisibleTimeRangeOnResize: true,
    allowBoldLabels: false,
    borderVisible: false,
    tickMarkFormatter: (
      timePoint: Time,
      tickMarkType: TickMarkType,
      locale: string
    ) => {
      const formatOptions: Intl.DateTimeFormatOptions = {};

      switch (tickMarkType) {
        case TickMarkType.Year:
          formatOptions.year = "numeric";
          break;

        case TickMarkType.Month:
          formatOptions.month = "short";
          break;

        case TickMarkType.DayOfMonth:
          formatOptions.day = "numeric";
          formatOptions.month = "short";
          break;

        case TickMarkType.Time:
          formatOptions.hour12 = false;
          formatOptions.hour = "2-digit";
          formatOptions.minute = "2-digit";
          break;

        case TickMarkType.TimeWithSeconds:
          formatOptions.hour12 = false;
          formatOptions.hour = "2-digit";
          formatOptions.minute = "2-digit";
          formatOptions.second = "2-digit";
          break;
      }

      const date = !isBusinessDay(timePoint)
        ? new Date((timePoint as number) * 1000)
        : new Date(
            Date.UTC(timePoint.year, timePoint.month - 1, timePoint.day)
          );

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
    },
  },
  autoSize: true,
};

export const useChart = (props: UseChartProps) => {
  const {
    options,
    tooltip = {
      init: defaultTooltipInit,
      crosshairMove: defaultTooltipCrosshairMove,
    },
    areaSeriesOptions = [],
  } = props;
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi>();
  const [crosshairParams, setCrosshairParams] =
    useState<MouseEventParams<Time>>();

  useEffect(() => {
    chart.current = createChart(container.current!, {
      ...defaultChartOptions,
      ...options,
    });

    let tooltipElement: HTMLDivElement;

    if (tooltip) {
      tooltipElement = tooltip.init(container);

      chart.current.subscribeCrosshairMove((param) => {
        setCrosshairParams(param);
        tooltip.crosshairMove(param, container, tooltipElement);
      });
    }

    chart.current.timeScale().fitContent();

    return () => {
      tooltipElement?.remove();
      chart.current?.remove();
      chart.current = undefined;
    };
  }, []);

  useEffect(() => {
    const areaSeries: ISeriesApi<"Area">[] = [];

    areaSeriesOptions.forEach((areaSeriesOpt) => {
      const series = chart.current?.addAreaSeries(areaSeriesOpt.options);

      series?.setData(areaSeriesOpt.data);

      if (series) {
        areaSeries.push(series);
      }
    });

    chart.current?.timeScale().fitContent();

    return () => {
      areaSeries.forEach((series) => {
        chart.current?.removeSeries(series);
      });
    };
  }, [areaSeriesOptions]);

  return {
    container,
    chart,
    crosshairParams,
  };
};

export interface UseChartAreaSeriesProps {
  chart: ReturnType<typeof useChart>["chart"];
  data: AreaData[];
  options: DeepPartial<AreaStyleOptions & SeriesOptionsCommon>;
}

export const useChartAreaSeries = (props: UseChartAreaSeriesProps) => {
  const { chart, data, options } = props;
  const series = useRef<ISeriesApi<"Area">>();

  useEffect(() => {
    if (series.current) {
      try {
        chart.current?.removeSeries(series.current);
        series.current = undefined;
      } catch {}
    }

    series.current = chart.current?.addAreaSeries(options);

    series.current?.setData(data);
  }, [chart, data, options]);
};
