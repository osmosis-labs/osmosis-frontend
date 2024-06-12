import {
  AreaData,
  AreaSeriesOptions,
  DeepPartial,
  Time,
  UTCTimestamp,
} from "lightweight-charts";
import React, { FunctionComponent, memo } from "react";

import { AreaChartController } from "~/components/chart/light-weight-charts/area-chart";
import { theme } from "~/tailwind.config";

import { Chart } from "./light-weight-charts/chart";

const seriesOpt: DeepPartial<AreaSeriesOptions> = {
  lineColor: theme.colors.wosmongton[300],
  topColor: theme.colors.osmoverse[700],
  bottomColor: theme.colors.osmoverse[850],
  priceLineVisible: false,
  lastValueVisible: false,
  priceScaleId: "right",
  crosshairMarkerBorderWidth: 0,
  crosshairMarkerRadius: 8,
  priceFormat: {
    type: "price",
    precision: 10,
    minMove: 0.0000001,
  },
};

export const HistoricalPriceChartV2: FunctionComponent<{
  data: { close: number; time: number }[];
  onPointerHover?: (price: number, time: Time) => void;
  onPointerOut?: () => void;
}> = memo(({ data = [], onPointerHover, onPointerOut }) => {
  return (
    <Chart
      Controller={AreaChartController}
      series={[
        {
          type: "Area",
          options: seriesOpt,
          data: data.map((point) => ({
            time: (point.time / 1000) as UTCTimestamp,
            value: point.close,
          })),
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
});
