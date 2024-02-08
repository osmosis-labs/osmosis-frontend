import classNames from "classnames";
import React from "react";

import { DoubleTokenChart } from "~/components/chart/double-token-chart";
import { AssetInfo } from "~/components/home/asset-info";
import {
  useSwapHistoricalPrice,
  useSwapPageQuery,
} from "~/components/home/hooks";
import { CommonPriceChartTimeFrame } from "~/server/queries/complex/assets";
import * as trpc from "~/utils/trpc";

const availableTimeFrames: CommonPriceChartTimeFrame[] = [
  "1H",
  "1D",
  "1W",
  "1M",
];

export const ChartSection = () => {
  const {
    queryState: { from, to, timeFrame: urlTimeFrame },
    setQueryState,
  } = useSwapPageQuery();

  const { data: fromAssetMarketData, isLoading: isLoadingFromMarketData } =
    trpc.api.edge.assets.getMarketAsset.useQuery({
      findMinDenomOrSymbol: from,
    });

  const { data: toAssetMarketData, isLoading: isLoadingToMarketData } =
    trpc.api.edge.assets.getMarketAsset.useQuery({
      findMinDenomOrSymbol: to,
    });

  const {
    result: { data: fromAssetChartData },
  } = useSwapHistoricalPrice(from, urlTimeFrame);

  const {
    result: { data: toAssetChartData },
  } = useSwapHistoricalPrice(to, urlTimeFrame);

  return (
    <section className="w-full overflow-hidden rounded-tl-3xl rounded-bl-3xl bg-osmoverse-850 1.5lg:hidden">
      <header className="flex w-full justify-between p-8">
        <div className="flex items-center gap-16">
          {!isLoadingFromMarketData && (
            <AssetInfo assetPrice={fromAssetMarketData} denom={from} />
          )}
          {!isLoadingToMarketData && (
            <AssetInfo assetPrice={toAssetMarketData} denom={to} />
          )}
        </div>
        <div className="flex items-center gap-1">
          {availableTimeFrames.map((timeFrame) => (
            <button
              key={timeFrame}
              onClick={() => setQueryState({ timeFrame })}
              className={classNames(
                "px-2 py-[5px] text-caption text-osmoverse-400",
                {
                  "!text-wosmongton-300": timeFrame === urlTimeFrame,
                }
              )}
            >
              {timeFrame}
            </button>
          ))}
        </div>
      </header>
      <DoubleTokenChart
        height={336}
        data={[fromAssetChartData ?? [], toAssetChartData ?? []]}
      />
    </section>
  );
};
