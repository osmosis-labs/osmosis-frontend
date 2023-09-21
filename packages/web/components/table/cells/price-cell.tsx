import { CoinPretty, DecUtils } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useMemo, useRef } from "react";
import { FunctionComponent } from "react";
import { useIntersection } from "react-use";

import { Sparkline } from "~/components/chart/sparkline";
import { AssetCell as Cell } from "~/components/table/cells/types";
import { useStore } from "~/stores";
import { CoinBalance } from "~/stores/assets";
import { theme } from "~/tailwind.config";
import { getLastDayChartData } from "~/utils/chart";

export const PriceCell: FunctionComponent<Partial<Cell>> = observer(
  ({ balance, coinDenom }) => {
    return (
      <div className="flex items-center gap-4">
        <CurrentDenomPrice balance={balance!} />
        <SparklineChart coinDenom={coinDenom!} />
      </div>
    );
  }
);

const CurrentDenomPrice: FunctionComponent<{
  balance: CoinBalance["balance"];
}> = ({ balance }) => {
  const { priceStore } = useStore();

  const price = priceStore.calculatePrice(
    new CoinPretty(
      balance?.currency!,
      DecUtils.getTenExponentNInPrecisionRange(balance?.currency.coinDecimals!)
    )
  );

  return (
    <p className="subtitle1" title={price?.toDec().toString()}>
      {price?.toString()}
    </p>
  );
};

const SparklineChart: FunctionComponent<{ coinDenom: string }> = observer(
  ({ coinDenom }) => {
    const { queriesExternalStore } = useStore();
    const tokenChartQuery = queriesExternalStore.queryTokenHistoricalChart.get(
      coinDenom,
      60
    );
    const containerRef = useRef<HTMLSpanElement>(null);
    const intersection = useIntersection(containerRef, {
      root: null,
      rootMargin: "0px",
      threshold: 1,
    });

    const chartData = useMemo(
      () => getLastDayChartData(tokenChartQuery?.getChartPrices),
      [tokenChartQuery?.getChartPrices]
    );

    const isVisible = intersection && intersection.intersectionRatio >= 0.5;

    return (
      <span ref={containerRef}>
        {chartData.length > 0 && isVisible && (
          <Sparkline
            width={80}
            height={50}
            lineWidth={2}
            data={chartData}
            color={theme.colors.wosmongton[200]}
          />
        )}
      </span>
    );
  }
);
