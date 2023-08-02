import { Dec, IntPretty, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { Button } from "~/components/buttons";
import { ChartButton } from "~/components/buttons";
import {
  ChartUnavailable,
  PriceChartHeader,
} from "~/components/chart/token-pair-historical";
import { MyPositionsSection } from "~/components/complex/my-positions-section";
import { SuperchargePool } from "~/components/funnels/concentrated-liquidity";
import Spinner from "~/components/spinner";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { AddLiquidityModal } from "~/modals";
import { ConcentratedLiquidityLearnMoreModal } from "~/modals/concentrated-liquidity-intro";
import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/derived-data";
import { formatPretty } from "~/utils/formatter";

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
      derivedDataStore,
    } = useStore();
    const { chainId } = chainStore.osmosis;
    const chartConfig = useHistoricalAndLiquidityData(chainId, poolId);
    const t = useTranslation();
    const [activeModal, setActiveModal] = useState<
      "add-liquidity" | "learn-more" | null
    >(null);

    const { logEvent } = useAmplitudeAnalytics();
    const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId)
      .osmosis!;
    const account = accountStore.getWallet(chainStore.osmosis.chainId);

    // initialize pool data stores once root pool store is loaded
    const { superfluidPoolDetail } =
      typeof poolId === "string" && Boolean(poolId)
        ? derivedDataStore.getForPool(poolId as string)
        : {
            superfluidPoolDetail: undefined,
          };

    const {
      pool,
      xRange,
      yRange,
      lastChartData,
      depthChartData,
      resetZoom,
      zoomIn,
      zoomOut,
    } = chartConfig;

    const volume24h =
      queriesExternalStore.queryGammPoolFeeMetrics.getPoolFeesMetrics(
        poolId,
        priceStore
      ).volume24h;
    const poolLiquidity = pool?.computeTotalValueLocked(priceStore);

    const currentPrice = pool?.concentratedLiquidityPoolInfo
      ? pool.concentratedLiquidityPoolInfo.currentPrice
      : undefined;

    const userPositions = osmosisQueries.queryAccountsPositions.get(
      account?.address ?? ""
    ).positions;

    const userPositionsInPool = userPositions.filter(
      (position) => position.poolId === poolId
    );
    const userHasPositionInPool = userPositionsInPool.length > 0;

    const rewardedPositions = userPositions.filter(
      (position) => position.hasClaimableRewards
    );

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
                      {t("clPositions.spreadFactor")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-ion-400 flex items-center gap-1.5">
                    <Icon id="lightning-small" height={18} width={18} />
                    <span className="body2">
                      {t("clPositions.supercharged")}
                    </span>
                  </div>
                  {superfluidPoolDetail?.isSuperfluid && (
                    <span className="body2 text-supercharged-gradient flex items-center gap-1.5">
                      <Image
                        alt=""
                        src="/icons/superfluid-osmo.svg"
                        height={18}
                        width={18}
                      />
                      {t("pool.superfluidEnabled")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-grow justify-end gap-10 lg:justify-start xs:flex-col xs:gap-4">
                <PoolDataGroup
                  label={t("pool.liquidity")}
                  value={poolLiquidity ? formatPretty(poolLiquidity) : "0"}
                />
                <PoolDataGroup
                  label={t("pool.24hrTradingVolume")}
                  value={formatPretty(volume24h)}
                />

                <div className="lg:hidden">
                  <PoolDataGroup
                    label={t("clPositions.spreadFactor")}
                    value={pool?.swapFee ? pool.swapFee.toString() : "0%"}
                  />
                </div>
              </div>
            </div>
            <div className="flex h-[340px] flex-row">
              <div className="flex-shrink-1 flex w-0 flex-1 flex-col gap-[20px] py-7 sm:py-3">
                {chartConfig.queryTokenPairPrice.isFetching ? (
                  <Spinner className="m-auto" />
                ) : !chartConfig.historicalChartUnavailable ? (
                  <>
                    <ChartHeader config={chartConfig} />
                    <Chart config={chartConfig} />
                  </>
                ) : (
                  <ChartUnavailable />
                )}
              </div>

              <div className="flex-shrink-1 relative flex w-[229px] flex-col">
                <div className="mt-7 flex h-6 justify-end gap-1 pr-8 sm:pr-0">
                  <ChartButton
                    alt="refresh"
                    icon="refresh-ccw"
                    selected={false}
                    onClick={() => resetZoom()}
                  />
                  <ChartButton
                    alt="zoom out"
                    icon="zoom-out"
                    selected={false}
                    onClick={zoomOut}
                  />
                  <ChartButton
                    alt="zoom in"
                    icon="zoom-in"
                    selected={false}
                    onClick={zoomIn}
                  />
                </div>
                <div className="mt-[32px] flex flex-1 flex-col">
                  <ConcentratedLiquidityDepthChart
                    yRange={yRange}
                    xRange={xRange}
                    data={depthChartData}
                    annotationDatum={{
                      price: currentPrice
                        ? Number(currentPrice.toString())
                        : lastChartData?.close ?? 0,
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
                    {new IntPretty(currentPrice).maxDecimals(2).toString()}
                  </h6>
                )}
              </div>
            </div>
          </div>
          <UserAssetsAndExternalIncentives poolId={poolId} />
          <div className="flex flex-col gap-8">
            <div className="flex flex-row md:flex-wrap md:gap-y-4">
              <div className="flex flex-grow flex-col gap-3">
                <h6>{t("clPositions.yourPositions")}</h6>
                <div className="flex items-center text-body2 font-body2">
                  <span className="text-osmoverse-200">
                    {t("clPositions.yourPositionsDesc")}
                  </span>
                  {/* <span className="flex flex-row">
                    <a
                      className="mx-1 inline-flex items-center text-wosmongton-300 underline"
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("clPositions.learnMoreAboutPools")}
                    </a>
                  </span> */}
                </div>
              </div>
              <div className="flex gap-2">
                {account && rewardedPositions.length > 0 && (
                  <Button
                    className="subtitle1 w-fit"
                    size="sm"
                    onClick={() => {
                      const fiat = priceStore.getFiatCurrency(
                        priceStore.defaultVsCurrency
                      );

                      const rewardAmountUSD = rewardedPositions.reduce(
                        (acc, { totalClaimableRewards }) => {
                          const totalValue =
                            totalClaimableRewards.length > 0 && fiat
                              ? totalClaimableRewards.reduce(
                                  (sum, asset) =>
                                    sum.add(
                                      priceStore.calculatePrice(asset) ??
                                        new PricePretty(fiat, 0)
                                    ),
                                  new PricePretty(fiat, 0)
                                )
                              : undefined;
                          acc += Number(totalValue?.toDec().toString() ?? 0);
                          return acc;
                        },
                        0
                      );

                      const liquidityUSD = poolLiquidity
                        ? Number(poolLiquidity?.toDec().toString())
                        : undefined;
                      const poolName = pool?.poolAssets
                        ?.map((poolAsset) => poolAsset.amount.denom)
                        .join(" / ");
                      const positionCount = userPositionsInPool.length;

                      logEvent([
                        EventName.ConcentratedLiquidity.claimAllRewardsClicked,
                        {
                          liquidityUSD,
                          poolId: pool?.id,
                          poolName,
                          positionCount,
                          rewardAmountUSD,
                        },
                      ]);
                      account.osmosis
                        .sendCollectAllPositionsRewardsMsgs(
                          rewardedPositions.map(({ id }) => id),
                          true,
                          undefined,
                          (tx) => {
                            if (!tx.code) {
                              logEvent([
                                EventName.ConcentratedLiquidity
                                  .claimAllRewardsCompleted,
                                {
                                  liquidityUSD,
                                  poolId: pool?.id,
                                  poolName,
                                  positionCount,
                                  rewardAmountUSD,
                                },
                              ]);
                            }
                          }
                        )
                        .catch(console.error);
                    }}
                  >
                    {t("clPositions.collectAllRewards")}
                  </Button>
                )}
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
            </div>
            {!userHasPositionInPool && (
              <>
                <SuperchargePool
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

/**
 * Create a nested component to prevent unnecessary re-rendering whenever the hover price changes.
 */
const ChartHeader: FunctionComponent<{
  config: ObservableHistoricalAndLiquidityData;
}> = observer(({ config }) => {
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
      classes={{
        buttons: "sm:hidden",
        pricesHeaderContainerClass: "sm:flex-col",
      }}
    />
  );
});

/**
 * Create a nested component to prevent unnecessary re-rendering whenever the hover price changes.
 */
const Chart: FunctionComponent<{
  config: ObservableHistoricalAndLiquidityData;
}> = observer(({ config }) => {
  const { historicalChartData, yRange, setHoverPrice, lastChartData } = config;

  return (
    <TokenPairHistoricalChart
      data={historicalChartData}
      annotations={[]}
      domain={yRange}
      onPointerHover={setHoverPrice}
      onPointerOut={() => {
        if (lastChartData) {
          setHoverPrice(Number(lastChartData.close));
        }
      }}
    />
  );
});

const UserAssetsAndExternalIncentives: FunctionComponent<{ poolId: string }> =
  observer(({ poolId }) => {
    const { derivedDataStore } = useStore();
    const t = useTranslation();

    const concentratedPoolDetail =
      derivedDataStore.concentratedPoolDetails.get(poolId);

    const hasIncentives = concentratedPoolDetail.incentiveGauges.length > 0;

    return (
      <div className="flex h-40 gap-4">
        <div className="flex shrink-0 items-center gap-8 rounded-[28px] bg-osmoverse-1000 px-8 py-7">
          <div className="flex h-full flex-col place-content-between">
            <span className="body2 text-osmoverse-300">
              {t("clPositions.totalBalance")}
            </span>
            <div>
              <h4 className="text-osmoverse-100">
                {concentratedPoolDetail.userPoolValue.toString()}
              </h4>
              <span className="subtitle1 text-osmoverse-300">
                {concentratedPoolDetail.userPositions.length === 1
                  ? t("clPositions.onePosition")
                  : t("clPositions.numPositions", {
                      numPositions:
                        concentratedPoolDetail.userPositions.length.toString(),
                    })}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            {concentratedPoolDetail.userPoolAssets.map(({ asset }) => (
              <div className="subtitle1 flex gap-2" key={asset.denom}>
                {asset.currency.coinImageUrl && (
                  <Image
                    alt="token-icon"
                    src={asset.currency.coinImageUrl}
                    width={20}
                    height={20}
                  />
                )}
                <span className="text-osmoverse-300">{asset.denom}</span>
                <span className="text-osmoverse-100">
                  {formatPretty(asset, { maxDecimals: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
        {hasIncentives && (
          <div className="flex h-full w-full flex-col place-content-between items-center rounded-[28px] bg-osmoverse-1000 px-8 py-7">
            <span className="body2 mr-auto text-osmoverse-300">
              {t("pool.incentives")}
            </span>
            <div className="flex w-full items-center">
              {concentratedPoolDetail.incentiveGauges.map((incentive) => (
                <div
                  className="flex items-center gap-3"
                  key={incentive.coinPerDay.denom}
                >
                  <div className="flex items-center gap-1">
                    {incentive.apr && (
                      <span className="subtitle1 text-osmoverse-100">
                        +{incentive.apr.maxDecimals(0).toString()}
                      </span>
                    )}
                    {incentive.coinPerDay.currency.coinImageUrl && (
                      <Image
                        alt="token-icon"
                        src={incentive.coinPerDay.currency.coinImageUrl}
                        width={20}
                        height={20}
                      />
                    )}
                  </div>
                  <div className="subtitle1 flex flex-col gap-1 text-osmoverse-300">
                    <span>
                      {t("pool.dailyEarnAmount", {
                        amount: formatPretty(incentive.coinPerDay, {
                          maxDecimals: 2,
                        }),
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <span className="caption mr-auto text-osmoverse-500">
              *{t("pool.onlyInRangePositions")}
            </span>
          </div>
        )}
      </div>
    );
  });
