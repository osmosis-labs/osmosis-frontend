import {
  AreaData,
  AreaSeriesOptions,
  DeepPartial,
  UTCTimestamp,
} from "lightweight-charts";
import React, { FunctionComponent, memo } from "react";

import { LinearChartController } from "~/components/chart/light-weight-charts/linear-chart";

import { Chart } from "./light-weight-charts/chart";

const seriesOpt: DeepPartial<AreaSeriesOptions> = {
  lineColor: "#8C8AF9",
  topColor: "rgba(60, 53, 109, 1)",
  bottomColor: "rgba(32, 27, 67, 1)",
  priceLineVisible: false,
  priceScaleId: "left",
  crosshairMarkerBorderWidth: 0,
  crosshairMarkerRadius: 8,
};

export const HistoricalPriceChartV2: FunctionComponent<{
  data: { close: number; time: number }[];
  onPointerHover?: (price: number) => void;
  onPointerOut?: () => void;
}> = memo(({ data = [], onPointerHover, onPointerOut }) => {
  return (
    <Chart
      Controller={LinearChartController}
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

          onPointerHover?.(data.value);
        } else {
          onPointerOut?.();
        }
      }}
    />
  );
});
