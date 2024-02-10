import classNames from "classnames";
import Image from "next/image";
import React, { useState } from "react";

import { Icon } from "~/components/assets";
import { TestChart } from "~/components/chart/home-chart";
import { MenuDropdown } from "~/components/control";
import { AssetInfo } from "~/components/home/asset-info";
import {
  availableTimeFrames,
  useSwapHistoricalPrice,
  useSwapPageQuery,
} from "~/components/home/hooks";
import { Spinner } from "~/components/loaders";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { useCalculatePairRatios } from "~/hooks/use-calculate-pair-ratios";
import { CommonPriceChartTimeFrame } from "~/server/queries/complex/assets";
import { theme } from "~/tailwind.config";
import * as trpc from "~/utils/trpc";

export const ChartSection = ({
  isChartVisible,
}: {
  isChartVisible: boolean;
}) => {
  const {
    swapState: { from, to },
    timeFrame: urlTimeFrame,
    setTimeFrame,
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
    result: { data: fromAssetChartData, isLoading: isFromChartDataLoading },
  } = useSwapHistoricalPrice(from, urlTimeFrame);

  const {
    result: { data: toAssetChartData, isLoading: isToChartDataLoading },
  } = useSwapHistoricalPrice(to, urlTimeFrame);

  const [showPairRatio, setShowPairRatio] = useState(false);
  const [isTimeFrameSelectorOpen, setIsTimeFrameSelectorOpen] = useState(false);

  const pairRatios = useCalculatePairRatios(
    fromAssetChartData,
    toAssetChartData
  );

  return (
    <section
      className={classNames(
        "relative max-h-[520px] w-full overflow-hidden rounded-tl-3xl rounded-bl-3xl bg-osmoverse-850 transition-all duration-300 ease-in-out lg:hidden",
        {
          "translate-x-full opacity-0": !isChartVisible,
          "translate-x-0 opacity-100": isChartVisible,
        }
      )}
    >
      <header className="flex w-full justify-between p-8">
        <div className="flex items-center gap-16">
          <SkeletonLoader isLoaded={!isLoadingFromMarketData}>
            <AssetInfo
              assetPrice={fromAssetMarketData?.currentPrice}
              priceChange24h={fromAssetMarketData?.priceChange24h}
              denom={fromAssetMarketData?.coinDenom}
              color={
                showPairRatio
                  ? theme.colors.wosmongton["200"]
                  : theme.colors.ammelia["400"]
              }
            />
          </SkeletonLoader>
          <SkeletonLoader isLoaded={!isLoadingToMarketData}>
            <AssetInfo
              assetPrice={toAssetMarketData?.currentPrice}
              priceChange24h={toAssetMarketData?.priceChange24h}
              denom={toAssetMarketData?.coinDenom}
              color={
                showPairRatio
                  ? theme.colors.wosmongton["200"]
                  : theme.colors.wosmongton["300"]
              }
            />
          </SkeletonLoader>
        </div>
        <div className="relative hidden xl:block">
          <button
            onClick={() => setIsTimeFrameSelectorOpen((p) => !p)}
            className="inline-flex items-center gap-1 self-start px-2 py-[5px] text-caption text-wosmongton-300"
          >
            {urlTimeFrame}
            <Icon id="chevron-down" className="h-4 w-4" />
          </button>
          <MenuDropdown
            isOpen={isTimeFrameSelectorOpen}
            onSelect={(s) => setTimeFrame(s as CommonPriceChartTimeFrame)}
            options={availableTimeFrames.map((tf) => ({ display: tf, id: tf }))}
            isFloating
          />
        </div>
        <div className="flex items-center gap-1 self-start xl:hidden">
          {availableTimeFrames.map((timeFrame) => (
            <button
              key={timeFrame}
              onClick={() => setTimeFrame(timeFrame)}
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
      {!isFromChartDataLoading && !isToChartDataLoading ? (
        <TestChart
          data={
            showPairRatio
              ? [pairRatios, []]
              : [fromAssetChartData!, toAssetChartData!]
          }
        />
      ) : (
        <div className="flex h-1/2 flex-col items-center justify-center">
          <Spinner />
        </div>
      )}
      <button
        onClick={() => setShowPairRatio((p) => !p)}
        className={classNames(
          "absolute bottom-6 left-6 z-10 h-11 rounded-full bg-osmoverse-700 text-xl text-wosmongton-200",
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
