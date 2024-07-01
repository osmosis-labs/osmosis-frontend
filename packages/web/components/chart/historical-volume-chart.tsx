import {
  AreaData,
  DeepPartial,
  HistogramData,
  HistogramSeriesOptions,
  Time,
  TimeChartOptions,
} from "lightweight-charts";
import React, { memo } from "react";

import { HistogramChartController } from "~/components/chart/light-weight-charts/histogram-chart";
import { priceFormatter } from "~/components/chart/light-weight-charts/utils";
import { theme } from "~/tailwind.config";

import { Chart } from "./light-weight-charts/chart";

const seriesOpt: DeepPartial<HistogramSeriesOptions> = {
  priceLineVisible: false,
  lastValueVisible: false,
  priceScaleId: "right",
  color: theme.colors.ammelia[500],
  priceFormat: {
    type: "custom",
    formatter: priceFormatter,
    minMove: 0.0000001,
  },
};

interface HistoricalVolumeChartProps {
  data: HistogramData<Time>[];
  onPointerHover?: (price: number, time: Time) => void;
  onPointerOut?: () => void;
}

const chartOptions: DeepPartial<TimeChartOptions> = {
  crosshair: {
    horzLine: {
      visible: false,
      labelVisible: false,
    },
    vertLine: {
      visible: false,
      labelVisible: false,
    },
  },
};

export const HistoricalVolumeChart = memo(
  (props: HistoricalVolumeChartProps) => {
    const { data = [], onPointerHover, onPointerOut } = props;

    return (
      <Chart
        Controller={HistogramChartController}
        options={chartOptions}
        series={[
          {
            type: "Histogram",
            options: seriesOpt,
            data,
          },
        ]}
        onCrosshairMove={(params) => {
          if (params.seriesData.size > 0) {
            const [data] = [...params.seriesData.values()] as AreaData[];

            onPointerHover?.(data.value, data.time);
          } else {
            onPointerOut?.();
          }
        }}
      />
    );
  }
);
