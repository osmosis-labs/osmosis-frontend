import { Dec } from "@keplr-wallet/unit";
import {
  AreaData,
  AreaStyleOptions,
  ColorType,
  createChart,
  CrosshairMode,
  DeepPartial,
  IChartApi,
  MouseEventParams,
  SeriesOptionsCommon,
  Time,
  TimeChartOptions,
} from "lightweight-charts";
import { useEffect, useMemo, useRef } from "react";

import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

type TooltipInitFn = (container: UseChartReturn["container"]) => HTMLDivElement;
type TooltipCrosshairMoveFn = (
  handler: MouseEventParams<Time>,
  container: UseChartReturn["container"],
  tooltip: HTMLDivElement
) => void;

export interface UseChartProps {
  options: DeepPartial<TimeChartOptions>;
  tooltip?: {
    init: TooltipInitFn;
    crosshairMove: TooltipCrosshairMoveFn;
  } | null;
}

export type UseChartReturn = ReturnType<typeof useChart>;

const defaultTooltipInit: TooltipInitFn = (container) => {
  const toolTip = document.createElement("div");
  toolTip.className =
    "rounded-xl bg-osmoverse-1000 absolute hidden p-2 left-3 top-3 pointer-events-none z-[1000] drop-shadow-xl";
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

    const [firstSeries, secondSeries] = dataSeries;

    const firstSeriesData = firstSeries.value as AreaData;
    const secondSeriesData = secondSeries.value as AreaData;

    const toolTipWidth = secondSeriesData ? 180 : 90;
    const toolTipHeight = 64;
    const toolTipMargin = 15;

    toolTip.innerHTML = `
            <div class="flex flex-row gap-6">
              <div>
                <div class="text-wosmongton-300 text-body2 font-body2 font-medium">${
                  firstSeriesData.customValues?.denom
                }</div>
                <div class="text-white text-h6 font-h6 whitespace-nowrap">
                $
                  ${formatPretty(new Dec(firstSeriesData.value), {
                    maxDecimals: 2,
                    notation: "compact",
                  })}
                </div>
              </div>
              ${
                secondSeriesData
                  ? `
                  <div>
                    <div class="text-ammelia-400 text-body2 font-body2 font-medium">${
                      secondSeriesData.customValues?.denom
                    }</div>
                    <div class="text-white text-h6 font-h6 whitespace-nowrap">
                      $
                      ${formatPretty(new Dec(secondSeriesData.value), {
                        maxDecimals: 2,
                        notation: "compact",
                      })}
                    </div>
                  </div>
                  `
                  : ""
              }
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

export const useChart = (props: UseChartProps) => {
  const {
    options,
    tooltip = {
      init: defaultTooltipInit,
      crosshairMove: defaultTooltipCrosshairMove,
    },
  } = props;
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi>();

  const internalOptions: DeepPartial<TimeChartOptions> = useMemo(
    () => ({
      layout: {
        background: {
          type: ColorType.Solid,
          color: theme.colors.osmoverse[850],
        },
        textColor: theme.colors.osmoverse[200],
      },
      grid: { horzLines: { visible: false }, vertLines: { visible: false } },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      crosshair: { horzLine: { visible: false }, mode: CrosshairMode.Magnet },
      handleScroll: false,
      handleScale: false,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        lockVisibleTimeRangeOnResize: true,
      },
      ...options,
    }),
    [options]
  );

  useEffect(() => {
    chart.current = createChart(container.current!, internalOptions);

    chart.current.timeScale().fitContent();

    let tooltipElement: HTMLDivElement;

    if (tooltip) {
      tooltipElement = tooltip.init(container);

      chart.current.subscribeCrosshairMove((param) => {
        tooltip.crosshairMove(param, container, tooltipElement);
      });
    }

    const handleResize = () => {
      chart.current?.applyOptions({
        width: container.current?.clientWidth,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });
    };

    window.addEventListener("resize", handleResize);

    chart.current.addAreaSeries();

    return () => {
      window.removeEventListener("resize", handleResize);

      tooltipElement?.remove();
      chart.current?.remove();
      chart.current = undefined;
    };
  }, [internalOptions, tooltip]);

  return {
    container,
    chart,
  };
};

export interface UseChartAreaSeriesProps {
  chart: ReturnType<typeof useChart>["chart"];
  data: AreaData[];
  options: DeepPartial<AreaStyleOptions & SeriesOptionsCommon>;
}

export const useChartAreaSeries = (props: UseChartAreaSeriesProps) => {
  const { chart, data, options } = props;

  useEffect(() => {
    const series = chart.current?.addAreaSeries(options);

    series?.setData(data);
  }, [chart, data, options]);
};

export interface UseChartTooltipProps {
  chart: ReturnType<typeof useChart>["chart"];
  container: ReturnType<typeof useChart>["container"];
}

export const useChartTooltip = (props: UseChartTooltipProps) => {
  const { chart, container } = props;
  const { priceStore } = useStore();

  useEffect(() => {
    const toolTip = document.createElement("div");
    toolTip.className =
      "rounded-xl bg-osmoverse-1000 absolute hidden p-2 left-3 top-3 pointer-events-none z-[1000] drop-shadow-xl";
    container.current?.appendChild(toolTip);

    // @ts-ignore
    console.log(
      "TEST: ",
      // @ts-ignore
      chart.current._private__crosshairMovedDelegate,
      container.current
    );

    return () => {
      toolTip.remove();
    };
  }, [chart, container, priceStore]);
};
