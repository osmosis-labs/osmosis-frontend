import { Dec, Int } from "@keplr-wallet/unit";
import { maxTick, minTick, tickToSqrtPrice } from "@osmosis-labs/math";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { FunctionComponent, useEffect } from "react";

import { PriceChartHeader } from "~/components/chart/token-pair-historical";
import ChartButton from "~/components/chart-button";
import { PositionWithAssets } from "~/components/my-position-card/index";
import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/charts/historical-and-liquidity-data";

const ConcentratedLiquidityDepthChart = dynamic(
  () => import("~/components/chart/concentrated-liquidity-depth"),
  { ssr: false }
);
const TokenPairHistoricalChart = dynamic(
  () => import("~/components/chart/token-pair-historical"),
  { ssr: false }
);

const MyPositionCardExpandedSection: FunctionComponent<{
  chartConfig: ObservableHistoricalAndLiquidityData;
  positions: PositionWithAssets[];
}> = observer(({ chartConfig, positions }) => {
  const {
    historicalChartData,
    historicalRange,
    xRange,
    yRange,
    setHoverPrice,
    lastChartData,
    depthChartData,
    setZoom,
    zoomIn,
    zoomOut,
    range,
    priceDecimal,
    setHistoricalRange,
    baseDenom,
    quoteDenom,
    hoverPrice,
    setRange,
  } = chartConfig;

  const { derivedDataStore } = useStore();
  const poolId = positions[0].position.pool_id;
  const pool = derivedDataStore.poolDetails.get(poolId);
  const _queryPool = pool.pool;

  const { lower_tick, upper_tick } = positions[0].position;
  const fullRange =
    lower_tick === minTick.toString() && upper_tick === maxTick.toString();
  const lowerSqrtPrice = tickToSqrtPrice(new Int(lower_tick));
  const upperSqrtPrice = tickToSqrtPrice(new Int(upper_tick));
  const lowerPrice = lowerSqrtPrice.mul(lowerSqrtPrice);
  const upperPrice = upperSqrtPrice.mul(upperSqrtPrice);

  useEffect(() => {
    setRange([lowerPrice, upperPrice]);
  }, [lowerPrice.toString(), upperPrice.toString()]);

  return (
    <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-row gap-1">
        <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-7 pl-6">
          <PriceChartHeader
            historicalRange={historicalRange}
            setHistoricalRange={setHistoricalRange}
            baseDenom={baseDenom}
            quoteDenom={quoteDenom}
            hoverPrice={hoverPrice}
            decimal={priceDecimal}
          />
          <TokenPairHistoricalChart
            data={historicalChartData}
            annotations={
              fullRange
                ? [new Dec(yRange[0] * 1.05), new Dec(yRange[1] * 0.95)]
                : range || []
            }
            domain={yRange}
            onPointerHover={setHoverPrice}
            onPointerOut={
              lastChartData
                ? () => setHoverPrice(lastChartData.close)
                : undefined
            }
          />
        </div>
        <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-row rounded-r-2xl bg-osmoverse-700">
          <div className="mt-[84px] flex flex-1 flex-col">
            <ConcentratedLiquidityDepthChart
              yRange={yRange}
              xRange={xRange}
              data={depthChartData}
              annotationDatum={{
                price: lastChartData?.close || 0,
                depth: xRange[1],
              }}
              rangeAnnotation={[
                {
                  price: Number(lowerPrice.toString()),
                  depth: xRange[1],
                },
                {
                  price: Number(upperPrice.toString()),
                  depth: xRange[1],
                },
              ]}
              offset={{ top: 0, right: 36, bottom: 24 + 28, left: 0 }}
              horizontal
              fullRange={fullRange}
            />
          </div>
          <div className="mb-8 flex flex-col pr-8">
            <div className="mt-7 mr-6 flex h-6 flex-row gap-1">
              <ChartButton
                alt="refresh"
                src="/icons/refresh-ccw.svg"
                selected={false}
                onClick={() => setZoom(1)}
              />
              <ChartButton
                alt="zoom in"
                src="/icons/zoom-in.svg"
                selected={false}
                onClick={zoomIn}
              />
              <ChartButton
                alt="zoom out"
                src="/icons/zoom-out.svg"
                selected={false}
                onClick={zoomOut}
              />
            </div>
            <div className="flex h-full flex-col justify-between py-4">
              {/* TODO: use translation */}
              <PriceBox
                currentValue={
                  fullRange ? "" : upperPrice.toString(priceDecimal)
                }
                label="Max price"
                infinity={fullRange}
              />
              {/* TODO: use translation */}
              <PriceBox
                currentValue={
                  fullRange ? "0" : lowerPrice.toString(priceDecimal)
                }
                label="Min price"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col">
          <div>
            <div>Current Assets</div>
            <div className="flex flex-row gap-1">
              <img
                className="h-[1.5rem] w-[1.5rem]"
                src={_queryPool?.poolAssets[0].amount.currency.coinImageUrl}
              />
              <span>{positions[0]?.asset0.amount}</span>
              <span>{positions[0]?.asset0.denom}</span>
              <img
                className="h-[1.5rem] w-[1.5rem]"
                src={_queryPool?.poolAssets[1].amount.currency.coinImageUrl}
              />
              <span>{positions[0]?.asset1.amount}</span>
              <span>{positions[0]?.asset1.denom}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col"></div>
      </div>
    </div>
  );
});

export default MyPositionCardExpandedSection;

function PriceBox(props: {
  label: string;
  currentValue: string;
  infinity?: boolean;
}) {
  return (
    <div className="flex w-full max-w-[9.75rem] flex-col gap-1">
      <span className="pt-2 text-caption text-osmoverse-400">
        {props.label}
      </span>
      {props.infinity ? (
        <div className="flex h-[41px] flex-row items-center">
          <Image
            alt="infinity"
            src="/icons/infinity.svg"
            width={16}
            height={16}
          />
        </div>
      ) : (
        <h6 className="overflow-hidden text-ellipsis border-0 bg-transparent text-subtitle1 leading-tight">
          {props.currentValue}
        </h6>
      )}
    </div>
  );
}
