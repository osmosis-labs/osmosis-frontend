import { Dec } from "@keplr-wallet/unit";
import {
  AreaData,
  AreaSeriesOptions,
  DeepPartial,
  Time,
} from "lightweight-charts";
import React, { FunctionComponent, memo } from "react";

import { AreaChartController } from "~/components/chart/light-weight-charts/area-chart";
import { priceFormatter } from "~/components/chart/light-weight-charts/utils";
import { SubscriptDecimal } from "~/components/chart/price-historical";
import { SkeletonLoader } from "~/components/loaders";
import { theme } from "~/tailwind.config";
import { FormatOptions } from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";

import { Chart } from "./light-weight-charts/chart";

const seriesOpt: DeepPartial<AreaSeriesOptions> = {
  lineColor: theme.colors.wosmongton[300],
  topColor: theme.colors.osmoverse[700],
  bottomColor: theme.colors.osmoverse[850],
  priceLineVisible: false,
  lastValueVisible: false,
  priceScaleId: "right",
  crosshairMarkerBorderWidth: 4,
  crosshairMarkerBorderColor: theme.colors.osmoverse[900],
  crosshairMarkerRadius: 4,
  priceFormat: {
    type: "custom",
    formatter: priceFormatter,
    minMove: 0.0000001,
  },
};

interface HistoricalChartProps {
  data: AreaData<Time>[];
  onPointerHover?: (price: number, time: Time) => void;
  onPointerOut?: () => void;
}

export const HistoricalChart = memo((props: HistoricalChartProps) => {
  const { data = [], onPointerHover, onPointerOut } = props;

  return (
    <Chart
      Controller={AreaChartController}
      series={[
        {
          type: "Area",
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
});

export const HistoricalChartHeader: FunctionComponent<{
  hoverData: Dec;
  hoverDate?: string | null;
  maxDecimal?: number;
  formatOptions?: FormatOptions;
  fiatSymbol?: string;
  isLoading?: boolean;
}> = ({
  hoverDate,
  hoverData,
  formatOptions,
  maxDecimal = Math.max(getDecimalCount(hoverData.toString()), 2),
  fiatSymbol,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <SkeletonLoader isLoaded={!isLoading}>
        <h3 className="font-h3 sm:text-h4 xs:text-h4">
          {fiatSymbol}
          <SubscriptDecimal
            decimal={hoverData}
            maxDecimals={maxDecimal}
            formatOptions={formatOptions}
          />
        </h3>
      </SkeletonLoader>
      {hoverDate !== undefined ? (
        <p className="flex flex-1 flex-col justify-center text-sm font-caption text-wosmongton-200">
          {hoverDate}
        </p>
      ) : (
        false
      )}
    </div>
  );
};