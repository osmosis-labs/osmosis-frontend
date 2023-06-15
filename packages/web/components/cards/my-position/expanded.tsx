import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ObservableQueryLiquidityPositionById } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  ComponentProps,
  FunctionComponent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { ChartButton } from "~/components/buttons";
import { PriceChartHeader } from "~/components/chart/token-pair-historical";
import { CustomClasses } from "~/components/types";
import { IncreaseConcentratedLiquidityModal } from "~/modals/increase-concentrated-liquidity";
import { RemoveConcentratedLiquidityModal } from "~/modals/remove-concentrated-liquidity";
import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/derived-data/concentrated-liquidity/historical-and-liquidity-data";

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
}> = observer(({ poolId, chartConfig, position: positionConfig }) => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
    queriesStore,
  } = useStore();

  const account = accountStore.getAccount(chainId);
  const osmosisQueries = queriesStore.get(chainId).osmosis!;
  const queryPool = osmosisQueries.queryPools.getPool(poolId);

  const currentPrice = queryPool?.concentratedLiquidityPoolInfo?.currentPrice;

  const {
    xRange,
    yRange,
    lastChartData,
    depthChartData,
    setZoom,
    zoomIn,
    zoomOut,
    setPriceRange,
  } = chartConfig;
  const {
    baseAsset,
    quoteAsset,
    lowerPrices,
    upperPrices,
    isFullRange,
    totalClaimableRewards,
  } = positionConfig;

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
          position={positionConfig}
          onRequestClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "remove" && (
        <RemoveConcentratedLiquidityModal
          isOpen={true}
          poolId={poolId}
          position={positionConfig}
          onRequestClose={() => setActiveModal(null)}
        />
      )}
      <div className="flex gap-1 xl:hidden">
        <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-7 pl-6">
          <ChartHeader config={chartConfig} />
          <Chart config={chartConfig} positionConfig={positionConfig} />
        </div>
        <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 rounded-r-2xl bg-osmoverse-700">
          <div className="mt-[84px] flex flex-1 flex-col">
            <ConcentratedLiquidityDepthChart
              yRange={yRange}
              xRange={xRange}
              data={depthChartData}
              annotationDatum={{
                price: currentPrice
                  ? Number(currentPrice.toString())
                  : lastChartData?.close || 0,
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
            <div className="mt-7 mr-6 flex h-6 gap-1">
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
        <div className="flex w-full flex-col gap-4 sm:flex-col">
          <div className="flex justify-between sm:flex-col sm:gap-3">
            <AssetsInfo
              className="w-0 flex-shrink flex-grow sm:w-full"
              title={t("clPositions.currentAssets")}
              assets={useMemo(
                () =>
                  [baseAsset, quoteAsset].filter((asset): asset is CoinPretty =>
                    Boolean(asset)
                  ),
                [baseAsset, quoteAsset]
              )}
            />
            <AssetsInfo
              className="w-0 flex-shrink flex-grow sm:w-full"
              title={t("clPositions.totalSpreadEarned")}
            />
          </div>
          <div className="flex justify-between sm:flex-col sm:gap-3">
            <AssetsInfo
              className="w-0 flex-shrink flex-grow sm:w-full"
              title={t("clPositions.principleAssets")}
            />
            <AssetsInfo
              className="w-0 flex-shrink flex-grow sm:w-full"
              title={t("clPositions.unclaimedRewards")}
              assets={totalClaimableRewards}
              emptyText={t("clPositions.noRewards")}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-row justify-end gap-5 sm:flex-wrap sm:justify-start">
        <PositionButton
          disabled={!positionConfig.hasRewardsAvailable}
          onClick={() => {
            account.osmosis
              .sendCollectAllPositionsRewardsMsgs([positionConfig.id])
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
});

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

const AssetsInfo: FunctionComponent<
  {
    title: string;
    assets?: CoinPretty[];
    emptyText?: string;
  } & CustomClasses
> = observer(({ className, title, assets = [], emptyText }) => {
  const t = useTranslation();
  const { priceStore } = useStore();

  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const totalValue =
    assets.length > 0 && fiat
      ? assets.reduce(
          (sum, asset) =>
            sum.add(
              priceStore.calculatePrice(asset) ?? new PricePretty(fiat, 0)
            ),
          new PricePretty(fiat, 0)
        )
      : undefined;

  return (
    <div
      className={classNames(
        "subtitle1 flex flex-col gap-2 text-osmoverse-400",
        className
      )}
    >
      <div>{title}</div>
      {assets.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          <div
            className={classNames(
              "grid gap-2",
              assets.length > 1
                ? "col-span-2 grid-cols-2"
                : "grid-cols col-span-1"
            )}
          >
            <div className="col-span-2 flex flex-wrap gap-x-5 gap-y-3">
              {assets.map((asset) => (
                <div key={asset.denom} className="flex items-center gap-2">
                  <div className="h-[24px] w-[24px] flex-shrink-0">
                    {asset.currency.coinImageUrl && (
                      <Image
                        alt="base currency"
                        src={asset.currency.coinImageUrl}
                        height={24}
                        width={24}
                      />
                    )}
                  </div>
                  <span>{asset.trim(true).toString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-start-3">
            {totalValue && (
              <div className="text-white-full">({totalValue.toString()})</div>
            )}
          </div>
        </div>
      ) : (
        <span className="italic">{emptyText ?? t("errors.notAvailable")}</span>
      )}
    </div>
  );
});

const PriceBox: FunctionComponent<{
  label: string;
  currentValue: string;
  infinity?: boolean;
}> = ({ label, currentValue, infinity }) => (
  <div className="flex w-full max-w-[9.75rem] flex-col gap-1">
    <span className="pt-2 text-caption text-osmoverse-400">{label}</span>
    {infinity ? (
      <div className="flex h-[41px] items-center">
        <Image
          alt="infinity"
          src="/icons/infinity.svg"
          width={16}
          height={16}
        />
      </div>
    ) : (
      <h6 className="overflow-hidden text-ellipsis border-0 bg-transparent text-subtitle1 leading-tight">
        {currentValue}
      </h6>
    )}
  </div>
);

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const ChartHeader: FunctionComponent<{
  config: ObservableHistoricalAndLiquidityData;
}> = ({ config }) => {
  const {
    historicalRange,
    priceDecimal,
    setHistoricalRange,
    baseDenom,
    quoteDenom,
    hoverPrice,
  } = config;
  return (
    <PriceChartHeader
      historicalRange={historicalRange}
      setHistoricalRange={setHistoricalRange}
      baseDenom={baseDenom}
      quoteDenom={quoteDenom}
      hoverPrice={hoverPrice}
      decimal={priceDecimal}
    />
  );
};

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const Chart: FunctionComponent<{
  config: ObservableHistoricalAndLiquidityData;
  positionConfig: ObservableQueryLiquidityPositionById;
}> = ({ config, positionConfig }) => {
  const { historicalChartData, yRange, setHoverPrice, lastChartData, range } =
    config;

  const { isFullRange } = positionConfig;

  return (
    <TokenPairHistoricalChart
      data={historicalChartData}
      annotations={
        isFullRange
          ? [new Dec((yRange[0] || 0) * 1.05), new Dec((yRange[1] || 0) * 0.95)]
          : range || []
      }
      domain={yRange}
      onPointerHover={setHoverPrice}
      onPointerOut={
        lastChartData ? () => setHoverPrice(lastChartData.close) : undefined
      }
    />
  );
};
