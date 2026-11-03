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
  error: unknown;
  /** Re-runs the history query after a failure. */
  onRetry: () => void;
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
  error,
  onRetry,
  setShowDate,
  setIsChartMinimized,
}: PortfolioHistoricalChartProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative flex h-[468px] max-h-[468px] flex-col justify-between">
      {error ? (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <span className="body1 text-osmoverse-300">
            {t("portfolio.chartTemporarilyUnavailable")}
          </span>
          <Button variant="secondary" size="md" onClick={onRetry}>
            {t("walletSelect.retry")}
          </Button>
        </div>
      ) : !isFetched ? (
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
              className="!h-8 !w-8 border border-osmoverse-700 py-0 1.5md:hidden"
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
  error,
}: {
  data?: AreaData<Time>[];
  isFetched: boolean;
  error: unknown;
}) => {
  const { t } = useTranslation();
  return (
    <div className="h-full w-full">
      {error ? (
        <div className="body2 flex h-full items-center justify-center text-osmoverse-300">
          {t("portfolio.chartTemporarilyUnavailable")}
        </div>
      ) : !isFetched ? (
        <HistoricalChartSkeleton hideScales />
      ) : (
        <HistoricalChart data={data as AreaData<Time>[]} hideScales />
      )}
    </div>
  );
};
