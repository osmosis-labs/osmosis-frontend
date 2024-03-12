import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import moment from "dayjs";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import React, {
  ComponentProps,
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { FallbackImg } from "~/components/assets";
import { ArrowButton, Button } from "~/components/buttons";
import { ChartButton } from "~/components/buttons";
import {
  ChartUnavailable,
  PriceChartHeader,
} from "~/components/chart/token-pair-historical";
import { Spinner } from "~/components/loaders";
import { CustomClasses } from "~/components/types";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import {
  ObservableHistoricalAndLiquidityData,
  useHistoricalAndLiquidityData,
} from "~/hooks/ui-config/use-historical-and-depth-data";
import { useConst } from "~/hooks/use-const";
import { SuperfluidValidatorModal } from "~/modals";
import { IncreaseConcentratedLiquidityModal } from "~/modals/increase-concentrated-liquidity";
import { RemoveConcentratedLiquidityModal } from "~/modals/remove-concentrated-liquidity";
import type {
  PositionHistoricalPerformance,
  UserPosition,
  UserPositionDetails,
} from "~/server/queries/complex/concentrated-liquidity";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { RouterOutputs } from "~/utils/trpc";

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
  position: UserPosition;
  positionDetails: UserPositionDetails | undefined;
  positionPerformance: PositionHistoricalPerformance | undefined;
  showLinkToPool?: boolean;
}> = observer(
  ({
    poolId,
    position,
    showLinkToPool = false,
    positionDetails,
    positionPerformance,
  }) => {
    const {
      chainStore: {
        osmosis: { chainId },
      },
      accountStore,
    } = useStore();

    const { logEvent } = useAmplitudeAnalytics();

    const account = accountStore.getWallet(chainId);

    const {
      position: rawPosition,
      priceRange: [lowerPrice, upperPrice],
      isFullRange,
      currentCoins,
      currentValue,
    } = position;

    const {
      currentPrice,
      status,
      unbondEndTime,
      isPoolSuperfluid,
      superfluidApr,
      superfluidData,
    } = positionDetails ?? {};

    const {
      claimableRewardCoins,
      claimableRewardsValue,
      principalCoins,
      principalValue,
      totalRewardCoins,
      totalEarnedValue,
    } = positionPerformance ?? {};

    const { t } = useTranslation();
    const router = useRouter();

    const [activeModal, setActiveModal] = useState<
      "increase" | "remove" | null
    >(null);

    const chartConfig = useHistoricalAndLiquidityData(poolId);
    const {
      xRange,
      yRange,
      depthChartData,
      resetZoom,
      zoomIn,
      zoomOut,
      setPriceRange,
    } = chartConfig;

    const [selectSfValidatorAddress, setSelectSfValidatorAddress] =
      useState<boolean>(false);

    useEffect(() => {
      if (lowerPrice && upperPrice) {
        setPriceRange([lowerPrice, upperPrice]);
      }
    }, [lowerPrice, upperPrice, setPriceRange]);

    const sendCollectAllRewardsMsg = useCallback(() => {
      logEvent([EventName.ConcentratedLiquidity.collectRewardsClicked]);
      const hasSpreadRewards = rawPosition.claimable_spread_rewards.length > 0;
      const hasIncentiveRewards = rawPosition.claimable_incentives.length > 0;
      account!.osmosis
        .sendCollectAllPositionsRewardsMsgs(
          hasSpreadRewards ? [rawPosition.position.position_id] : [],
          hasIncentiveRewards ? [rawPosition.position.position_id] : [],
          undefined,
          (tx) => {
            if (!tx.code) {
              logEvent([
                EventName.ConcentratedLiquidity.collectRewardsCompleted,
              ]);
            }
          }
        )
        .catch(console.error);
    }, [account, logEvent, rawPosition]);

    return (
      <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex w-full gap-1 xl:hidden">
          <div className="flex h-[20.1875rem] flex-grow flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-7 pl-6">
            {chartConfig.isHistoricalDataLoading ? (
              <Spinner className="m-auto" />
            ) : !chartConfig.historicalChartUnavailable ? (
              <>
                <ChartHeader config={chartConfig} />
                <Chart config={chartConfig} position={position} />
              </>
            ) : (
              <ChartUnavailable />
            )}
          </div>
          <div className="flex h-[20.1875rem] w-80 rounded-r-2xl bg-osmoverse-700">
            <div className="mt-[84px] flex flex-1 flex-col">
              <ConcentratedLiquidityDepthChart
                yRange={yRange}
                xRange={xRange}
                data={depthChartData}
                annotationDatum={useMemo(
                  () => ({
                    price: Number(currentPrice?.toString()),
                    depth: xRange[1],
                  }),
                  [currentPrice, xRange]
                )}
                rangeAnnotation={useMemo(
                  () => [
                    {
                      price: Number(lowerPrice.toString()),
                      depth: xRange[1],
                    },
                    {
                      price: Number(upperPrice.toString()),
                      depth: xRange[1],
                    },
                  ],
                  [lowerPrice, upperPrice, xRange]
                )}
                offset={useConst({
                  top: 0,
                  right: 36,
                  bottom: 24 + 28,
                  left: 0,
                })}
                horizontal
                fullRange={isFullRange}
              />
            </div>
            <div className="mb-8 flex flex-col pr-2">
              <div className="mt-7 mr-6 flex h-6 gap-1">
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
              <div className="flex h-full flex-col justify-between py-4">
                <PriceBox
                  currentValue={formatPretty(upperPrice, {
                    scientificMagnitudeThreshold: 4,
                  })}
                  label={t("clPositions.maxPrice")}
                  infinity={isFullRange}
                />
                <PriceBox
                  currentValue={
                    isFullRange
                      ? "0"
                      : formatPretty(lowerPrice, {
                          scientificMagnitudeThreshold: 4,
                        })
                  }
                  label={t("clPositions.minPrice")}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-col">
          <div className="flex flex-wrap justify-between gap-3 sm:flex-col">
            <AssetsInfo
              className="flex-1 sm:w-full"
              title={t("clPositions.currentAssets")}
              assets={currentCoins}
              totalValue={currentValue}
            />
            <AssetsInfo
              className="flex-1 sm:w-full"
              title={t("clPositions.totalRewardsEarned")}
              assets={totalRewardCoins}
              totalValue={totalEarnedValue}
              emptyText={t("clPositions.noRewards")}
            />
          </div>
          <div className="flex flex-wrap justify-between gap-3 sm:flex-col">
            {(principalCoins?.length ?? 0) < 1 &&
            positionPerformance ? undefined : (
              <AssetsInfo
                className="flex-1 sm:w-full"
                title={t("clPositions.principalAssets")}
                assets={principalCoins}
                totalValue={principalValue}
              />
            )}
            <AssetsInfo
              className="flex-1 sm:w-full"
              title={t("clPositions.unclaimedRewards")}
              assets={claimableRewardCoins}
              totalValue={claimableRewardsValue}
              emptyText={t("clPositions.noRewards")}
            />
          </div>
          {unbondEndTime && !superfluidData && (
            <div className="flex flex-wrap justify-between gap-3 sm:flex-col">
              <div className="flex flex-col text-right md:pl-4">
                <span>
                  {t("clPositions.unbondingFromNow", {
                    fromNow: moment(unbondEndTime).fromNow(true),
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
        {superfluidData && <SuperfluidPositionInfo {...superfluidData} />}
        <div className="mt-4 flex flex-row flex-wrap justify-end gap-5 sm:flex-wrap sm:justify-start">
          {showLinkToPool && (
            <ArrowButton
              className="md:ml-auto"
              onClick={() => router.push(`/pool/${poolId}`)}
            >
              {t("clPositions.goToPool", { poolId })}
            </ArrowButton>
          )}
          {isFullRange &&
            isPoolSuperfluid &&
            !superfluidData &&
            superfluidApr &&
            account &&
            status !== "unbonding" && (
              <>
                <button
                  className="w-fit rounded-[10px] bg-superfluid py-[2px] px-[2px] md:ml-auto"
                  onClick={() => {
                    setSelectSfValidatorAddress(true);
                  }}
                >
                  <div className="w-full rounded-[9px] bg-osmoverse-800 px-3 py-[6px] md:px-2">
                    <span className="text-superfluid-gradient">
                      {t("pool.superfluidEarnMore", {
                        rate: superfluidApr.maxDecimals(1).toString(),
                      })}
                    </span>
                  </div>
                </button>
                {selectSfValidatorAddress && (
                  <SuperfluidValidatorModal
                    isOpen={selectSfValidatorAddress}
                    onRequestClose={() => setSelectSfValidatorAddress(false)}
                    onSelectValidator={(validatorAddress) => {
                      account.osmosis
                        .sendStakeExistingPositionMsg(
                          position.id,
                          validatorAddress
                        )
                        .catch(console.error);
                      setSelectSfValidatorAddress(false);
                    }}
                  />
                )}
              </>
            )}
          <PositionButton
            disabled={
              claimableRewardCoins?.length === 0 ||
              Boolean(account?.txTypeInProgress) ||
              !Boolean(account)
            }
            onClick={sendCollectAllRewardsMsg}
          >
            {t("clPositions.collectRewards")}
          </PositionButton>
          <PositionButton
            disabled={
              !status ||
              Boolean(account?.txTypeInProgress) ||
              Boolean(superfluidData?.undelegationEndTime) ||
              status === "unbonding" ||
              !Boolean(account)
            }
            onClick={useCallback(() => {
              if (superfluidData?.delegationLockId) {
                account!.osmosis
                  .sendBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
                    [
                      {
                        lockId: superfluidData.delegationLockId,
                        isSynthetic: true,
                      },
                    ]
                  )
                  .catch(console.error);
              } else setActiveModal("remove");
            }, [account, superfluidData])}
          >
            {Boolean(superfluidData?.delegationLockId)
              ? t("clPositions.unstake")
              : t("clPositions.removeLiquidity")}
          </PositionButton>
          <PositionButton
            disabled={
              !status ||
              Boolean(account?.txTypeInProgress) ||
              Boolean(superfluidData?.undelegationEndTime) ||
              status === "unbonding"
            }
            onClick={useCallback(() => setActiveModal("increase"), [])}
          >
            {t("clPositions.increaseLiquidity")}
          </PositionButton>

          {activeModal === "increase" && !!status && (
            <IncreaseConcentratedLiquidityModal
              isOpen={true}
              poolId={poolId}
              position={position}
              status={status}
              onRequestClose={() => setActiveModal(null)}
            />
          )}
          {activeModal === "remove" && !!status && claimableRewardCoins && (
            <RemoveConcentratedLiquidityModal
              isOpen={true}
              poolId={poolId}
              position={position}
              onRequestClose={() => setActiveModal(null)}
              claimableRewardCoins={claimableRewardCoins}
              status={status}
            />
          )}
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
      className="text-white w-fit whitespace-nowrap rounded-lg border-2 border-wosmongton-400 bg-transparent py-4 px-5 text-subtitle1 font-subtitle1 hover:border-wosmongton-300 disabled:border-osmoverse-600 disabled:text-osmoverse-400 md:ml-auto"
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
    totalValue?: PricePretty;
    emptyText?: string;
  } & CustomClasses
> = observer(({ className, title, assets = [], totalValue, emptyText }) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(
        "subtitle1 flex flex-col gap-2 text-osmoverse-400",
        className
      )}
    >
      <div>{title}</div>
      {assets.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <div className="flex flex-wrap gap-x-5 gap-y-3">
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
                  <span className="whitespace-nowrap">
                    {formatPretty(asset, { maxDecimals: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            {totalValue && (
              <div className="text-white-full">({totalValue.toString()})</div>
            )}
          </div>
        </div>
      ) : emptyText ? (
        <span className="italic">{t("clPositions.checkBackForRewards")}</span>
      ) : null}
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
      <div className="flex items-center">
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
    />
  );
});

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const Chart: FunctionComponent<{
  config: ObservableHistoricalAndLiquidityData;
  position: UserPosition;
}> = observer(({ config, position: { isFullRange } }) => {
  const { historicalChartData, yRange, setHoverPrice, lastChartData, range } =
    config;

  return (
    <TokenPairHistoricalChart
      data={historicalChartData}
      annotations={
        isFullRange
          ? [new Dec((yRange[0] || 0) * 1.05), new Dec((yRange[1] || 0) * 0.95)]
          : range || []
      }
      domain={yRange}
      onPointerHover={(price) => setHoverPrice(price)}
      onPointerOut={
        lastChartData ? () => setHoverPrice(lastChartData.close) : undefined
      }
    />
  );
});

const SuperfluidPositionInfo: FunctionComponent<
  RouterOutputs["local"]["concentratedLiquidity"]["getPositionDetails"]["superfluidData"]
> = (props) => {
  const {
    validatorName,
    validatorImgSrc,
    equivalentStakedAmount,
    validatorCommission,
    superfluidApr,
    humanizedStakeDuration,
  } = props;
  const { t } = useTranslation();

  /** is undelegation */
  const endTime = props.undelegationEndTime;

  return (
    <div className="subtitle1 flex w-full flex-col gap-4 md:gap-1">
      <span className="text-osmoverse-400">
        {t("clPositions.superfluidValidator")}
      </span>
      <div className="flex items-center gap-3">
        <FallbackImg // don't use next/image because we may not know what origin the image is on, next.config.js requires listed origins
          className="rounded-full"
          src={validatorImgSrc}
          fallbacksrc="/icons/profile.svg"
          height={50}
          width={50}
        />
        <div className="md:caption flex flex-col">
          <span>{validatorName}</span>
          <span>~{equivalentStakedAmount.trim(true).toString()}</span>
        </div>
        <div className="md:caption flex flex-col pl-8 text-right md:pl-4">
          <span className="text-superfluid-gradient">
            +{superfluidApr.maxDecimals(2).toString()} {t("pool.APR")}
          </span>
          {validatorCommission && (
            <span>
              {validatorCommission?.toString()}{" "}
              {t("clPositions.superfluidCommission")}
            </span>
          )}
        </div>
        <div className="md:caption flex flex-col pl-8 text-right md:pl-4">
          {endTime ? (
            <span>
              {t("clPositions.superfluidUnstaking", {
                fromNow: moment(endTime).fromNow(true),
              })}
            </span>
          ) : (
            <span>
              {t("clPositions.superfluidUnstake", {
                duration: humanizedStakeDuration ?? "",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
