import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ObservableQueryLiquidityPositionById } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { ChartButton } from "~/components/buttons";
import { PriceChartHeader } from "~/components/chart/token-pair-historical";
import { IncreaseConcentratedLiquidityModal } from "~/modals/increase-concentrated-liquidity";
import { RemoveConcentratedLiquidityModal } from "~/modals/remove-concentrated-liquidity";
import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/derived-data/concentrated-liquidity/historical-and-liquidity-data";
import { formatPretty } from "~/utils/formatter";

const ConcentratedLiquidityDepthChart = dynamic(
  () => import("~/components/chart/concentrated-liquidity-depth"),
  { ssr: false }
);
const TokenPairHistoricalChart = dynamic(
  () => import("~/components/chart/token-pair-historical"),
  { ssr: false }
);

export const MyPositionCardExpandedSection: FunctionComponent<{
  poolId: string;
  chartConfig: ObservableHistoricalAndLiquidityData;
  position: ObservableQueryLiquidityPositionById;
}> = observer(({ poolId, chartConfig, position }) => {
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
    setPriceRange,
  } = chartConfig;
  const { baseAsset, quoteAsset, lowerPrices, upperPrices, isFullRange } =
    position;

  const t = useTranslation();

  const [activeModal, setActiveModal] = useState<"increase" | "remove" | null>(
    null
  );

  useEffect(() => {
    if (lowerPrices?.price && upperPrices?.price) {
      setPriceRange([lowerPrices.price, upperPrices.price]);
    }
  }, [lowerPrices, upperPrices, setPriceRange]);

  return (
    <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
      {activeModal === "increase" && (
        <IncreaseConcentratedLiquidityModal
          isOpen={true}
          poolId={poolId}
          position={position}
          onRequestClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "remove" && (
        <RemoveConcentratedLiquidityModal
          isOpen={true}
          poolId={poolId}
          position={position}
          onRequestClose={() => setActiveModal(null)}
        />
      )}
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
              isFullRange
                ? [
                    new Dec((yRange[0] || 0) * 1.05),
                    new Dec((yRange[1] || 0) * 0.95),
                  ]
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
                  price: Number(lowerPrices?.price.toString() ?? 0),
                  depth: xRange[1],
                },
                {
                  price: Number(upperPrices?.price.toString() ?? 0),
                  depth: xRange[1],
                },
              ]}
              offset={{ top: 0, right: 36, bottom: 24 + 28, left: 0 }}
              horizontal
              fullRange={isFullRange}
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
              <PriceBox
                currentValue={
                  isFullRange ? "0" : upperPrices?.price.toString() ?? "0"
                }
                label={t("clPositions.maxPrice")}
                infinity={isFullRange}
              />
              <PriceBox
                currentValue={
                  isFullRange ? "0" : lowerPrices?.price.toString() ?? "0"
                }
                label={t("clPositions.minPrice")}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="flex w-full flex-col gap-4">
          {baseAsset && quoteAsset && (
            <>
              <div className="flex flex-row justify-between">
                <AssetPairAmountDetail
                  className="w-0 flex-shrink flex-grow"
                  title={t("clPositions.currentAssets")}
                  baseAsset={baseAsset}
                  quoteAsset={quoteAsset}
                />
                <AssetPairAmountDetail
                  className="w-0 flex-shrink flex-grow"
                  title={t("clPositions.totalFeesEarned")}
                  baseAsset={baseAsset}
                  quoteAsset={quoteAsset}
                />
              </div>
              <div className="flex flex-row justify-between">
                <AssetPairAmountDetail
                  className="w-0 flex-shrink flex-grow"
                  title={t("clPositions.principleAssets")}
                  baseAsset={baseAsset}
                  quoteAsset={quoteAsset}
                />
                <AssetPairAmountDetail
                  className="w-0 flex-shrink flex-grow"
                  title={t("clPositions.unclaimedFees")}
                  baseAsset={baseAsset}
                  quoteAsset={quoteAsset}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-row justify-end gap-5">
        <PositionButton onClick={() => null}>
          {t("clPositions.collectRewards")}
        </PositionButton>
        <PositionButton onClick={() => setActiveModal("remove")}>
          {t("clPositions.removeLiquidity")}
        </PositionButton>
        <PositionButton onClick={() => setActiveModal("increase")}>
          {t("clPositions.increaseLiquidity")}
        </PositionButton>
      </div>
    </div>
  );
});

function PositionButton(props: { children: ReactNode; onClick: () => void }) {
  return (
    <Button
      mode="unstyled"
      size="sm"
      className="text-white w-fit whitespace-nowrap rounded-[10px] border-2 border-wosmongton-400 bg-transparent py-4 px-5 text-subtitle1 font-subtitle1 hover:border-wosmongton-300 disabled:border-osmoverse-600 disabled:text-osmoverse-400"
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}

const AssetPairAmountDetail: FunctionComponent<{
  className?: string;
  title: string;
  baseAsset: CoinPretty;
  quoteAsset: CoinPretty;
}> = observer(({ className, title, baseAsset, quoteAsset }) => {
  const { priceStore } = useStore();

  if (!baseAsset || !quoteAsset) return null;

  const fiat = priceStore.defaultVsCurrency;
  const baseFiatValue = priceStore.calculatePrice(baseAsset, fiat);
  const quoteFiatValue = priceStore.calculatePrice(quoteAsset, fiat);
  const totalFiat =
    baseFiatValue && quoteFiatValue
      ? baseFiatValue.add(quoteFiatValue)
      : undefined;

  return (
    <div
      className={classNames(
        "flex flex-col gap-2 text-osmoverse-400",
        className
      )}
    >
      <div className="text-subtitle1">{title}</div>
      <div className="flex flex-row items-center gap-5">
        {baseAsset && (
          <div className="flex flex-row items-center gap-2">
            {baseAsset.currency.coinImageUrl && (
              <Image
                alt="base currency"
                src={baseAsset.currency.coinImageUrl}
                height={24}
                width={24}
              />
            )}
            <span>{baseAsset.toString()}</span>
          </div>
        )}
        {quoteAsset && (
          <div className="flex flex-row items-center gap-2">
            {quoteAsset.currency.coinImageUrl && (
              <Image
                alt="quote currency"
                src={quoteAsset.currency.coinImageUrl}
                height={24}
                width={24}
              />
            )}
            <span>{quoteAsset.toString()}</span>
            <span>({totalFiat ? formatPretty(totalFiat) : "0"})</span>
          </div>
        )}
      </div>
    </div>
  );
});

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
