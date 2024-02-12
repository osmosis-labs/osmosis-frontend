import { AreaData, Time } from "lightweight-charts";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import {
  useChart,
  useChartAreaSeries,
} from "~/components/chart/lightweight-chart/hooks";
import { Spinner } from "~/components/loaders";
import { theme } from "~/tailwind.config";

type Data = {
  time: number;
  close: number;
  denom: string;
  originalClose?: number;
};

interface HomeChartProps {
  data: Data[][];
  loading?: boolean;
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

export const HomeChart = observer(({ data, loading }: HomeChartProps) => {
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

  return (
    <div className="relative z-0" ref={container}>
      {loading && (
        <div className="absolute inset-0 z-50 flex h-full w-full flex-col items-center justify-center bg-osmoverse-850/50">
          <Spinner />
        </div>
      )}
    </div>
  );
});
