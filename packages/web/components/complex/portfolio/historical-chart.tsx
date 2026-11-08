import type { Range } from "@osmosis-labs/server";
import { AreaData, Time } from "lightweight-charts";

import { Icon } from "~/components/assets";
import {
  HistoricalChart,
  HistoricalChartSkeleton,
} from "~/components/chart/historical-chart";
import { PortfolioHistoricalRangeButtonGroup } from "~/components/complex/portfolio/historical-range-button-group";
import { DataPoint } from "~/components/complex/portfolio/types";
import { Button, IconButton } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

interface PortfolioHistoricalChartProps {
  data?: AreaData<Time>[];
  isFetched: boolean;
  setDataPoint: (point: DataPoint) => void;
  resetDataPoint: () => void;
  range: Range;
  setRange: (range: Range) => void;
  setShowDate: (show: boolean) => void;
  setIsChartMinimized: (isChartMinimized: boolean) => void;
}

export const PortfolioHistoricalChart = ({
  data,
  isFetched,
  setDataPoint,
  resetDataPoint,
  range,
  setRange,
  setShowDate,
  setIsChartMinimized,
}: PortfolioHistoricalChartProps) => {
  return (
    <section className="relative flex h-[468px] max-h-[468px] flex-col justify-between">
      {!isFetched ? (
        <HistoricalChartSkeleton />
      ) : (
        <>
          <HistoricalChart
            data={data as AreaData<Time>[]}
            onPointerHover={(value, time) => {
              setShowDate(true);
              setDataPoint({ value, time });
            }}
            onPointerOut={resetDataPoint}
          />
          <div className="my-3 flex h-8 justify-between">
            <PortfolioHistoricalRangeButtonGroup
              priceRange={range}
              setPriceRange={setRange}
            />
            <IconButton
              className="!h-8 !w-8 border border-osmoverse-700 py-0"
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
        </>
      )}
    </section>
  );
};

export const PortfolioHistoricalChartMinimized = ({
  data,
  isFetched,
}: {
  data?: AreaData<Time>[];
  isFetched: boolean;
}) => {
  return (
    <div className="h-full w-full">
      {!isFetched ? (
        <HistoricalChartSkeleton hideScales />
      ) : (
        <HistoricalChart data={data as AreaData<Time>[]} hideScales />
      )}
    </div>
  );
};

/** Compact stand-in for the chart while the history is unavailable. It is not
 *  the expand button, and does not touch the saved minimised preference. */
export const PortfolioHistoricalChartUnavailable = ({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div className="my-3 flex h-full w-full flex-col items-center justify-center gap-3 overflow-clip rounded-[1.25rem]">
      {isRetrying ? (
        <HistoricalChartSkeleton hideScales />
      ) : (
        <>
          <span className="body2 text-osmoverse-300">
            {t("portfolio.chartTemporarilyUnavailable")}
          </span>
          <Button variant="secondary" size="md" onClick={onRetry}>
            {t("walletSelect.retry")}
          </Button>
        </>
      )}
    </div>
  );
};
