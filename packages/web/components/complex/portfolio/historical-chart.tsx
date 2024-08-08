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
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useTranslation } from "~/hooks";

const getChartStyle = (
  difference: number
): "bullish" | "bearish" | "neutral" => {
  const percentageDec = new Dec(difference);
  if (percentageDec.isPositive()) {
    return "bullish";
  } else if (percentageDec.isNegative()) {
    return "bearish";
  } else {
    return "neutral";
  }
};

import { Transition } from "@headlessui/react";

export const PortfolioHistoricalChart = ({
  data,
  isFetched,
  setDataPoint,
  resetDataPoint,
  range,
  setRange,
  totalPriceChange,
  error,
  setShowDate,
  isChartMinimized,
  setIsChartMinimized,
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
  isChartMinimized: boolean;
  setIsChartMinimized: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  return (
    <Transition
      show={!isChartMinimized}
      enter="transition-all ease-out duration-300"
      enterFrom="h-0 opacity-0"
      enterTo="h-[400px] opacity-100"
      leave="transition-all ease-out duration-300"
      leaveFrom="h-[400px] opacity-100"
      leaveTo="h-0 opacity-0"
    >
      <section className="relative flex flex-col justify-between">
        <div className="h-[400px] w-full xl:h-[476px]">
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
              style={getChartStyle(totalPriceChange)}
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
                id="resize"
                className="text-osmoverse-200"
                height={16}
                width={16}
              />
            }
            onClick={() => setIsChartMinimized((prev) => !prev)}
          />
        </div>
      </section>
    </Transition>
  );
};
