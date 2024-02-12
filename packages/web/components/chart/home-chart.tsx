import { AreaData, Time } from "lightweight-charts";
import { observer } from "mobx-react-lite";

import {
  useChart,
  useChartAreaSeries,
  useChartTooltip,
} from "~/components/chart/lightweight-chart/hooks";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";

type Data = {
  time: number;
  close: number;
  denom: string;
  originalClose?: number;
};

interface HomeChartProps {
  data: Data[][];
}

const _getTransformedData = (data?: Data[]): AreaData[] =>
  data
    ? data.map((originalData) => ({
        time: originalData.time as Time,
        value: originalData.close,
        customValues: {
          denom: originalData.denom,
        },
      }))
    : [];

export const HomeChart = observer(({ data }: HomeChartProps) => {
  const [data1, data2] = data;
  const { priceStore } = useStore();
  const firstSeriesData = _getTransformedData(data1);
  const secondSeriesData = _getTransformedData(data2);

  const { container, chart } = useChart({
    options: {
      height: 336,
    },
  });

  useChartAreaSeries({
    chart,
    options: {
      lineColor: theme.colors.wosmongton["300"],
      topColor: "rgba(60, 53, 109, 1)",
      bottomColor: "rgba(32, 27, 67, 1)",
      priceLineVisible: false,
      priceScaleId: "left",
    },
    data: firstSeriesData,
  });

  useChartAreaSeries({
    chart,
    options: {
      lineColor: theme.colors.ammelia["400"],
      topColor: "rgba(202, 46, 189, 0.2)",
      bottomColor: "rgba(202, 46, 189, 0)",
      priceLineVisible: false,
      priceScaleId: "right",
    },
    data: secondSeriesData,
  });

  useChartTooltip({
    chart,
    container,
  });

  /* useEffect(() => {
    const toolTip = document.createElement("div");
    toolTip.className =
      "rounded-xl bg-osmoverse-1000 absolute hidden p-2 left-3 top-3 pointer-events-none z-[1000] drop-shadow-xl";
    chartContainer.current?.appendChild(toolTip);

    chart.subscribeCrosshairMove((param) => {
      if (!chartContainer.current) {
        return;
      }

      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainer.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainer.current.clientHeight
      ) {
        toolTip.style.display = "none";
      } else {
        toolTip.style.display = "block";
        const firstSeriesData = param.seriesData.get(firstSeries) as AreaData;
        const secondSeriesData = param.seriesData.get(secondSeries) as AreaData;

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
            ${priceStore.getFiatCurrency(priceStore.defaultVsCurrency)?.symbol}
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
                  ${
                    priceStore.getFiatCurrency(priceStore.defaultVsCurrency)
                      ?.symbol
                  }
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
        if (left > chartContainer.current.clientWidth - toolTipWidth) {
          left = param.point.x - toolTipMargin - toolTipWidth;
        }

        let top = y + toolTipMargin;
        if (top > chartContainer.current.clientHeight - toolTipHeight) {
          top = y - toolTipHeight - toolTipMargin;
        }
        toolTip.style.left = left + "px";
        toolTip.style.top = top + "px";
      }
    });

    return () => {
      chart.remove();
      toolTip.remove();
    };
  }, [firstSeriesData, priceStore, secondSeriesData]); */

  return <div className="z-0" ref={container}></div>;
});
