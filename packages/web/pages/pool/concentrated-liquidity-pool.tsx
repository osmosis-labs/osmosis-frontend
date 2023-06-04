import { Int } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { Button } from "~/components/buttons";
import { PriceChartHeader } from "~/components/chart/token-pair-historical";
import ChartButton from "~/components/chart-button";
import MyPositionCard from "~/components/my-position-card";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { AddLiquidityModal } from "~/modals";
import { useStore } from "~/stores";
import { ObservableMergedPositionByAddress } from "~/stores/derived-data";

const ConcentratedLiquidityDepthChart = dynamic(
  () => import("~/components/chart/concentrated-liquidity-depth"),
  { ssr: false }
);
const TokenPairHistoricalChart = dynamic(
  () => import("~/components/chart/token-pair-historical"),
  { ssr: false }
);

const ConcentratedLiquidityPool: FunctionComponent<{ poolId: string }> =
  observer(({ poolId }) => {
    const { chainStore, accountStore, derivedDataStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const account = accountStore.getAccount(chainId);
    const config = useHistoricalAndLiquidityData(chainId, poolId);
    const t = useTranslation();
    const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);

    const [queryAddress, setQueryAddress] =
      useState<ObservableMergedPositionByAddress | null>(null);

    useEffect(() => {
      (async () => {
        if (!account.bech32Address) return;

        setQueryAddress(
          derivedDataStore.mergedPositionsByAddress.get(account.bech32Address)
        );
      })();
    }, [account.bech32Address]);

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

    if (!queryAddress) return null;

    const len = Object.keys(queryAddress.mergedRanges).length;

    if (!len) return null;

    return (
      <main className="m-auto flex min-h-screen max-w-[1221px] flex-col gap-8 bg-osmoverse-900 p-8 md:gap-4 md:p-4">
        <Head>
          <title>
            {t("pool.title", { id: poolId ? poolId.toString() : "-" })}
          </title>
        </Head>
        {pool && showAddLiquidityModal && (
          <AddLiquidityModal
            isOpen={true}
            poolId={pool.id}
            onRequestClose={() => setShowAddLiquidityModal(false)}
          />
        )}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col rounded-[28px] bg-osmoverse-1000 p-8">
            <div className="flex flex-row">
              <div className="flex flex-col gap-3">
                <div className="flex flex-row items-center gap-2">
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
                <div>
                  <span className="text-supercharged-gradient text-body2 font-body2 ">
                    {t("clPositions.supercharged")}
                  </span>
                </div>
              </div>
              <div className="flex flex-grow flex-row justify-end gap-10">
                <PoolDataGroup label={t("pool.liquidity")} value="$0.00" />
                <PoolDataGroup
                  label={t("pool.24hrTradingVolume")}
                  value="$0.00"
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
                  <div className="mt-7 flex h-6 flex-row justify-end gap-1">
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
                <div className="flex flex-row items-center text-body2 font-body2">
                  <span className="text-wosmongton-200">
                    {t("clPositions.yourPositionsDesc")}
                  </span>
                  <span className="flex flex-row">
                    <a
                      className="mx-1 inline-flex flex-row items-center text-wosmongton-300 underline"
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("clPositions.learnMoreAboutPools")}
                    </a>
                    <img src="/icons/arrow-right.svg" alt="learn more" />
                  </span>
                </div>
              </div>
              <Button
                className="w-fit text-subtitle1 font-subtitle1"
                size="sm"
                onClick={() => setShowAddLiquidityModal(true)}
              >
                {t("clPositions.createAPosition")}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {queryAddress.mergedRanges.map((mergedId, index) => {
              const [poolId, lowerTick, upperTick] = mergedId.split("_");
              const { positionIds, baseAmount, quoteAmount, passive } =
                queryAddress?.calculateMergedPosition(
                  poolId,
                  lowerTick,
                  upperTick
                );
              return (
                <MyPositionCard
                  key={index}
                  poolId={poolId}
                  lowerTick={new Int(lowerTick)}
                  upperTick={new Int(upperTick)}
                  positionIds={positionIds}
                  baseAmount={baseAmount}
                  quoteAmount={quoteAmount}
                  passive={passive}
                />
              );
            })}
          </div>
        </section>
      </main>
    );
  });

export default ConcentratedLiquidityPool;

function PoolDataGroup(props: { label: string; value: string }): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-body2 font-body2 text-osmoverse-400">
        {props.label}
      </div>
      <h4 className="text-osmoverse-100">{props.value}</h4>
    </div>
  );
}
