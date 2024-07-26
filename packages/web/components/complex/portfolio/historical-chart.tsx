import { Dec } from "@keplr-wallet/unit";
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

export const PortfolioHistoricalChart = ({
  data,
  isFetched,
  setDataPoint,
  range,
  setRange,
  percentage,
}: {
  data?: AreaData<Time>[];
  isFetched: boolean;
  setDataPoint: (point: DataPoint) => void;
  range: Range;
  setRange: (range: Range) => void;
  percentage: number;
}) => {
  const getChartConfig = (
    percentage: number
  ): "bullish" | "bearish" | "neutral" => {
    const percentageDec = new Dec(percentage);
    if (percentageDec.isPositive()) {
      return "bullish";
    } else if (percentageDec.isNegative()) {
      return "bearish";
    } else {
      return "neutral";
    }
  };

  return (
    <section className="relative flex flex-col justify-between gap-3">
      <div className="h-[400px] w-full xl:h-[476px]">
        {!isFetched ? (
          <HistoricalChartSkeleton />
        ) : (
          <HistoricalChart
            data={data as AreaData<Time>[]}
            onPointerHover={(value, time) => setDataPoint({ value, time })}
            config={getChartConfig(percentage)}
          />
        )}
      </div>
      <div className="flex justify-between">
        <PortfolioHistoricalRangeButtonGroup
          priceRange={range}
          setPriceRange={setRange}
        />
        <IconButton
          className="border border-osmoverse-700 py-0"
          aria-label="Open main menu dropdown"
          icon={
            <Icon
              id="resize"
              className="text-osmoverse-200"
              height={16}
              width={16}
            />
          }
        />
      </div>
    </section>
  );
};
