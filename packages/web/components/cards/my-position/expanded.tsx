import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import {
  ObservableQueryLiquidityPositionById,
  ObservableSuperfluidPoolDetail,
} from "@osmosis-labs/stores";
import classNames from "classnames";
import moment from "dayjs";
import { Duration } from "dayjs/plugin/duration";
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
import { useTranslation } from "react-multi-lang";

import { FallbackImg } from "~/components/assets";
import { ArrowButton, Button } from "~/components/buttons";
import { ChartButton } from "~/components/buttons";
import { PriceChartHeader } from "~/components/chart/token-pair-historical";
import { CustomClasses } from "~/components/types";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { SuperfluidValidatorModal } from "~/modals";
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
  showLinkToPool?: boolean;
}> = observer(
  ({
    poolId,
    chartConfig,
    position: positionConfig,
    showLinkToPool = false,
  }) => {
    const {
      chainStore: {
        osmosis: { chainId },
      },
      accountStore,
      queriesStore,
      derivedDataStore,
      queriesExternalStore,
      priceStore,
    } = useStore();

    const { logEvent } = useAmplitudeAnalytics();

    const account = accountStore.getWallet(chainId);
    const osmosisQueries = queriesStore.get(chainId).osmosis!;
    const queryPool = osmosisQueries.queryPools.getPool(poolId);
    const derivedPoolData = derivedDataStore.getForPool(poolId);
    const superfluidPoolDetail = derivedPoolData?.superfluidPoolDetail;

    const currentPrice = queryPool?.concentratedLiquidityPoolInfo?.currentPrice;

    const superfluidDelegation = superfluidPoolDetail.getDelegatedPositionInfo(
      positionConfig.id
    );

    const superfluidUndelegation =
      superfluidPoolDetail.getUndelegatingPositionInfo(positionConfig.id);

    const queryPositionMetrics =
      queriesExternalStore.queryPositionsPerformaceMetrics.get(
        positionConfig.id
      );

    const unbondInfo = osmosisQueries.queryAccountsUnbondingPositions
      .get(account?.address ?? "")
      .getPositionUnbondingInfo(positionConfig.id);
    const isUnbonding = Boolean(unbondInfo);

    const {
      xRange,
      yRange,
      lastChartData,
      depthChartData,
      resetZoom,
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
    const router = useRouter();

    const [activeModal, setActiveModal] = useState<
      "increase" | "remove" | null
    >(null);

    const [selectSfValidatorAddress, setSelectSfValidatorAddress] =
      useState<boolean>(false);

    useEffect(() => {
      if (lowerPrices?.price && upperPrices?.price) {
        setPriceRange([lowerPrices.price, upperPrices.price]);
      }
    }, [lowerPrices, upperPrices, setPriceRange]);

    const sendCollectAllRewardsMsg = useCallback(() => {
      const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

      const rewardAmountUSD =
        positionConfig.totalClaimableRewards.length > 0 && fiat
          ? Number(
              positionConfig.totalClaimableRewards
                .reduce(
                  (sum, asset) =>
                    sum.add(
                      priceStore.calculatePrice(asset) ??
                        new PricePretty(fiat, 0)
                    ),
                  new PricePretty(fiat, 0)
                )
                .toDec()
                .toString()
            )
          : undefined;

      const poolLiquidity = queryPool?.computeTotalValueLocked(priceStore);
      const liquidityUSD = poolLiquidity
        ? Number(poolLiquidity?.toDec().toString())
        : undefined;

      const poolName = queryPool?.poolAssets
        ?.map((poolAsset) => poolAsset.amount.denom)
        .join(" / ");
      const positionId = positionConfig.id;

      logEvent([
        EventName.ConcentratedLiquidity.collectRewardsClicked,
        {
          liquidityUSD,
          poolId,
          poolName,
          positionId,
          rewardAmountUSD,
        },
      ]);
      account!.osmosis
        .sendCollectAllPositionsRewardsMsgs(
          [positionConfig.id],
          undefined,
          undefined,
          (tx) => {
            if (!tx.code) {
              logEvent([
                EventName.ConcentratedLiquidity.collectRewardsCompleted,
                {
                  liquidityUSD,
                  poolId,
                  poolName,
                  positionId,
                  rewardAmountUSD,
                },
              ]);
            }
          }
        )
        .then(() => {})
        .catch(console.error);
    }, [
      account,
      logEvent,
      poolId,
      positionConfig.id,
      positionConfig.totalClaimableRewards,
      priceStore,
      queryPool,
    ]);

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
        <div className="flex w-full gap-1 xl:hidden">
          <div className="flex h-[20.1875rem] flex-grow flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-7 pl-6">
            <ChartHeader config={chartConfig} />
            <Chart config={chartConfig} positionConfig={positionConfig} />
          </div>
          <div className="flex h-[20.1875rem] w-80 rounded-r-2xl bg-osmoverse-700">
            <div className="mt-[84px] flex flex-1 flex-col">
              <ConcentratedLiquidityDepthChart
                yRange={yRange}
                xRange={xRange}
                data={depthChartData}
                annotationDatum={useMemo(
                  () => ({
                    price: currentPrice
                      ? Number(currentPrice.toString())
                      : lastChartData?.close || 0,
                    depth: xRange[1],
                  }),
                  [currentPrice, lastChartData, xRange]
                )}
                rangeAnnotation={useMemo(
                  () => [
                    {
                      price: Number(lowerPrices?.price.toString() ?? 0),
                      depth: xRange[1],
                    },
                    {
                      price: Number(upperPrices?.price.toString() ?? 0),
                      depth: xRange[1],
                    },
                  ],
                  [lowerPrices, upperPrices, xRange]
                )}
                offset={useMemo(
                  () => ({ top: 0, right: 36, bottom: 24 + 28, left: 0 }),
                  []
                )}
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
                  currentValue={
                    isFullRange
                      ? "0"
                      : formatPretty(upperPrices?.price ?? new Dec(0), {
                          scientificMagnitudeThreshold: 4,
                        })
                  }
                  label={t("clPositions.maxPrice")}
                  infinity={isFullRange}
                />
                <PriceBox
                  currentValue={
                    isFullRange
                      ? "0"
                      : formatPretty(lowerPrices?.price ?? new Dec(0), {
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
              assets={useMemo(
                () =>
                  [baseAsset, quoteAsset].filter((asset): asset is CoinPretty =>
                    Boolean(asset)
                  ),
                [baseAsset, quoteAsset]
              )}
            />
            <AssetsInfo
              className="flex-1 sm:w-full"
              title={t("clPositions.totalRewardsEarned")}
              assets={queryPositionMetrics.totalEarned}
              totalValue={queryPositionMetrics.totalEarnedValue}
            />
          </div>
          <div className="flex flex-wrap justify-between gap-3 sm:flex-col">
            <AssetsInfo
              className="flex-1 sm:w-full"
              title={t("clPositions.principalAssets")}
              assets={queryPositionMetrics.principal.map(({ coin }) => coin)}
              totalValue={queryPositionMetrics.totalPrincipalValue}
            />
            <AssetsInfo
              className="flex-1 sm:w-full"
              title={t("clPositions.unclaimedRewards")}
              assets={totalClaimableRewards}
              emptyText={t("clPositions.noRewards")}
            />
          </div>
          {unbondInfo && !superfluidDelegation && !superfluidUndelegation && (
            <div className="flex flex-wrap justify-between gap-3 sm:flex-col">
              <div className="flex flex-col text-right md:pl-4">
                <span>
                  {t("clPositions.unbondingFromNow", {
                    fromNow: moment(unbondInfo.endTime).fromNow(true),
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
        {(superfluidDelegation || superfluidUndelegation) &&
          derivedPoolData.sharePoolDetail.longestDuration && (
            <SuperfluidPositionInfo
              {...(superfluidDelegation ?? superfluidUndelegation!)}
              stakeDuration={derivedPoolData.sharePoolDetail.longestDuration}
            />
          )}
        <div className="mt-4 flex flex-row flex-wrap justify-end gap-5 sm:flex-wrap sm:justify-start">
          {showLinkToPool && (
            <ArrowButton onClick={() => router.push(`/pool/${poolId}`)}>
              {t("clPositions.goToPool", { poolId })}
            </ArrowButton>
          )}
          {positionConfig.isFullRange &&
            superfluidPoolDetail.isSuperfluid &&
            !superfluidDelegation &&
            !superfluidUndelegation &&
            account &&
            !isUnbonding && (
              <>
                <button
                  className="w-fit rounded-[10px] bg-superfluid py-[2px] px-[2px]"
                  disabled={!Boolean(account)}
                  onClick={() => {
                    setSelectSfValidatorAddress(true);
                  }}
                >
                  <div className="w-full rounded-[9px] bg-osmoverse-800 px-3 py-[6px] md:px-2">
                    <span className="text-superfluid-gradient">
                      {t("pool.superfluidEarnMore", {
                        rate: superfluidPoolDetail.superfluidApr
                          .maxDecimals(1)
                          .toString(),
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
                          positionConfig.id,
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
              !positionConfig.hasRewardsAvailable ||
              Boolean(account?.txTypeInProgress) ||
              !Boolean(account)
            }
            onClick={sendCollectAllRewardsMsg}
          >
            {t("clPositions.collectRewards")}
          </PositionButton>
          <PositionButton
            disabled={
              Boolean(account?.txTypeInProgress) ||
              Boolean(superfluidUndelegation) ||
              isUnbonding
            }
            onClick={useCallback(() => {
              if (superfluidDelegation) {
                account?.osmosis
                  .sendBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
                    [
                      {
                        lockId: superfluidDelegation.lockId,
                        isSyntheticLock: true,
                      },
                    ]
                  )
                  .catch(console.error);
              } else setActiveModal("remove");
            }, [account, superfluidDelegation])}
          >
            {Boolean(superfluidDelegation)
              ? t("clPositions.unstake")
              : t("clPositions.removeLiquidity")}
          </PositionButton>
          <PositionButton
            disabled={
              Boolean(account?.txTypeInProgress) ||
              Boolean(superfluidUndelegation) ||
              isUnbonding
            }
            onClick={useCallback(() => setActiveModal("increase"), [])}
          >
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

const AssetsInfo: FunctionComponent<
  {
    title: string;
    assets?: CoinPretty[];
    totalValue?: PricePretty;
    emptyText?: string;
  } & CustomClasses
> = observer(
  ({
    className,
    title,
    assets = [],
    totalValue: totalValueProp,
    emptyText,
  }) => {
    const t = useTranslation();
    const { priceStore } = useStore();

    const totalValue = totalValueProp ?? priceStore.calculateTotalPrice(assets);

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
        ) : (
          <span className="italic">
            {emptyText ?? t("clPositions.checkBackForRewards")}
          </span>
        )}
      </div>
    );
  }
);

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
  positionConfig: ObservableQueryLiquidityPositionById;
}> = observer(({ config, positionConfig }) => {
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
      onPointerHover={(price) => setHoverPrice(price)}
      onPointerOut={
        lastChartData ? () => setHoverPrice(lastChartData.close) : undefined
      }
    />
  );
});

type DelegationOrUndelegationInfo =
  | NonNullable<
      ReturnType<
        (typeof ObservableSuperfluidPoolDetail)["prototype"]["getDelegatedPositionInfo"]
      >
    >
  | NonNullable<
      ReturnType<
        (typeof ObservableSuperfluidPoolDetail)["prototype"]["getUndelegatingPositionInfo"]
      >
    >;

const SuperfluidPositionInfo: FunctionComponent<
  DelegationOrUndelegationInfo & { stakeDuration: Duration }
> = (props) => {
  const {
    validatorName,
    validatorImgSrc,
    equivalentStakedAmount,
    validatorCommission,
    superfluidApr,
    stakeDuration,
  } = props;
  const t = useTranslation();

  /** is undelegation */
  const endTime = "endTime" in props ? props.endTime : undefined;

  return (
    <div className="subtitle1 flex w-full flex-col gap-4 sm:flex-col">
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
        <div className="flex flex-col">
          <span>{validatorName}</span>
          <span>~{equivalentStakedAmount.trim(true).toString()}</span>
        </div>
        <div className="flex flex-col pl-8 text-right md:pl-4">
          <span className="text-superfluid-gradient">
            +{superfluidApr.toString()} {t("pool.APR")}
          </span>
          {validatorCommission && (
            <span>
              {validatorCommission?.toString()}{" "}
              {t("clPositions.superfluidCommission")}
            </span>
          )}
        </div>
        <div className="flex flex-col pl-8 text-right md:pl-4">
          {endTime ? (
            <span>
              {t("clPositions.superfluidUnstaking", {
                fromNow: moment(endTime).fromNow(true),
              })}
            </span>
          ) : (
            <span>
              {t("clPositions.superfluidUnstake", {
                duration: stakeDuration.humanize(),
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
