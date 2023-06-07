import { CoinPretty, Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  ComponentProps,
  FunctionComponent,
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
  chartConfig: ObservableHistoricalAndLiquidityData;
  positionIds: string[];
  baseAmount: CoinPretty;
  quoteAmount: CoinPretty;
  lowerPrice: Dec;
  upperPrice: Dec;
  poolId: string;
  passive: boolean;
}> = observer(
  ({
    chartConfig,
    baseAmount,
    quoteAmount,
    lowerPrice,
    upperPrice,
    passive,
    poolId,
    positionIds,
  }) => {
    const {
      chainStore: {
        osmosis: { chainId },
      },
      accountStore,
      queriesStore,
    } = useStore();

    const account = accountStore.getAccount(chainId);

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

    const t = useTranslation();

    const queryPositions = queriesStore
      .get(chainId)
      .osmosis!.queryLiquidityPositionsById.getForPositionIds(positionIds);

    const [activeModal, setActiveModal] = useState<
      "increase" | "remove" | null
    >(null);

    useEffect(() => {
      setPriceRange([lowerPrice, upperPrice]);
    }, [lowerPrice.toString(), upperPrice.toString()]);

    return (
      <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        {activeModal === "increase" && (
          <IncreaseConcentratedLiquidityModal
            poolId={poolId}
            isOpen={true}
            positionIds={positionIds}
            lowerPrice={lowerPrice}
            upperPrice={upperPrice}
            baseAmount={baseAmount}
            quoteAmount={quoteAmount}
            passive={passive}
            onRequestClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === "remove" && (
          <RemoveConcentratedLiquidityModal
            poolId={poolId}
            isOpen={true}
            positionIds={positionIds}
            lowerPrice={lowerPrice}
            upperPrice={upperPrice}
            baseAmount={baseAmount}
            quoteAmount={quoteAmount}
            passive={passive}
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
                passive
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
                fullRange={passive}
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
                    passive ? "0" : upperPrice.toString(priceDecimal)
                  }
                  label={t("clPositions.maxPrice")}
                  infinity={passive}
                />
                <PriceBox
                  currentValue={
                    passive ? "0" : lowerPrice.toString(priceDecimal)
                  }
                  label={t("clPositions.minPrice")}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row">
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-row justify-between">
              <AssetPairAmountDetail
                className="w-0 flex-shrink flex-grow"
                title={t("clPositions.currentAssets")}
                baseAmount={baseAmount}
                quoteAmount={quoteAmount}
              />
              <AssetPairAmountDetail
                className="w-0 flex-shrink flex-grow"
                title={t("clPositions.totalFeesEarned")}
                baseAmount={baseAmount}
                quoteAmount={quoteAmount}
              />
            </div>
            <div className="flex flex-row justify-between">
              <AssetPairAmountDetail
                className="w-0 flex-shrink flex-grow"
                title={t("clPositions.principleAssets")}
                baseAmount={baseAmount}
                quoteAmount={quoteAmount}
              />
              <AssetPairAmountDetail
                className="w-0 flex-shrink flex-grow"
                title={t("clPositions.unclaimedFees")}
                baseAmount={baseAmount}
                quoteAmount={quoteAmount}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-row justify-end gap-5">
          <PositionButton
            disabled={!queryPositions.some((p) => p.hasRewardsAvailable)}
            onClick={() => {
              account.osmosis
                .sendCollectAllPositionsRewardsMsgs(positionIds)
                .catch(console.error);
            }}
          >
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
  }
);

const PositionButton: FunctionComponent<ComponentProps<typeof Button>> = (
  props
) => {
  return (
    <Button
      mode="unstyled"
      size="sm"
      className="text-white w-fit whitespace-nowrap rounded-[10px] border-2 border-wosmongton-400 bg-transparent py-4 px-5 text-subtitle1 font-subtitle1 hover:border-wosmongton-300 disabled:border-osmoverse-600 disabled:text-osmoverse-400"
      onClick={props.onClick}
      {...props}
    >
      {props.children}
    </Button>
  );
};

const AssetPairAmountDetail: FunctionComponent<{
  className?: string;
  title: string;
  baseAmount: CoinPretty;
  quoteAmount: CoinPretty;
}> = observer(({ className, title, baseAmount, quoteAmount }) => {
  const { priceStore } = useStore();

  if (!baseAmount || !quoteAmount) return null;

  const fiat = priceStore.defaultVsCurrency;
  const baseFiatValue = priceStore.calculatePrice(baseAmount, fiat);
  const quoteFiatValue = priceStore.calculatePrice(quoteAmount, fiat);
  const totalFiat =
    baseFiatValue && quoteFiatValue
      ? baseFiatValue?.add(quoteFiatValue)
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
        {baseAmount && (
          <div className="flex flex-row items-center gap-2">
            {baseAmount.currency.coinImageUrl && (
              <Image
                alt="base currency"
                src={baseAmount.currency.coinImageUrl}
                height={24}
                width={24}
              />
            )}
            <span>{baseAmount.hideDenom(true).toString()}</span>
            <span>{baseAmount.denom}</span>
          </div>
        )}
        {quoteAmount && (
          <div className="flex flex-row items-center gap-2">
            {quoteAmount.currency.coinImageUrl && (
              <Image
                alt="quote currency"
                src={quoteAmount.currency.coinImageUrl}
                height={24}
                width={24}
              />
            )}
            <span>{quoteAmount.hideDenom(true).toString()}</span>
            <span>{quoteAmount.denom}</span>
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
