import Head from "next/head";
import Image from "next/image";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import classNames from "classnames";
import { CoinPretty, Dec, IntPretty, RatePretty } from "@keplr-wallet/unit";
import { Staking } from "@keplr-wallet/stores";
import {
  ObservableAddLiquidityConfig,
  ObservableRemoveLiquidityConfig,
} from "@osmosis-labs/stores";
import { Duration } from "dayjs/plugin/duration";
import { EventName } from "../../config";
import {
  useLockTokenConfig,
  useSuperfluidPool,
  useWindowSize,
  useAmplitudeAnalytics,
  useNavBar,
} from "../../hooks";
import {
  AddLiquidityModal,
  RemoveLiquidityModal,
  LockTokensModal,
  SuperfluidValidatorModal,
  TradeTokens,
} from "../../modals";
import { useStore } from "../../stores";
import {
  AssetBreakdownChart,
  PriceBreakdownChart,
} from "../../components/chart";
import { PoolAssetsIcon } from "../../components/assets";
import { BondCard } from "../../components/cards";
import { Disableable } from "../../components/types";
import { Button, ArrowButton } from "../../components/buttons";
import { useTranslation } from "react-multi-lang";
import PoolComposition from "../../components/chart/pool-composition";
import useMeasure from "../../hooks/use-measure";

const E = EventName.PoolDetail;

const Pool: FunctionComponent = observer(() => {
  const router = useRouter();
  const {
    chainStore,
    queriesStore,
    accountStore,
    priceStore,
    queriesExternalStore,
    derivedDataStore,
  } = useStore();
  const t = useTranslation();
  const { isMobile } = useWindowSize();

  const [poolDetailsContainerRef, { y: poolDetailsContainerOffset }] =
    useMeasure<HTMLDivElement>();
  const [poolHeaderRef, { height: poolHeaderHeight }] =
    useMeasure<HTMLDivElement>();
  const [poolBreakdownRef, { height: poolBreakdownHeight }] =
    useMeasure<HTMLDivElement>();

  const { id: poolId } = router.query as { id: string };
  const { chainId } = chainStore.osmosis;

  const queryCosmos = queriesStore.get(chainId).cosmos;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const { bech32Address } = accountStore.getAccount(chainStore.osmosis.chainId);
  const queryGammPoolFeeMetrics = queriesExternalStore.queryGammPoolFeeMetrics;
  const queryAccountPoolRewards =
    queriesExternalStore.queryAccountsPoolRewards.get(bech32Address);

  // eject to pools page if pool does not exist
  const poolExists =
    poolId !== undefined
      ? queryOsmosis.queryGammPools.poolExists(poolId as string)
      : undefined;
  useEffect(() => {
    if (poolExists === false) {
      router.push("/pools");
    }
  }, [poolExists]);

  // initialize pool data stores once root pool store is loaded
  const pool = queryOsmosis.queryGammPools.getPool(poolId as string);
  const { poolDetail, superfluidPoolDetail, poolBonding } =
    derivedDataStore.getForPool(poolId as string);
  const { superfluidDelegateToValidator } = useSuperfluidPool();

  // user analytics
  const { poolName, poolWeight } = useMemo(
    () => ({
      poolName: pool?.poolAssets
        .map((poolAsset) => poolAsset.amount.denom)
        .join(" / "),
      poolWeight: pool?.weightedPoolInfo?.assets
        .map((poolAsset) => poolAsset.weightFraction.toString())
        .join(" / "),
    }),
    [pool?.poolAssets]
  );
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [
      E.pageViewed,
      {
        poolId,
        poolName,
        poolWeight,
        ...(superfluidPoolDetail && {
          isSuperfluidPool: superfluidPoolDetail.isSuperfluid,
        }),
      },
    ],
  });

  // Manage liquidity + bond LP tokens (modals) state
  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);
  const [showRemoveLiquidityModal, setShowRemoveLiquidityModal] =
    useState(false);
  const [showLockLPTokenModal, setShowLockLPTokenModal] = useState(false);
  const {
    config: lockLPTokensConfig,
    lockToken,
    unlockTokens,
  } = useLockTokenConfig(
    pool ? queryOsmosis.queryGammPoolShare.getShareCurrency(pool.id) : undefined
  );
  const [showSuperfluidValidatorModal, setShowSuperfluidValidatorsModal] =
    useState(false);
  const [showPoolDetails, setShowPoolDetails] = useState(false);
  const bondDurations = pool
    ? poolBonding?.getAllowedBondDurations((denom) =>
        chainStore.getChain(chainId).forceFindCurrency(denom)
      ) ?? []
    : [];

  // swap modal
  const [showTradeTokenModal, setShowTradeTokenModal] = useState(false);

  // handle user actions
  const baseEventInfo = useMemo(
    () => ({
      poolId,
      poolName,
      poolWeight,
      isSuperfluidPool: superfluidPoolDetail?.isSuperfluid ?? false,
      isStableswapPool: pool?.type === "stable",
    }),
    [poolId, poolName, poolWeight, superfluidPoolDetail?.isSuperfluid]
  );
  const onAddLiquidity = useCallback(
    (result: Promise<void>, config: ObservableAddLiquidityConfig) => {
      const poolInfo = {
        ...baseEventInfo,
        isSingleAsset: config.isSingleAmountIn,
        isSuperfluidEnabled,
        providingLiquidity:
          config.isSingleAmountIn && config.singleAmountInConfig
            ? {
                [config.singleAmountInConfig?.sendCurrency.coinDenom]: Number(
                  config.singleAmountInConfig.amount
                ),
              }
            : config.poolAssetConfigs.reduce(
                (acc, cur) => ({
                  ...acc,
                  [cur.sendCurrency.coinDenom]: Number(cur.amount),
                }),
                {}
              ),
      };

      logEvent([E.addLiquidityStarted, poolInfo]);

      result
        .then(() => logEvent([E.addLiquidityCompleted, poolInfo]))
        .finally(() => setShowAddLiquidityModal(false));
    },
    [baseEventInfo, logEvent]
  );
  const onRemoveLiquidity = useCallback(
    (result: Promise<void>, config: ObservableRemoveLiquidityConfig) => {
      const removeLiqInfo = {
        ...baseEventInfo,
        poolSharePercentage: config.percentage,
      };

      logEvent([E.removeLiquidityStarted, removeLiqInfo]);

      result
        .then(() => logEvent([E.removeLiquidityCompleted, removeLiqInfo]))
        .finally(() => setShowRemoveLiquidityModal(false));
    },
    [baseEventInfo, logEvent]
  );
  const onLockToken = useCallback(
    (duration: Duration, electSuperfluid?: boolean) => {
      const lockInfo = {
        ...baseEventInfo,
        isSuperfluidEnabled: Boolean(electSuperfluid),
        unbondingPeriod: duration.asDays(),
      };

      logEvent([E.bondingStarted, lockInfo]);

      if (electSuperfluid) {
        setShowSuperfluidValidatorsModal(true);
        setShowLockLPTokenModal(false);
        // `sendLockAndSuperfluidDelegateMsg` will be sent after superfluid modal
      } else {
        lockToken(duration)
          .then(() => logEvent([E.bondingCompleted, lockInfo]))
          .finally(() => setShowLockLPTokenModal(false));
      }
    },
    [baseEventInfo, logEvent, lockToken]
  );
  const onUnlockTokens = useCallback(
    (duration: Duration) => {
      const lockIds = poolDetail?.userLockedAssets.reduce<string[]>(
        (foundLockIds, lock) => {
          if (lock.duration.asMilliseconds() === duration.asMilliseconds()) {
            return foundLockIds.concat(...lock.lockIds);
          }
          return foundLockIds;
        },
        []
      );
      if (!lockIds) {
        console.warn("No lock ids found");
        return;
      }

      const unlockEvent = {
        ...baseEventInfo,
        unbondingPeriod: duration?.asDays(),
      };
      logEvent([E.unbondAllStarted, unlockEvent]);

      unlockTokens(lockIds, duration).then(() => {
        logEvent([E.unbondAllCompleted, unlockEvent]);
      });
    },
    [poolDetail?.userLockedAssets, baseEventInfo, logEvent, unlockTokens]
  );
  // TODO: re-add unpool functionality
  const handleSuperfluidDelegateToValidator = useCallback(
    (validatorAddress) => {
      if (!baseEventInfo.isSuperfluidPool || !poolId) return;

      const poolInfo = {
        ...baseEventInfo,
        unbondingPeriod: 14,
        validatorName: queryCosmos.queryValidators
          .getQueryStatus(Staking.BondStatus.Bonded)
          .getValidator(validatorAddress)?.description.moniker,
        isSuperfluidEnabled,
      };

      logEvent([E.superfluidStakeStarted, poolInfo]);

      superfluidDelegateToValidator(
        poolId,
        validatorAddress,
        lockLPTokensConfig
      )
        .then(() => logEvent([E.superfluidStakeCompleted, poolInfo]))
        .finally(() => setShowSuperfluidValidatorsModal(false));
    },
    [
      poolId,
      lockLPTokensConfig,
      baseEventInfo,
      queryCosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded)
        .response,
      logEvent,
      superfluidDelegateToValidator,
    ]
  );

  const pageTitle = pool ? t("pool.title", { id: pool.id }) : undefined;
  useNavBar({
    title: pageTitle,
    ctas: [
      {
        label: t("pool.swap"),
        onClick: () => {
          logEvent([E.swapTokensClicked, baseEventInfo]);
          setShowTradeTokenModal(true);
        },
      },
    ],
  });

  const levelCta = poolBonding?.calculateBondLevel(bondDurations);
  const level2Disabled = !bondDurations.some((duration) => duration.bondable);

  const highestAPRBondableDuration = bondDurations[bondDurations?.length - 1];

  const highestAPRDailyPeriodicRate =
    highestAPRBondableDuration?.aggregateApr
      .sub(highestAPRBondableDuration?.swapFeeApr)
      .quo(new Dec(365)) // get daily periodic rate
      .toDec() ?? new Dec(0);

  const additionalRewardsByBonding = queryAccountPoolRewards
    .getUsdRewardsForPool(poolId)
    ?.day.mul(highestAPRDailyPeriodicRate)
    .maxDecimals(3)
    .inequalitySymbol(false);

  /**
   * In mainnet, highestAPRBondableDuration should be superfluid as the highest gauge index.
   */
  const isSuperfluidEnabled =
    highestAPRBondableDuration?.userShares?.toDec().gt(new Dec(0)) &&
    (Boolean(highestAPRBondableDuration?.superfluid?.delegated) ||
      Boolean(highestAPRBondableDuration?.superfluid?.undelegating));

  return (
    <main className="m-auto flex min-h-screen max-w-container flex-col gap-8 bg-osmoverse-900 px-8 py-4 md:gap-4 md:p-4">
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
          onAddLiquidity={onAddLiquidity}
        />
      )}
      {pool && showRemoveLiquidityModal && (
        <RemoveLiquidityModal
          isOpen={true}
          poolId={pool.id}
          onRequestClose={() => setShowRemoveLiquidityModal(false)}
          onRemoveLiquidity={onRemoveLiquidity}
        />
      )}
      {pool && showTradeTokenModal && (
        <TradeTokens
          className="md:!p-0"
          hideCloseButton={isMobile}
          isOpen={showTradeTokenModal}
          onRequestClose={() => setShowTradeTokenModal(false)}
          pools={[pool.pool]}
        />
      )}
      {lockLPTokensConfig && showLockLPTokenModal && (
        <LockTokensModal
          poolId={poolId}
          isOpen={showLockLPTokenModal}
          title={t("lockToken.title")}
          onRequestClose={() => setShowLockLPTokenModal(false)}
          amountConfig={lockLPTokensConfig}
          onLockToken={onLockToken}
        />
      )}
      {superfluidPoolDetail?.superfluid &&
        pool &&
        lockLPTokensConfig &&
        showSuperfluidValidatorModal && (
          <SuperfluidValidatorModal
            title={
              isMobile
                ? t("superfluidValidator.titleMobile")
                : t("superfluidValidator.title")
            }
            availableBondAmount={
              superfluidPoolDetail?.superfluid.upgradeableLpLockIds
                ? superfluidPoolDetail.superfluid.upgradeableLpLockIds.amount // is delegating amount from existing lockup
                : new CoinPretty(
                    pool.shareCurrency, // is delegating amount from new/pending lockup
                    lockLPTokensConfig.amount !== ""
                      ? lockLPTokensConfig.getAmountPrimitive().amount
                      : new Dec(0)
                  )
            }
            isOpen={showSuperfluidValidatorModal}
            onRequestClose={() => setShowSuperfluidValidatorsModal(false)}
            onSelectValidator={handleSuperfluidDelegateToValidator}
          />
        )}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-4xl bg-osmoverse-1000 pb-4">
          <div
            ref={poolDetailsContainerRef}
            className={classNames(
              "flex flex-col gap-3 overflow-hidden px-8 pt-8 transition-height duration-300 ease-inOutBack md:px-5 md:pt-7"
            )}
            style={{
              height: showPoolDetails
                ? poolBreakdownHeight +
                    poolHeaderHeight +
                    poolDetailsContainerOffset +
                    12 ?? // gap between header and breakdown
                  178
                : poolHeaderHeight + poolDetailsContainerOffset ?? 100,
            }}
          >
            <div
              ref={poolHeaderRef}
              className="flex place-content-between items-start gap-2 xl:flex-col"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {pool && (
                    <PoolAssetsIcon
                      assets={pool.poolAssets.map((asset) => ({
                        coinDenom: asset.amount.denom,
                        coinImageUrl: asset.amount.currency.coinImageUrl,
                      }))}
                      size="sm"
                    />
                  )}
                  <h5 className="max-w-xs truncate">{poolName}</h5>
                </div>
                {superfluidPoolDetail?.isSuperfluid && (
                  <span className="body2 text-superfluid-gradient">
                    {t("pool.superfluidEnabled")}
                  </span>
                )}
                {pool?.type === "stable" && (
                  <div className="body2 text-gradient-positive flex items-center gap-1.5">
                    <Image
                      alt=""
                      src="/icons/stableswap-pool.svg"
                      height={24}
                      width={24}
                    />
                    <span>{t("pool.stableswapEnabled")}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-10 xl:w-full xl:place-content-between lg:w-fit lg:flex-col lg:items-start lg:gap-3">
                <div className="space-y-2">
                  <span className="body2 gap-2 text-osmoverse-400">
                    {t("pool.24hrTradingVolume")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {queryGammPoolFeeMetrics
                      .getPoolFeesMetrics(poolId, priceStore)
                      .volume24h.toString()}
                  </h4>
                </div>
                <div className="space-y-2">
                  <span className="body2 gap-2 text-osmoverse-400">
                    {t("pool.liquidity")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {poolDetail?.totalValueLocked.toString()}
                  </h4>
                </div>
                <div className="space-y-2">
                  <span className="body2 gap-2 text-osmoverse-400">
                    {t("pool.swapFee")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {pool?.swapFee.toString()}
                  </h4>
                </div>
              </div>
            </div>
            <div ref={poolBreakdownRef}>
              <AssetBreakdownChart
                assets={
                  pool?.poolAssets.map((poolAsset) => {
                    const weights: {
                      weight: IntPretty;
                      weightFraction: RatePretty;
                    } = pool.weightedPoolInfo?.assets.find(
                      (asset) =>
                        asset.denom ===
                        poolAsset.amount.currency.coinMinimalDenom
                    ) ?? {
                      weight: new IntPretty(1), // Assume stable pools have even weight
                      weightFraction: new RatePretty(
                        new Dec(1).quo(new Dec(pool.poolAssets.length))
                      ),
                    };

                    return {
                      ...weights,
                      ...poolAsset,
                    };
                  }) ?? []
                }
                totalWeight={
                  pool?.weightedPoolInfo?.totalWeight ??
                  new IntPretty(pool?.poolAssets.length ?? 0)
                }
              />
            </div>
          </div>
          <div
            className="mx-auto flex cursor-pointer select-none items-center gap-1"
            onClick={() => {
              logEvent([E.showHidePoolDetails]);
              setShowPoolDetails(!showPoolDetails);
            }}
          >
            <span className="subtitle2 text-wosmongton-200">
              {showPoolDetails
                ? t("pool.collapseDetails")
                : t("pool.showDetails")}
            </span>
            <div
              className={classNames("flex items-center transition-transform", {
                "rotate-180": showPoolDetails,
              })}
            >
              <Image
                src="/icons/chevron-down.svg"
                alt="pool details"
                height={14}
                width={14}
              />
            </div>
          </div>
        </div>
        {poolDetail?.userStats && (
          <div className="flex w-full gap-4 1.5lg:flex-col">
            <div className="flex flex-col gap-3 rounded-4xl bg-osmoverse-1000 px-8 py-7">
              <span className="body2 text-osmoverse-300">
                {t("pool.yourStats")}
              </span>
              <div className="flex place-content-between  gap-6 sm:flex-col sm:items-start">
                <div className="flex shrink-0 flex-col gap-1">
                  <h4 className="text-osmoverse-100">
                    {poolDetail.userStats.totalShareValue.toString()}
                  </h4>
                  <h6 className="subtitle1 text-osmoverse-300">
                    {t("pool.sharesAmount", {
                      shares: poolDetail.userStats.totalShares
                        .maxDecimals(6)
                        .hideDenom(true)
                        .toString(),
                    })}
                  </h6>
                </div>

                <PoolComposition assets={poolDetail.userPoolAssets} />
              </div>
            </div>

            <div className="flex flex-1 gap-4 1.5md:flex-col">
              <div className="flex flex-1 flex-col space-y-3 rounded-4xl bg-osmoverse-1000 px-8 pt-2 pb-4">
                <PriceBreakdownChart
                  prices={[
                    {
                      label: t("pool.bonded"),
                      price: poolDetail.userStats.bondedValue,
                    },
                    {
                      label: t("pool.available"),
                      price: poolDetail.userStats.unbondedValue,
                    },
                  ]}
                />
              </div>

              <div className="flex flex-col place-content-between gap-3 rounded-4xl bg-osmoverse-1000 px-8 py-7">
                <div className="flex flex-col gap-2">
                  <span className="body2 text-osmoverse-300">
                    {t("pool.currentDailyEarn")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {t("pool.dailyEarnAmount", {
                      amount:
                        queryAccountPoolRewards
                          .getUsdRewardsForPool(poolId)
                          ?.day.toString() ?? "$0",
                    })}
                  </h4>
                </div>

                {poolDetail?.userAvailableValue.toDec().gt(new Dec(0)) && (
                  <ArrowButton
                    className="text-left"
                    onClick={() => {
                      logEvent([E.earnMoreByBondingClicked, baseEventInfo]);
                      setShowLockLPTokenModal(true);
                    }}
                  >
                    {t("pool.earnMore", {
                      amount: additionalRewardsByBonding
                        ?.toDec()
                        .gte(new Dec(0.001))
                        ? `$${additionalRewardsByBonding?.toString()}/${t(
                            "pool.day"
                          )}`
                        : "",
                    })}
                  </ArrowButton>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
      <section className="flex flex-col gap-4 md:gap-4">
        <div className="flex flex-col flex-wrap px-8 md:gap-3">
          <h6 className="text-h6 font-h6">{t("pool.putAssetsToWork")}</h6>
          <span className="body2 text-osmoverse-300">
            {t("pool.putAssetsToWorkCaption")}{" "}
            <a
              rel="noreferrer"
              className="text-wosmongton-300 underline"
              target="_blank"
              onClick={() => {
                logEvent([E.PutYourAssetsToWork.learnMoreClicked]);
              }}
              href="https://docs.osmosis.zone/overview/getting-started#bonded-liquidity-gauges"
            >
              {t("pool.learnMore")}
            </a>
          </span>
        </div>
        <div className="flex flex-col gap-10 md:gap-4">
          <div
            className={classNames(
              "rounded-4xl p-1",
              levelCta === 1 ? "bg-gradient-positive" : "bg-osmoverse-800"
            )}
          >
            <div className="flex flex-col gap-10 rounded-4x4pxlinset bg-osmoverse-800 p-8 md:p-5">
              <div className="flex place-content-between items-start gap-2 lg:flex-col lg:gap-14">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-baseline gap-4 md:gap-3">
                    <LevelBadge level={1} />
                    <div className="flex shrink flex-wrap items-center gap-3">
                      <h6 className="md:text-h6 md:font-h6">
                        {t("pool.earnSwapFees")}
                      </h6>
                      <h6 className="text-bullish-400 md:text-h6 md:font-h6">{`${
                        pool
                          ? queryGammPoolFeeMetrics
                              .get7dPoolFeeApr(pool, priceStore)
                              .maxDecimals(2)
                              .toString()
                          : ""
                      } ${t("pool.APR")}`}</h6>
                    </div>
                  </div>
                  <span className="body2 text-osmoverse-200">
                    {t("pool.earnSwapFeesCaption")}
                  </span>
                </div>
                <div className="flex flex-col gap-4 lg:w-full">
                  <div className="hidden flex-col items-end lg:flex">
                    <h4 className="text-osmoverse-100">
                      {poolDetail?.userAvailableValue.toString()}
                    </h4>
                    <h6 className="subtitle1 text-osmoverse-300">
                      {t("pool.sharesAmount", {
                        shares: queryOsmosis.queryGammPoolShare
                          .getAvailableGammShare(bech32Address, poolId)
                          .trim(true)
                          .hideDenom(true)
                          .maxDecimals(4)
                          .toString(),
                      })}
                    </h6>
                  </div>
                  <div className="flex shrink-0 flex-wrap place-content-end gap-4 xs:shrink">
                    <Button
                      className="w-fit shrink-0 xs:w-full"
                      mode="secondary"
                      disabled={poolDetail?.userAvailableValue.toDec().isZero()}
                      onClick={() => {
                        logEvent([
                          E.removeLiquidityClicked,
                          { ...baseEventInfo, isSuperfluidEnabled },
                        ]);
                        setShowRemoveLiquidityModal(true);
                      }}
                    >
                      {t("removeLiquidity.title")}
                    </Button>
                    <Button
                      className={classNames("w-fit shrink-0 xs:w-full ", {
                        "!border-0 bg-gradient-positive text-osmoverse-900":
                          levelCta === 1,
                      })}
                      onClick={() => {
                        logEvent([
                          E.addLiquidityClicked,
                          { ...baseEventInfo, isSuperfluidEnabled },
                        ]);
                        setShowAddLiquidityModal(true);
                      }}
                    >
                      {t("addLiquidity.title")}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end text-right lg:hidden">
                <h4 className="text-osmoverse-100">
                  {poolDetail?.userAvailableValue.toString()}
                </h4>
                <h6 className="subtitle1 text-osmoverse-300">
                  {t("pool.sharesAmount", {
                    shares: queryOsmosis.queryGammPoolShare
                      .getAvailableGammShare(bech32Address, poolId)
                      .trim(true)
                      .hideDenom(true)
                      .maxDecimals(4)
                      .toString(),
                  })}
                </h6>
              </div>
            </div>
          </div>
          <div
            className={classNames(
              "rounded-4xl p-1",
              levelCta === 2 ? "bg-gradient-positive" : "bg-osmoverse-800"
            )}
          >
            <div
              className={classNames(
                "flex flex-col rounded-4x4pxlinset bg-osmoverse-800 p-8 md:p-5",
                {
                  "gap-10": !level2Disabled || bondDurations.length > 0,
                }
              )}
            >
              <div className="flex place-content-between lg:flex-col lg:gap-4 md:gap-3">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-baseline gap-4 md:flex-col md:gap-3">
                    <LevelBadge level={2} disabled={level2Disabled} />
                    <h6>
                      {level2Disabled
                        ? t("pool.bondLiquidityUnavailable")
                        : t("pool.bondLiquidity")}
                    </h6>
                  </div>
                  <span className="body2 text-osmoverse-200">
                    {t("pool.bondLiquidityCaption")}
                    {superfluidPoolDetail?.isSuperfluid &&
                      ` ${t("pool.bondSuperfluidLiquidityCaption")}`}
                  </span>
                </div>
                {level2Disabled ? (
                  <h6 className="text-osmoverse-100">
                    {t("pool.checkBackForBondingRewards")}
                  </h6>
                ) : (
                  <Button
                    className={classNames("w-64 border-none md:w-full", {
                      "!border-0 bg-gradient-positive text-osmoverse-900":
                        levelCta === 2,
                    })}
                    disabled={levelCta !== 2}
                    onClick={() => {
                      logEvent([E.bondSharesClicked, baseEventInfo]);
                      setShowLockLPTokenModal(true);
                    }}
                  >
                    {t("pool.bondShares")}
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 1.5xl:grid-cols-1">
                {bondDurations.map((bondDuration) => (
                  <BondCard
                    key={bondDuration.duration.asMilliseconds()}
                    {...bondDuration}
                    onUnbond={() => {
                      logEvent([
                        E.unbondClicked,
                        {
                          ...baseEventInfo,
                          unbondingPeriod: bondDuration.duration.asDays(),
                        },
                      ]);
                      onUnlockTokens(bondDuration.duration);
                    }}
                    onToggleDetails={(nextValue) => {
                      if (nextValue)
                        logEvent([
                          E.cardDetailsExpanded,
                          {
                            ...baseEventInfo,
                            unbondingPeriod: bondDuration.duration.asDays(),
                          },
                        ]);
                    }}
                    onGoSuperfluid={() => {
                      logEvent([
                        E.goSuperfluidClicked,
                        {
                          ...baseEventInfo,
                          unbondingPeriod: bondDuration.duration.asDays(),
                          isSuperfluidEnabled,
                        },
                      ]);
                      setShowSuperfluidValidatorsModal(true);
                    }}
                    splashImageSrc={
                      poolDetail && poolDetail.isIncentivized
                        ? poolDetail.lockableDurations.length > 0 &&
                          poolDetail.lockableDurations[0].asDays() ===
                            bondDuration.duration.asDays()
                          ? "/images/small-vial.svg"
                          : poolDetail.lockableDurations.length > 1 &&
                            poolDetail.lockableDurations[1].asDays() ===
                              bondDuration.duration.asDays()
                          ? "/images/medium-vial.svg"
                          : poolDetail.lockableDurations.length > 2 &&
                            poolDetail.lockableDurations[2].asDays() ===
                              bondDuration.duration.asDays()
                          ? "/images/large-vial.svg"
                          : undefined
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
});

const LevelBadge: FunctionComponent<{ level: number } & Disableable> = ({
  level,
  disabled,
}) => {
  const t = useTranslation();
  return (
    <div
      className={classNames("rounded-xl bg-wosmongton-400 px-5 py-1", {
        "bg-osmoverse-600 text-osmoverse-100": disabled,
      })}
    >
      <h5 className="md:text-h6 md:font-h6">
        {t("pool.level", { level: level.toString() })}
      </h5>
    </div>
  );
};

export default Pool;
