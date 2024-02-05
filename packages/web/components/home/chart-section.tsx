import classNames from "classnames";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import React from "react";

import { DoubleTokenChart } from "~/components/chart/double-token-chart";
import { AssetInfo } from "~/components/home/asset-info";
import { useGetHistoricalPriceWithNormalization } from "~/components/home/hooks";
import { CommonPriceChartTimeFrame } from "~/server/queries/complex/assets";
import * as trpc from "~/utils/trpc";

const availableTimeFrames: CommonPriceChartTimeFrame[] = [
  "1H",
  "1D",
  "1W",
  "1M",
];

export const ChartSection = () => {
  const [{ from, to, timeFrame: urlTimeFrame }, setQueryState] = useQueryStates(
    {
      from: parseAsString.withDefault("OSMO"),
      to: parseAsString.withDefault("ATOM"),
      timeFrame:
        parseAsStringEnum<CommonPriceChartTimeFrame>(
          availableTimeFrames
        ).withDefault("1M"),
    }
  );

  const { data: fromAssetMarketData } =
    trpc.api.edge.assets.getMarketAsset.useQuery({
      findMinDenomOrSymbol: from,
    });
  const { data: toAssetMarketData } =
    trpc.api.edge.assets.getMarketAsset.useQuery({
      findMinDenomOrSymbol: to,
    });

  const { data: fromAssetChartData } = useGetHistoricalPriceWithNormalization(
    from,
    urlTimeFrame
  );
  const { data: toAssetChartData } = useGetHistoricalPriceWithNormalization(
    to,
    urlTimeFrame
  );

  return (
    <section className="w-full overflow-hidden">
      <header className="flex w-full justify-between p-8">
        <div className="flex items-center gap-16">
          <AssetInfo assetPrice={fromAssetMarketData} denom={from} />
          <AssetInfo assetPrice={toAssetMarketData} denom={to} />
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
        data1={fromAssetChartData ?? []}
        data2={toAssetChartData ?? []}
      />
    </section>
  );
};
