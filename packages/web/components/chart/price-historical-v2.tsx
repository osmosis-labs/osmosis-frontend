import { Dec } from "@keplr-wallet/unit";
import {
  AreaData,
  AreaSeriesOptions,
  DeepPartial,
  Time,
  UTCTimestamp,
} from "lightweight-charts";
import React, { FunctionComponent, memo, useCallback, useMemo } from "react";

import { AreaChartController } from "~/components/chart/light-weight-charts/area-chart";
import { SkeletonLoader } from "~/components/loaders";
import { theme } from "~/tailwind.config";
import {
  compressZeros,
  FormatOptions,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";

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

export const HistoricalPriceChartHeaderV2: FunctionComponent<{
  hoverPrice: number;
  hoverDate?: string | null;
  decimal?: number;
  formatOpts?: FormatOptions;
  fiatSymbol?: string;
  isLoading?: boolean;
}> = ({
  hoverDate,
  hoverPrice,
  formatOpts = getPriceExtendedFormatOptions(new Dec(hoverPrice)),
  decimal = Math.max(getDecimalCount(hoverPrice), 2),
  fiatSymbol,
  isLoading = false,
}) => {
  const getFormattedPrice = useCallback(
    (
      additionalFormatOpts?: Partial<
        Intl.NumberFormatOptions & { disabledTrimZeros: boolean }
      >
    ) =>
      formatPretty(new Dec(hoverPrice), {
        maxDecimals: decimal,
        notation: "compact",
        ...formatOpts,
        ...additionalFormatOpts,
      }) || "",
    [decimal, formatOpts, hoverPrice]
  );

  const { decimalDigits, significantDigits, zeros } = useMemo(
    () => compressZeros(getFormattedPrice({ disabledTrimZeros: false }), false),
    [getFormattedPrice]
  );

  return (
    <div className="flex flex-col gap-1">
      <SkeletonLoader isLoaded={!isLoading}>
        <h3 className="font-h3 sm:text-h4">
          {fiatSymbol}
          <>
            {significantDigits}.
            {Boolean(zeros) && (
              <>
                0
                <sub title={`${getFormattedPrice()}${fiatSymbol}`}>{zeros}</sub>
              </>
            )}
            {decimalDigits}
          </>
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
