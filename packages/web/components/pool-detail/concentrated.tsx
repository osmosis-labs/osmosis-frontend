import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, { FunctionComponent, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { Button } from "~/components/buttons";
import { ChartButton } from "~/components/buttons";
import { PriceChartHeader } from "~/components/chart/token-pair-historical";
import { MyPositionsSection } from "~/components/complex/my-positions-section";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { AddLiquidityModal } from "~/modals";
import { ConcentratedLiquidityLearnMoreModal } from "~/modals/concentrated-liquidity-intro";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

import { SuperchargeDaiOsmoPool } from "../funnels/concentrated-liquidity";

const ConcentratedLiquidityDepthChart = dynamic(
  () => import("~/components/chart/concentrated-liquidity-depth"),
  { ssr: false }
);
const TokenPairHistoricalChart = dynamic(
  () => import("~/components/chart/token-pair-historical"),
  { ssr: false }
);

export const ConcentratedLiquidityPool: FunctionComponent<{ poolId: string }> =
  observer(({ poolId }) => {
    const {
      chainStore,
      queriesExternalStore,
      priceStore,
      queriesStore,
      accountStore,
    } = useStore();
    const { chainId } = chainStore.osmosis;
    const config = useHistoricalAndLiquidityData(chainId, poolId);
    const t = useTranslation();
    const [activeModal, setActiveModal] = useState<
      "add-liquidity" | "learn-more" | null
    >(null);

    const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId)
      .osmosis!;
    const account = accountStore.getAccount(chainStore.osmosis.chainId);

    const {
      pool,
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
      priceDecimal,
      setHistoricalRange,
      baseDenom,
      quoteDenom,
      hoverPrice,
    } = config;

    const volume24h =
      queriesExternalStore.queryGammPoolFeeMetrics.getPoolFeesMetrics(
        poolId,
        priceStore
      ).volume24h;
    const poolLiquidity = pool?.computeTotalValueLocked(priceStore);

    const currentPrice = pool?.concentratedLiquidityPoolInfo
      ? pool.concentratedLiquidityPoolInfo.currentSqrtPrice.mul(
          pool.concentratedLiquidityPoolInfo.currentSqrtPrice
        )
      : undefined;

    const userHasPositionInPool =
      osmosisQueries.queryAccountsPositions
        .get(account.bech32Address)
        .positions.filter((position) => position.poolId === poolId).length > 0;

    return (
      <main className="m-auto flex min-h-screen max-w-container flex-col gap-8 bg-osmoverse-900 px-8 py-4 md:gap-4 md:p-4">
        <Head>
          <title>
            {t("pool.title", { id: poolId ? poolId.toString() : "" })}
          </title>
        </Head>
        {pool && activeModal === "add-liquidity" && (
          <AddLiquidityModal
            isOpen={true}
            poolId={pool.id}
            onRequestClose={() => setActiveModal(null)}
          />
        )}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col rounded-[28px] bg-osmoverse-1000 p-8">
            <div className="flex flex-row lg:flex-col lg:gap-3">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <PoolAssetsIcon
                    className="!w-[78px]"
                    assets={pool?.poolAssets.map((poolAsset) => ({
                      coinImageUrl: poolAsset.amount.currency.coinImageUrl,
                      coinDenom: poolAsset.amount.currency.coinDenom,
                    }))}
                  />
                  <div className="flex flex-wrap gap-x-2">
                    <PoolAssetsName
                      size="md"
                      className="text-h5 font-h5"
                      assetDenoms={pool?.poolAssets.map(
                        (asset) => asset.amount.currency.coinDenom
                      )}
                    />
                    <span className="hidden py-1 text-subtitle1 text-osmoverse-100 lg:inline-block">
                      {pool?.swapFee ? pool.swapFee.toString() : "0%"}{" "}
                      {t("clPositions.fee")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Icon id="lightning-small" height={18} width={18} />
                  <span className="text-supercharged-gradient body2">
                    {t("clPositions.supercharged")}
                  </span>
                </div>
              </div>
              <div className="flex flex-grow justify-end gap-10 lg:justify-start xs:items-end xs:justify-between">
                <PoolDataGroup
                  label={t("pool.liquidity")}
                  value={poolLiquidity ? formatPretty(poolLiquidity) : "0"}
                />
                <PoolDataGroup
                  label={t("pool.24hrTradingVolume")}
                  value={formatPretty(volume24h)}
                  className="xs:text-right"
                />

                <div className="lg:hidden">
                  <PoolDataGroup
                    label={t("pool.swapFee")}
                    value={pool?.swapFee ? pool.swapFee.toString() : "0%"}
                  />
                </div>
              </div>
            </div>
            <div className="flex h-[340px] flex-row">
              <div className="flex-shrink-1 flex w-0 flex-1 flex-col gap-[20px] py-7 sm:py-3">
                <PriceChartHeader
                  historicalRange={historicalRange}
                  setHistoricalRange={setHistoricalRange}
                  baseDenom={baseDenom}
                  quoteDenom={quoteDenom}
                  hoverPrice={hoverPrice}
                  decimal={priceDecimal}
                  classes={{
                    buttons: "sm:hidden",
                    pricesHeaderContainerClass: "sm:flex-col",
                  }}
                />
                <TokenPairHistoricalChart
                  data={historicalChartData}
                  annotations={[]}
                  domain={yRange}
                  onPointerHover={setHoverPrice}
                  onPointerOut={
                    lastChartData
                      ? () => setHoverPrice(lastChartData.close)
                      : undefined
                  }
                />
              </div>
              <div className="flex-shrink-1 relative flex w-[229px] flex-col">
                <div className="mt-7 flex h-6 justify-end gap-1 pr-8 sm:pr-0">
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
                <div className="mt-[32px] flex flex-1 flex-col">
                  <ConcentratedLiquidityDepthChart
                    yRange={yRange}
                    xRange={xRange}
                    data={depthChartData}
                    annotationDatum={{
                      price: lastChartData?.close || 0,
                      depth: xRange[1],
                    }}
                    offset={{
                      top: 0,
                      right: currentPrice
                        ? currentPrice.gt(new Dec(100))
                          ? 120
                          : 56
                        : 36,
                      bottom: 24 + 28,
                      left: 0,
                    }}
                    horizontal
                  />
                </div>
                {currentPrice && (
                  <h6 className="absolute right-0 top-[51%]">
                    {currentPrice.toString(
                      currentPrice.gt(new Dec(100)) ? 0 : 2
                    )}
                  </h6>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-row md:flex-wrap md:gap-y-4">
              <div className="flex flex-grow flex-col gap-3">
                <h6>{t("clPositions.yourPositions")}</h6>
                <div className="flex items-center text-body2 font-body2">
                  <span className="text-wosmongton-200">
                    {t("clPositions.yourPositionsDesc")}
                  </span>
                  <span className="flex flex-row">
                    <a
                      className="mx-1 inline-flex items-center text-wosmongton-300 underline"
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("clPositions.learnMoreAboutPools")}
                    </a>
                  </span>
                </div>
              </div>
              <Button
                className="subtitle1 w-fit"
                size="sm"
                onClick={() => {
                  setActiveModal("add-liquidity");
                }}
              >
                {t("clPositions.createAPosition")}
              </Button>
            </div>
            {!userHasPositionInPool && (
              <>
                <SuperchargeDaiOsmoPool
                  title={t("createFirstPositionCta.title")}
                  caption={t("createFirstPositionCta.caption")}
                  primaryCta={t("createFirstPositionCta.primaryCta")}
                  secondaryCta={t("createFirstPositionCta.secondaryCta")}
                  onCtaClick={() => {
                    setActiveModal("add-liquidity");
                  }}
                  onSecondaryClick={() => {
                    setActiveModal("learn-more");
                  }}
                />
                <ConcentratedLiquidityLearnMoreModal
                  isOpen={activeModal === "learn-more"}
                  onRequestClose={() => setActiveModal(null)}
                />
              </>
            )}
            <MyPositionsSection forPoolId={poolId} />
          </div>
        </section>
      </main>
    );
  });

const PoolDataGroup: FunctionComponent<{
  label: string;
  value: string;
  className?: string;
}> = ({ label, value, className }) => (
  <div className={classNames("flex flex-col gap-2", className)}>
    <div className="text-body2 font-body2 text-osmoverse-400">{label}</div>
    <h4 className="text-osmoverse-100">{value}</h4>
  </div>
);
