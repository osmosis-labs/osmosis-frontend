import { Dec, PricePretty } from "@keplr-wallet/unit";
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

export const PortfolioHistoricalChart = ({
  data,
  isFetched,
  setDataPoint,
  range,
  setRange,
  totalPriceChange,
  error,
  totalValue,
}: {
  data?: AreaData<Time>[];
  isFetched: boolean;
  setDataPoint: (point: DataPoint) => void;
  range: Range;
  setRange: (range: Range) => void;
  totalPriceChange: number;
  error: unknown;
  totalValue: PricePretty;
}) => {
  const { t } = useTranslation();

  return (
    <section className="relative flex flex-col justify-between">
      <div className="h-[400px] w-full xl:h-[476px]">
        {error ? (
          <div className="error-message flex h-full items-center justify-center">
            {t("errors.generic")}
          </div>
        ) : !isFetched ? (
          <HistoricalChartSkeleton />
        ) : (
          <HistoricalChart
            data={data as AreaData<Time>[]}
            onPointerHover={(value, time) => setDataPoint({ value, time })}
            style={getChartStyle(totalPriceChange)}
            onPointerOut={() => {
              console.log("onPointerOut: ", totalValue);
              setDataPoint({
                value: +totalValue.toDec().toString(),
                time: undefined,
              });
            }}
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
        />
      </div>
    </section>
  );
};
