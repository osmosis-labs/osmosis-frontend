import { AreaData, Time } from "lightweight-charts";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import {
  useChart,
  useChartAreaSeries,
  useChartTooltip,
} from "~/components/chart/lightweight-chart/hooks";
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
  const firstSeriesData = useMemo(() => _getTransformedData(data1), [data1]);
  const secondSeriesData = useMemo(() => _getTransformedData(data2), [data2]);

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

  return <div className="z-0" ref={container}></div>;
});
