import { ColorType, createChart, Time } from "lightweight-charts";
import { useEffect, useRef } from "react";

import { theme } from "~/tailwind.config";

type Data = {
  time: number;
  close: number;
  denom: string;
  originalClose?: number;
};

const _getTransformedData = (data?: Data[]) =>
  data
    ? data.map((originalData) => ({
        time: originalData.time as Time,
        value: originalData.close,
      }))
    : [];

export const HomeChart = ({ data }: { data: Data[][] }) => {
  const [data1, data2] = data;
  const firstSeriesData = _getTransformedData(data1);
  const secondSeriesData = _getTransformedData(data2);

  const chartContiner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = createChart(chartContiner.current!, {
      height: 336,
      width: chartContiner.current?.clientWidth,
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
      crosshair: { horzLine: { visible: false } },
      handleScroll: false,
      handleScale: false,
    });

    chart.timeScale().fitContent();
    const firstSeries = chart.addAreaSeries({
      lineColor: theme.colors.wosmongton["300"],
      topColor: `rgba(60, 53, 109, 1)`,
      bottomColor: "rgba(32, 27, 67, 1)",
      priceLineVisible: false,
      priceScaleId: "left",
    });
    const secondSeries = chart.addAreaSeries({
      lineColor: theme.colors.ammelia["400"],
      topColor: `rgba(60, 53, 109, 0.2)`,
      bottomColor: "rgba(32, 27, 67, 0.2)",
      priceLineVisible: false,
      priceScaleId: "right",
    });
    firstSeries.setData(firstSeriesData);
    secondSeries.setData(secondSeriesData);

    return () => chart.remove();
  }, [firstSeriesData, secondSeriesData]);
  return <div className="z-0" ref={chartContiner}></div>;
};
