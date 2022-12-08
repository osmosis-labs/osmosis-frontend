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
import { EventName, ExternalIncentiveGaugeAllowList } from "../../config";
import {
  useLockTokenConfig,
  useSuperfluidPoolConfig,
  useWindowSize,
  useAmplitudeAnalytics,
  usePoolGauges,
  usePoolDetailConfig,
  useNavBar,
  useBondLiquidityConfig,
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

const E = EventName.PoolDetail;

const Pool: FunctionComponent = observer(() => {
  const router = useRouter();
  const {
    chainStore,
    queriesStore,
    accountStore,
    priceStore,
    queriesExternalStore,
  } = useStore();
  const t = useTranslation();
  const { isMobile } = useWindowSize();

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
  const { poolDetailConfig, pool } = usePoolDetailConfig(poolId);
  const { superfluidPoolConfig, superfluidDelegateToValidator } =
    useSuperfluidPoolConfig(poolDetailConfig);
  const bondLiquidityConfig = useBondLiquidityConfig(bech32Address, pool?.id);

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
        ...(superfluidPoolConfig && {
          isSuperfluidPool: superfluidPoolConfig.isSuperfluid,
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
  const {
    allAggregatedGauges,
    allowedAggregatedGauges,
    internalGauges: _,
  } = usePoolGauges(poolId);
  const [showSuperfluidValidatorModal, setShowSuperfluidValidatorsModal] =
    useState(false);
  const [showPoolDetails, setShowPoolDetails] = useState(false);
  const bondDurations = pool
    ? bondLiquidityConfig?.getAllowedBondDurations(
        (denom) => chainStore.getChain(chainId).forceFindCurrency(denom),
        ExternalIncentiveGaugeAllowList[pool.id]
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
      isSuperfluidPool: superfluidPoolConfig?.isSuperfluid ?? false,
    }),
    [poolId, poolName, poolWeight, superfluidPoolConfig?.isSuperfluid]
  );
  const onAddLiquidity = useCallback(
    (result: Promise<void>, config: ObservableAddLiquidityConfig) => {
      const poolInfo = {
        ...baseEventInfo,
        isSingleAsset: config.isSingleAmountIn,
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
        isSuperfluidEnabled: electSuperfluid,
        unbondingPeriod: duration.asDays(),
      };

      logEvent([E.bondStarted, lockInfo]);

      if (electSuperfluid) {
        setShowSuperfluidValidatorsModal(true);
        setShowLockLPTokenModal(false);
        // `sendLockAndSuperfluidDelegateMsg` will be sent after superfluid modal
      } else {
        lockToken(duration)
          .then(() => logEvent([E.bondCompleted, lockInfo]))
          .finally(() => setShowLockLPTokenModal(false));
      }
    },
    [allAggregatedGauges, baseEventInfo, logEvent, lockToken]
  );
  const onUnlockTokens = useCallback(
    (duration: Duration) => {
      const lockIds = poolDetailConfig?.userLockedAssets.reduce<string[]>(
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
    [poolDetailConfig?.userLockedAssets, baseEventInfo, logEvent, unlockTokens]
  );
  // TODO: re-add unpool functionality
  const handleSuperfluidDelegateToValidator = useCallback(
    (validatorAddress) => {
      if (!baseEventInfo.isSuperfluidPool) return;

      const poolInfo = {
        ...baseEventInfo,
        unbondingPeriod: 14,
        validatorName: queryCosmos.queryValidators
          .getQueryStatus(Staking.BondStatus.Bonded)
          .getValidator(validatorAddress)?.description.moniker,
      };

      logEvent([E.superfluidStakeStarted, poolInfo]);

      superfluidDelegateToValidator(validatorAddress, lockLPTokensConfig)
        .then(() => logEvent([E.superfluidStakeCompleted, poolInfo]))
        .finally(() => setShowSuperfluidValidatorsModal(false));
    },
    [
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

  const levelCta = bondLiquidityConfig?.calculateBondLevel(bondDurations);
  const level2Disabled = !bondDurations.some((duration) => duration.bondable);

  return (
    <main className="max-w-container m-auto flex flex-col gap-10 md:gap-4 bg-osmoverse-900 min-h-screen p-8 md:p-4">
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
      {lockLPTokensConfig &&
        allowedAggregatedGauges &&
        showLockLPTokenModal && (
          <LockTokensModal
            poolId={poolId}
            isOpen={showLockLPTokenModal}
            title={t("lockToken.title")}
            onRequestClose={() => setShowLockLPTokenModal(false)}
            amountConfig={lockLPTokensConfig}
            onLockToken={onLockToken}
          />
        )}
      {superfluidPoolConfig?.superfluid &&
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
              superfluidPoolConfig?.superfluid.upgradeableLpLockIds
                ? superfluidPoolConfig.superfluid.upgradeableLpLockIds.amount // is delegating amount from existing lockup
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 bg-osmoverse-1000 rounded-4xl pb-5">
          <div
            className={classNames(
              "flex flex-col gap-10 px-10 pt-10 md:px-5 md:pt-7 transition-height duration-300 ease-inOutBack overflow-hidden",
              showPoolDetails
                ? "h-[235px] xl:h-[300px] lg:h-[520px]"
                : "h-[120px] xl:h-[180px] lg:h-[280px]"
            )}
          >
            <div className="flex items-start gap-2 place-content-between xl:flex-col">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
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
                {superfluidPoolConfig?.isSuperfluid && (
                  <span className="body2 text-superfluid-gradient">
                    {t("pool.superfluidEnabled")}
                  </span>
                )}
                {pool?.type === "stable" && (
                  <div className="flex items-center gap-1.5 body2 text-gradient-positive">
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
              <div className="flex items-center gap-10 xl:place-content-between xl:w-full lg:flex-col lg:w-fit lg:items-start">
                <div>
                  <span className="text-osmoverse-400 subtitle1 gap-2">
                    {t("pool.24hrTradingVolume")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {queryGammPoolFeeMetrics
                      .getPoolFeesMetrics(poolId, priceStore)
                      .volume24h.toString()}
                  </h4>
                </div>
                <div>
                  <span className="text-osmoverse-400 subtitle1 gap-2">
                    {t("pool.liquidity")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {poolDetailConfig?.totalValueLocked.toString()}
                  </h4>
                </div>
                <div>
                  <span className="text-osmoverse-400 subtitle1 gap-2">
                    {t("pool.swapFee")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {pool?.swapFee.toString()}
                  </h4>
                </div>
              </div>
            </div>
            {pool && (
              <AssetBreakdownChart
                assets={pool.poolAssets.map((poolAsset) => {
                  const weights: {
                    weight: IntPretty;
                    weightFraction: RatePretty;
                  } = pool.weightedPoolInfo?.assets.find(
                    (asset) =>
                      asset.denom === poolAsset.amount.currency.coinMinimalDenom
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
                })}
                totalWeight={
                  pool.weightedPoolInfo?.totalWeight ??
                  new IntPretty(pool.poolAssets.length)
                }
              />
            )}
          </div>
          <div
            className="flex items-center mx-auto gap-1 cursor-pointer select-none"
            onClick={() => setShowPoolDetails(!showPoolDetails)}
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
        {poolDetailConfig?.userStats && (
          <div className="w-full grid grid-cols-[2fr_1fr] lg:flex lg:flex-col gap-4">
            <div className="w-full flex flex-col gap-3 bg-osmoverse-1000 px-10 py-7 rounded-4xl">
              <span className="subtitle1 text-osmoverse-300">
                {t("pool.yourStats")}
              </span>
              <div className="flex items-center md:flex-col md:items-start gap-3 place-content-between">
                <div className="flex shrink-0 flex-col gap-1">
                  <h4 className="text-osmoverse-100">
                    {poolDetailConfig.userStats.totalShareValue.toString()}
                  </h4>
                  <h6 className="text-osmoverse-300">
                    {t("pool.sharesAmount", {
                      shares: poolDetailConfig.userStats.totalShares
                        .maxDecimals(6)
                        .hideDenom(true)
                        .toString(),
                    })}
                  </h6>
                </div>
                <div className="w-1/2 md:w-full">
                  <PriceBreakdownChart
                    prices={[
                      {
                        label: t("pool.bonded"),
                        price: poolDetailConfig.userStats.bondedValue,
                      },
                      {
                        label: t("pool.unbonded"),
                        price: poolDetailConfig.userStats.unbondedValue,
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col gap-3 place-content-between bg-osmoverse-1000 px-10 py-7 rounded-4xl">
              <div className="flex flex-col gap-2">
                <span className="subtitle1 text-osmoverse-300">
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
              {poolDetailConfig?.userAvailableValue.toDec().gt(new Dec(0)) && (
                <ArrowButton onClick={() => setShowLockLPTokenModal(true)}>
                  {t("pool.earnMore")}
                </ArrowButton>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-7 md:gap-4">
        <div className="flex flex-col flex-wrap md:gap-3">
          <h5 className="md:text-h6 md:font-h6">{t("pool.putAssetsToWork")}</h5>
          <span className="subtitle1 md:text-body1 md:font-body1 text-osmoverse-300">
            {t("pool.putAssetsToWorkCaption")}{" "}
            <a
              rel="noreferrer"
              className="text-wosmongton-300 underline"
              target="_blank"
              href="https://docs.osmosis.zone/overview/getting-started#bonded-liquidity-gauges"
            >
              {t("pool.learnMore")}
            </a>
          </span>
        </div>
        <div
          className={classNames(
            "rounded-4xl p-1",
            levelCta === 1 ? "bg-gradient-positive" : "bg-osmoverse-800"
          )}
        >
          <div className="flex flex-col gap-10 bg-osmoverse-800 rounded-4x4pxlinset p-9 md:p-5">
            <div className="flex items-start lg:flex-col gap-2 lg:gap-14 place-content-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline flex-wrap gap-4">
                  <LevelBadge level={1} />
                  <div className="flex items-center gap-4 flex-wrap shrink">
                    <h5 className="md:text-h6 md:font-h6">
                      {t("pool.earnSwapFees")}
                    </h5>
                    <h5 className="md:text-h6 md:font-h6 text-bullish-400">{`${
                      pool
                        ? queryGammPoolFeeMetrics
                            .get7dPoolFeeApr(pool, priceStore)
                            .maxDecimals(2)
                            .toString()
                        : ""
                    } ${t("pool.APR")}`}</h5>
                  </div>
                </div>
                <span className="body2 text-osmoverse-200">
                  {t("pool.earnSwapFeesCaption")}
                </span>
              </div>
              <div className="lg:w-full flex flex-col gap-4">
                <div className="hidden lg:flex flex-col items-end gap-3">
                  <h3 className="md:text-h4 md:font-h4">
                    {t("pool.sharesAmount", {
                      shares: queryOsmosis.queryGammPoolShare
                        .getAvailableGammShare(bech32Address, poolId)
                        .trim(true)
                        .hideDenom(true)
                        .maxDecimals(4)
                        .toString(),
                    })}
                  </h3>
                </div>
                <div className="flex place-content-end flex-wrap shrink-0 xs:shrink gap-4">
                  <Button
                    className="w-fit xs:w-full shrink-0"
                    mode="secondary"
                    disabled={poolDetailConfig?.userAvailableValue
                      .toDec()
                      .isZero()}
                    onClick={() => setShowRemoveLiquidityModal(true)}
                  >
                    {t("removeLiquidity.title")}
                  </Button>
                  <Button
                    className={classNames("w-fit xs:w-full shrink-0 ", {
                      "bg-gradient-positive text-osmoverse-900 !border-0":
                        levelCta === 1,
                    })}
                    onClick={() => setShowAddLiquidityModal(true)}
                  >
                    {t("addLiquidity.title")}
                  </Button>
                </div>
              </div>
            </div>
            <div className="lg:hidden flex flex-col items-end gap-3">
              <h3 className="md:text-h4 md:font-h4">
                {t("pool.sharesAmount", {
                  shares: queryOsmosis.queryGammPoolShare
                    .getAvailableGammShare(bech32Address, poolId)
                    .trim(true)
                    .hideDenom(true)
                    .maxDecimals(4)
                    .toString(),
                })}
              </h3>
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
              "flex flex-col bg-osmoverse-800 rounded-4x4pxlinset p-9 md:p-5",
              {
                "gap-10": !level2Disabled || bondDurations.length > 0,
              }
            )}
          >
            <div className="flex lg:flex-col place-content-between gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex md:flex-col items-baseline flex-wrap gap-4">
                  <LevelBadge level={2} disabled={level2Disabled} />
                  <h5 className="md:text-h6 md:font-h6">
                    {level2Disabled
                      ? t("pool.bondLiquidityUnavailable")
                      : t("pool.bondLiquidity")}
                  </h5>
                </div>
                <span className="body2 text-osmoverse-200">
                  {t("pool.bondLiquidityCaption")}
                  {superfluidPoolConfig?.isSuperfluid &&
                    ` ${t("pool.bondSuperfluidLiquidityCaption")}`}
                </span>
              </div>
              {level2Disabled ? (
                <h6 className="text-osmoverse-100">
                  {t("pool.checkBackForBondingRewards")}
                </h6>
              ) : (
                <Button
                  className={classNames("w-96 md:w-full border-none", {
                    "bg-gradient-positive text-osmoverse-900 !border-0":
                      levelCta === 2,
                  })}
                  disabled={levelCta !== 2}
                  onClick={() => setShowLockLPTokenModal(true)}
                >
                  {t("pool.bondShares")}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 1.5xl:grid-cols-1 gap-4">
              {bondDurations.map((bondDuration) => (
                <BondCard
                  key={bondDuration.duration.asMilliseconds()}
                  {...bondDuration}
                  onUnbond={() => onUnlockTokens(bondDuration.duration)}
                  onGoSuperfluid={() => setShowSuperfluidValidatorsModal(true)}
                  splashImageSrc={
                    poolDetailConfig && poolDetailConfig.isIncentivized
                      ? poolDetailConfig.lockableDurations.length > 0 &&
                        poolDetailConfig.lockableDurations[0].asDays() ===
                          bondDuration.duration.asDays()
                        ? "/images/small-vial.svg"
                        : poolDetailConfig.lockableDurations.length > 1 &&
                          poolDetailConfig.lockableDurations[1].asDays() ===
                            bondDuration.duration.asDays()
                        ? "/images/medium-vial.svg"
                        : poolDetailConfig.lockableDurations.length > 2 &&
                          poolDetailConfig.lockableDurations[2].asDays() ===
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
      className={classNames("bg-wosmongton-400 rounded-xl px-5 py-1", {
        "text-osmoverse-100 bg-osmoverse-600": disabled,
      })}
    >
      <h5 className="md:text-h6 md:font-h6">
        {t("pool.level", { level: level.toString() })}
      </h5>
    </div>
  );
};

export default Pool;
