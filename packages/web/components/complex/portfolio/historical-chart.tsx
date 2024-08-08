import { Range } from "@osmosis-labs/server/src/queries/complex/portfolio/portfolio";
import classNames from "classnames";
import { AreaData, Time } from "lightweight-charts";
import { forwardRef } from "react";

import { Icon } from "~/components/assets";
import {
  HistoricalChart,
  HistoricalChartSkeleton,
} from "~/components/chart/historical-chart";
import { PortfolioHistoricalRangeButtonGroup } from "~/components/complex/portfolio/historical-range-button-group";
import { DataPoint } from "~/components/complex/portfolio/types";
import { IconButton } from "~/components/ui/button";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useTranslation } from "~/hooks";

export const PortfolioHistoricalChart = forwardRef(
  (
    {
      data,
      isFetched,
      setDataPoint,
      resetDataPoint,
      range,
      setRange,
      totalPriceChange,
      error,
      setShowDate,
      setIsChartMinimized,
      showScales = true,
      heightClassname = "h-full",
      isChartMinimized,
    }: {
      data?: AreaData<Time>[];
      isFetched: boolean;
      setDataPoint: (point: DataPoint) => void;
      resetDataPoint: () => void;
      range: Range;
      setRange: (range: Range) => void;
      totalPriceChange: number;
      error: unknown;
      setShowDate: (show: boolean) => void;
      setIsChartMinimized: React.Dispatch<React.SetStateAction<boolean>>;
      showScales?: boolean;
      heightClassname: string;
      isChartMinimized: boolean;
    },
    ref
  ) => {
    const { t } = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();

    return (
      <section
        className="relative flex grow flex-col justify-between"
        ref={ref}
      >
        <div className={classNames("w-full", heightClassname)}>
          {/* <div className="w-full"> */}
          {error ? (
            <div className="error-message flex h-full items-center justify-center">
              {t("errors.generic")}
            </div>
          ) : !isFetched ? (
            <HistoricalChartSkeleton />
          ) : (
            <HistoricalChart
              data={data as AreaData<Time>[]}
              onPointerHover={(value, time) => {
                setShowDate(true);
                setDataPoint({ value, time });
                logEvent([EventName.Portfolio.chartInteraction]);
              }}
              onPointerOut={resetDataPoint}
              showScales={showScales}
            />
          )}
        </div>
        <div className="my-3 flex justify-between">
          <PortfolioHistoricalRangeButtonGroup
            priceRange={range}
            setPriceRange={setRange}
          />
          <IconButton
            className="border border-osmoverse-700 py-0"
            aria-label="Open main menu dropdown"
            icon={
              <Icon
                id="resize-minimize"
                className="text-osmoverse-200"
                height={16}
                width={16}
              />
            }
            onClick={() => setIsChartMinimized(true)}
          />
        </div>
      </section>
    );
  }
);

export const PortfolioHistoricalChartMinimized = ({
  data,
  isFetched,
  error,
  showScales = true,
}: {
  data?: AreaData<Time>[];
  isFetched: boolean;
  error: unknown;
  showScales?: boolean;
}) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  return (
    <div className="w-full grow ">
      {error ? (
        <div className="error-message flex h-full items-center justify-center">
          {t("errors.generic")}
        </div>
      ) : !isFetched ? (
        <HistoricalChartSkeleton showScales={false} />
      ) : (
        <HistoricalChart
          data={data as AreaData<Time>[]}
          showScales={showScales}
        />
      )}
    </div>
  );
};
