import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { FunctionComponent, useState } from "react";
import { useSearchParam } from "react-use";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import {
  ChartUnavailable,
  PriceChartHeader,
} from "~/components/chart/token-pair-historical";
import { MyPositionsSection } from "~/components/complex/my-positions-section";
import { SuperchargePool } from "~/components/funnels/concentrated-liquidity";
import Spinner from "~/components/loaders/spinner";
import { ChartButton } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { useFeatureFlags, useTranslation, useWalletSelect } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import {
  ObservableHistoricalAndLiquidityData,
  useHistoricalAndLiquidityData,
} from "~/hooks/ui-config/use-historical-and-depth-data";
import { AddLiquidityModal } from "~/modals";
import { ConcentratedLiquidityLearnMoreModal } from "~/modals/concentrated-liquidity-intro";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { getNumberMagnitude } from "~/utils/number";
import { api } from "~/utils/trpc";
import { removeQueryParam } from "~/utils/url";

import { AprBreakdownLegacy } from "../cards/apr-breakdown";
import SkeletonLoader from "../loaders/skeleton-loader";

const ConcentratedLiquidityDepthChart = dynamic(
  () => import("~/components/chart/concentrated-liquidity-depth"),
  { ssr: false }
);
const TokenPairHistoricalChart = dynamic(
  () => import("~/components/chart/token-pair-historical"),
  { ssr: false }
);

const OpenCreatePositionSearchParam = "open_create_position";

export const ConcentratedLiquidityPool: FunctionComponent<{ poolId: string }> =
  observer(({ poolId }) => {
    const { chainStore, accountStore } = useStore();
    const { t } = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();
    const { isLoading: isWalletLoading } = useWalletSelect();
    const account = accountStore.getWallet(chainStore.osmosis.chainId);
    const openCreatePosition = useSearchParam(OpenCreatePositionSearchParam);

    const chartConfig = useHistoricalAndLiquidityData(poolId);
    const [activeModal, setActiveModal] = useState<
      "add-liquidity" | "learn-more" | null
    >(null);

    const { data: superfluidPoolIds } =
      api.edge.pools.getSuperfluidPoolIds.useQuery();

    const { data: userPositions, isFetched: isUserPositionsFetched } =
      api.local.concentratedLiquidity.getUserPositions.useQuery(
        {
          userOsmoAddress: account?.address ?? "",
          forPoolId: poolId,
        },
        {
          enabled: !isWalletLoading && Boolean(account?.address),
        }
      );

    const { data: poolMarketMetrics, isLoading: isPoolMarketMetricsLoading } =
      api.edge.pools.getPoolMarketMetrics.useQuery({ poolId });

    const userHasPositionInPool = userPositions && userPositions.length > 0;

    const claimableSpreadRewardPositions = useMemo(
      () =>
        userPositions?.filter(
          ({ position }) => position.claimable_spread_rewards.length > 0
        ) ?? [],
      [userPositions]
    );
    const claimableIncentivePositions = useMemo(
      () =>
        userPositions?.filter(
          ({ position }) => position.claimable_incentives.length > 0
        ) ?? [],
      [userPositions]
    );
    const hasClaimableRewards =
      claimableSpreadRewardPositions.length > 0 ||
      claimableIncentivePositions.length > 0;

    const {
      pool,
      currentPrice,
      xRange,
      yRange,
      lastChartData,
      depthChartData,
      resetZoom,
      zoomIn,
      zoomOut,
    } = chartConfig;

    const onClickCollectAllRewards = () => {
      logEvent([EventName.ConcentratedLiquidity.claimAllRewardsClicked]);
      account!.osmosis
        .sendCollectAllPositionsRewardsMsgs(
          claimableSpreadRewardPositions.map(({ id }) => id),
          claimableIncentivePositions.map(({ id }) => id),
          undefined,
          (tx) => {
            if (!tx.code) {
              logEvent([
                EventName.ConcentratedLiquidity.claimAllRewardsCompleted,
              ]);
            }
          }
        )
        .catch(console.error);
    };

    useEffect(() => {
      if (openCreatePosition === "true") {
        setActiveModal("add-liquidity");
        removeQueryParam(OpenCreatePositionSearchParam);
      }
    }, [openCreatePosition]);

    return (
      <main className="m-auto flex min-h-screen max-w-container flex-col gap-8 bg-osmoverse-900 px-8 py-4 md:gap-4 md:p-4">
        {pool && activeModal === "add-liquidity" && (
          <AddLiquidityModal
            isOpen={true}
            poolId={pool.id}
            onRequestClose={() => setActiveModal(null)}
          />
        )}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col rounded-3xl bg-osmoverse-1000 p-8">
            <div className="flex flex-row lg:flex-col lg:gap-3">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <PoolAssetsIcon
                    className="!w-[78px]"
                    assets={pool?.reserveCoins.map((coin) => ({
                      coinImageUrl: coin.currency.coinImageUrl,
                      coinDenom: coin.currency.coinDenom,
                    }))}
                  />
                  <div className="flex flex-wrap gap-x-2">
                    <PoolAssetsName
                      size="md"
                      className="text-h5 font-h5"
                      assetDenoms={pool?.reserveCoins.map(
                        (asset) => asset.currency.coinDenom
                      )}
                    />
                    <span className="hidden py-1 text-subtitle1 text-osmoverse-100 lg:inline-block">
                      {pool?.spreadFactor ? pool.spreadFactor.toString() : "0%"}{" "}
                      {t("clPositions.spreadFactor")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-ion-400">
                    <Icon id="lightning-small" height={18} width={18} />
                    <span className="body2">
                      {t("clPositions.supercharged")}
                    </span>
                  </div>
                  {superfluidPoolIds?.includes(poolId) && (
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
                <SkeletonLoader
                  className={classNames(
                    isPoolMarketMetricsLoading ? "h-full w-32" : null
                  )}
                  isLoaded={!isPoolMarketMetricsLoading}
                >
                  {poolMarketMetrics?.volume24hUsd && (
                    <PoolDataGroup
                      label={t("pool.24hrTradingVolume")}
                      value={formatPretty(poolMarketMetrics.volume24hUsd)}
                    />
                  )}
                </SkeletonLoader>
                <PoolDataGroup
                  label={t("pool.liquidity")}
                  value={
                    pool?.totalFiatValueLocked
                      ? formatPretty(pool.totalFiatValueLocked)
                      : "0"
                  }
                />

                <div className="lg:hidden">
                  <PoolDataGroup
                    label={t("clPositions.spreadFactor")}
                    value={
                      pool?.spreadFactor ? pool.spreadFactor.toString() : "0%"
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex h-[340px] flex-row">
              <div className="flex-shrink-1 flex w-0 flex-1 flex-col gap-[20px] py-7 sm:py-3">
                {chartConfig.isHistoricalDataLoading ? (
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
                <div className="mt-8 flex flex-1 flex-col">
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
                  <h6
                    className={classNames(
                      "absolute top-[51%] right-0 max-w-[2rem] text-right",
                      {
                        caption: currentPrice.lt(new Dec(0.01)),
                      }
                    )}
                  >
                    {formatPretty(currentPrice, {
                      maxDecimals:
                        getNumberMagnitude(Number(currentPrice.toString())) <=
                        -3
                          ? 0
                          : 2,
                      scientificMagnitudeThreshold: 3,
                    })}
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
                <Button
                  className="subtitle1 w-fit"
                  onClick={onClickCollectAllRewards}
                  disabled={!hasClaimableRewards}
                >
                  {t("clPositions.collectAllRewards")}
                </Button>

                <Button
                  variant="outline"
                  className="subtitle1 w-fit"
                  onClick={() => {
                    setActiveModal("add-liquidity");
                  }}
                >
                  {t("clPositions.createAPosition")}
                </Button>
              </div>
            </div>
            {!userHasPositionInPool && isUserPositionsFetched && (
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
    const { t } = useTranslation();
    const featureFlags = useFeatureFlags();

    const concentratedPoolDetail =
      derivedDataStore.concentratedPoolDetails.get(poolId);

    const hasIncentives = concentratedPoolDetail.incentiveGauges.length > 0;

    return (
      <div className="flex flex-wrap gap-4">
        <div className="flex shrink-0 items-center gap-8 rounded-3xl bg-osmoverse-1000 px-8 py-7">
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
        {featureFlags.aprBreakdown && (
          <AprBreakdownLegacy
            className="shrink-0 rounded-3xl bg-osmoverse-1000"
            poolId={poolId}
            showDisclaimerTooltip
          />
        )}

        {hasIncentives && (
          <div className="flex h-full w-full flex-col place-content-between items-center rounded-3xl bg-osmoverse-1000 px-8 py-7">
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
