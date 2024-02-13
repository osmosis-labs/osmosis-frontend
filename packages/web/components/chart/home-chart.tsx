import { AreaData, MouseEventParams, Time } from "lightweight-charts";
import { ReactNode } from "react";
import { useMemo } from "react";

import { useChart } from "~/components/chart/lightweight-chart/hooks";
import { HistoricalPriceData } from "~/components/home/hooks";
import { Spinner } from "~/components/loaders";
import { theme } from "~/tailwind.config";

interface HomeChartProps {
  data: HistoricalPriceData[][];
  loading?: boolean;
  children?: ReactNode | ((params?: MouseEventParams<Time>) => void);
}

const _getTransformedData = (
  data?: HistoricalPriceData[],
  crosshairBG?: string
): AreaData[] =>
  data
    ? data.map((originalData) => ({
        time: originalData.time as Time,
        value: originalData.close,
        customValues: {
          denom: originalData.label ?? originalData.coinDenom,
          crosshairImage: originalData.coinImageUrl,
          crosshairBG,
        },
      }))
    : [];

export const HomeChart = (props: HomeChartProps) => {
  const { data, loading, children } = props;
  const [data1, data2] = data;
  const firstSeriesData = useMemo(
    () => _getTransformedData(data1, theme.colors.wosmongton["300"]),
    [data1]
  );
  const secondSeriesData = useMemo(
    () => _getTransformedData(data2, theme.colors.ammelia["400"]),
    [data2]
  );

  const { container, crosshairParams } = useChart({
    options: {
      height: 336,
    },
    enableCrosshairParams: true,
    areaSeriesOptions: [
      {
        options: {
          lineColor: theme.colors.wosmongton["300"],
          topColor: "rgba(60, 53, 109, 1)",
          bottomColor: "rgba(32, 27, 67, 1)",
          priceLineVisible: false,
          priceScaleId: "left",
          crosshairMarkerBorderWidth: 0,
          crosshairMarkerRadius: 8,
        },
        data: firstSeriesData,
      },
      {
        options: {
          lineColor: theme.colors.ammelia["400"],
          topColor: "rgba(202, 46, 189, 0.2)",
          bottomColor: "rgba(202, 46, 189, 0)",
          priceLineVisible: false,
          priceScaleId: "right",
          crosshairMarkerBorderWidth: 0,
          crosshairMarkerRadius: 8,
        },
        data: secondSeriesData,
      },
    ],
  });

  return (
    <>
      {typeof children === "function" ? children(crosshairParams) : children}
      <div className="relative z-0 h-[336px] w-full" ref={container}>
        {loading && (
          <div className="absolute inset-0 z-50 flex h-full w-full flex-col items-center justify-center bg-osmoverse-850/50">
            <Spinner />
          </div>
        )}
      </div>
    </>
  );
};
