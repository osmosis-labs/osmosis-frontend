import { Dec } from "@keplr-wallet/unit";
import { Range } from "@osmosis-labs/server/src/queries/complex/portfolio/portfolio";
import { AreaData, Time } from "lightweight-charts";

import { Icon } from "~/components/assets";
import {
  HistoricalChart,
  HistoricalChartSkeleton,
} from "~/components/chart/historical-chart";
import { DataPoint } from "~/components/complex/portfolio/portfolio-page-types";
import { IconButton } from "~/components/ui/button";
import { theme } from "~/tailwind.config";

import { PortfolioHistoricalRangeButtonGroup } from "./portfolio-historical-range-button-group";

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
  const percentageDec = new Dec(percentage);
  const isBullish = percentageDec.isPositive();
  const isBearish = percentageDec.isNegative();

  const colorConfig = isBullish
    ? {
        lineColor: theme.colors.bullish[500],
        topColor: `${theme.colors.bullish[500]}33`, // 20% opacity
        bottomColor: `${theme.colors.bullish[500]}00`, // 0% opacity
        crosshairMarkerBorderColor: theme.colors.bullish[500],
      }
    : isBearish
    ? {
        lineColor: theme.colors.rust[500],
        topColor: `${theme.colors.rust[500]}33`, // 20% opacity
        bottomColor: `${theme.colors.rust[500]}00`, // 0% opacity
        crosshairMarkerBorderColor: theme.colors.rust[500],
      }
    : undefined;

  return (
    <section className="relative flex flex-col justify-between gap-3">
      <div className="h-[400px] w-full xl:h-[476px]">
        {!isFetched ? (
          <HistoricalChartSkeleton />
        ) : (
          <HistoricalChart
            data={data as AreaData<Time>[]}
            onPointerHover={(value, time) => setDataPoint({ value, time })}
            colorConfig={colorConfig}
          />
        )}
      </div>
      <div className="flex justify-between">
        <PortfolioHistoricalRangeButtonGroup
          priceRange={range}
          setPriceRange={setRange}
        />
        <IconButton
          className="py-0"
          aria-label="Open main menu dropdown"
          icon={
            <Icon
              id="hamburger"
              className="text-osmoverse-200"
              height={30}
              width={30}
            />
          }
        />
      </div>
    </section>
  );
};
