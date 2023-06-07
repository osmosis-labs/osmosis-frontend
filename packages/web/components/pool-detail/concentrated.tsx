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
import { useStore } from "~/stores";

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
    const { chainStore, queriesExternalStore, priceStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const config = useHistoricalAndLiquidityData(chainId, poolId);
    const t = useTranslation();
    const [activeModal, setActiveModal] = useState<"add-liquidity" | null>(
      null
    );

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
            <div className="flex flex-row">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <PoolAssetsIcon
                    className="!w-[78px]"
                    assets={pool?.poolAssets.map((poolAsset) => ({
                      coinImageUrl: poolAsset.amount.currency.coinImageUrl,
                      coinDenom: poolAsset.amount.currency.coinDenom,
                    }))}
                  />
                  <PoolAssetsName
                    size="md"
                    className="text-h5 font-h5"
                    assetDenoms={pool?.poolAssets.map(
                      (asset) => asset.amount.currency.coinDenom
                    )}
                  />
                </div>
                <div className="flex items-center">
                  <Icon id="lightning-small" height={18} width={18} />
                  <span className="text-supercharged-gradient body2">
                    {t("clPositions.supercharged")}
                  </span>
                </div>
              </div>
              <div className="flex flex-grow justify-end gap-10">
                <PoolDataGroup
                  label={t("pool.liquidity")}
                  value={poolLiquidity?.toString() ?? "0"}
                />
                <PoolDataGroup
                  label={t("pool.24hrTradingVolume")}
                  value={volume24h.toString()}
                />
                <PoolDataGroup
                  label={t("pool.swapFee")}
                  value={pool?.swapFee ? pool.swapFee.toString() : "0%"}
                />
              </div>
            </div>
            <div className="flex h-[340px] flex-row">
              <div className="flex-shrink-1 flex w-0 flex-1 flex-col gap-[20px] py-7">
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
              <div className="flex-shrink-1 flex w-[229px] flex-col">
                <div className="flex flex-col pr-8">
                  <div className="mt-7 flex h-6 justify-end gap-1">
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
                    offset={{ top: 0, right: 36, bottom: 24 + 28, left: 0 }}
                    horizontal
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-row">
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
            <MyPositionsSection forPoolId={poolId} />
          </div>
        </section>
      </main>
    );
  });

const PoolDataGroup: FunctionComponent<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-2">
    <div className="text-body2 font-body2 text-osmoverse-400">{label}</div>
    <h4 className="text-osmoverse-100">{value}</h4>
  </div>
);
