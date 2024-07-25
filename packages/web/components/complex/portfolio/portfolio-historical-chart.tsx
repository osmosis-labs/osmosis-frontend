import { Range } from "@osmosis-labs/server/src/queries/complex/portfolio/portfolio";
import { AreaData, Time } from "lightweight-charts";
import { useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import {
  HistoricalChart,
  HistoricalChartSkeleton,
} from "~/components/chart/historical-chart";
import { IconButton } from "~/components/ui/button";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { PortfolioHistoricalRangeButtonGroup } from "./portfolio-historical-range-button-group";

export const PortfolioHistoricalChart = () => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  const address = wallet?.address ?? "";

  const [price, setPrice] = useState<number | undefined>(undefined);

  const [range, setRange] = useState<Range>("1mo");

  const { data, isFetched } = api.edge.portfolio.getPortfolioOverTime.useQuery(
    {
      address,
      range,
    },
    {
      enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
    }
  );

  const isAverageDataPositive = useMemo(() => {
    if (!data || data.length === 0) return false;
    const total = data.reduce((sum, point) => sum + point.value, 0);
    const average = total / data.length;
    return average > 0;
  }, [data]);

  return (
    <section className="relative flex flex-col justify-between gap-3">
      <div>Price: {price}</div>
      <div className="h-[400px] w-full xl:h-[476px]">
        {!isFetched ? (
          <HistoricalChartSkeleton />
        ) : (
          <HistoricalChart
            data={data as AreaData<Time>[]}
            onPointerHover={(price) => setPrice(price)}
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
