import classNames from "classnames";
import Image from "next/image";
import React, { useState } from "react";

import { DoubleTokenChart } from "~/components/chart/double-token-chart";
import { AssetInfo } from "~/components/home/asset-info";
import {
  useSwapHistoricalPrice,
  useSwapPageQuery,
} from "~/components/home/hooks";
import { CommonPriceChartTimeFrame } from "~/server/queries/complex/assets";
import { theme } from "~/tailwind.config";
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

  const [showPairRatio, setShowPairRatio] = useState(false);

  return (
    <section className="relative w-full overflow-hidden rounded-tl-3xl rounded-bl-3xl bg-osmoverse-850 1.5lg:hidden">
      <header className="flex w-full justify-between p-8">
        <div className="flex items-center gap-16">
          {!isLoadingFromMarketData && (
            <AssetInfo
              assetPrice={fromAssetMarketData}
              denom={from}
              color={theme.colors.ammelia["400"]}
            />
          )}
          {!isLoadingToMarketData && (
            <AssetInfo
              assetPrice={toAssetMarketData}
              denom={to}
              color={theme.colors.wosmongton["300"]}
            />
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
        data={[
          fromAssetChartData ?? [],
          !showPairRatio ? toAssetChartData ?? [] : [],
        ]}
        showPairRatio={showPairRatio}
      />
      <button
        onClick={() => setShowPairRatio((p) => !p)}
        className={classNames(
          "absolute bottom-6 left-6 h-11 rounded-full bg-osmoverse-700 text-xl text-wosmongton-200",
          { "w-11": !showPairRatio, "py-1.5 px-3": showPairRatio }
        )}
      >
        {showPairRatio ? (
          <div className="inline-flex">
            {[fromAssetMarketData, toAssetMarketData].map((marketData, idx) => (
              <div
                className={classNames("relative", {
                  "z-[2]": idx === 0,
                  "z-[1] -ml-3": idx === 1,
                })}
                key={marketData?.coinDenom}
              >
                {marketData?.coinImageUrl ? (
                  <Image
                    src={marketData?.coinImageUrl}
                    alt={`${marketData?.coinDenom} image`}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-osmoverse-600">
                    {marketData?.coinDenom.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          "$"
        )}
      </button>
    </section>
  );
};
