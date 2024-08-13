import { Range } from "@osmosis-labs/server/src/queries/complex/portfolio/portfolio";
import { AreaData, Time } from "lightweight-charts";

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

interface PortfolioHistoricalChartProps {
  data?: AreaData<Time>[];
  isFetched: boolean;
  setDataPoint: (point: DataPoint) => void;
  resetDataPoint: () => void;
  range: Range;
  setRange: (range: Range) => void;
  error: unknown;
  setShowDate: (show: boolean) => void;
  setIsChartMinimized: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PortfolioHistoricalChart = ({
  data,
  isFetched,
  setDataPoint,
  resetDataPoint,
  range,
  setRange,
  error,
  setShowDate,
  setIsChartMinimized,
}: PortfolioHistoricalChartProps) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  return (
    <section className="relative flex h-[468px] flex-col justify-between">
      <div className="w-full grow pt-4">
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
    <div className="w-full grow">
      {error ? (
        <div className="error-message flex h-full items-center justify-center">
          {t("errors.generic")}
        </div>
      ) : !isFetched ? (
        <HistoricalChartSkeleton hideScales />
      ) : (
        <HistoricalChart data={data as AreaData<Time>[]} hideScales />
      )}
    </div>
  );
};
