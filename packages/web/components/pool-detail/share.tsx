import { CoinPretty, Dec, IntPretty, RatePretty } from "@keplr-wallet/unit";
import { Staking } from "@osmosis-labs/keplr-stores";
import {
  ObservableAddLiquidityConfig,
  ObservableRemoveLiquidityConfig,
} from "@osmosis-labs/stores";
import classNames from "classnames";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMeasure } from "react-use";

import { Icon, PoolAssetsIcon } from "~/components/assets";
import { ArrowButton, Button } from "~/components/buttons";
import { BondCard } from "~/components/cards";
import { AssetBreakdownChart, PriceBreakdownChart } from "~/components/chart";
import PoolComposition from "~/components/chart/pool-composition";
import { SuperchargePool } from "~/components/funnels/concentrated-liquidity";
import { Disableable } from "~/components/types";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  useLockTokenConfig,
  useSuperfluidPool,
  useWindowSize,
} from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import {
  AddLiquidityModal,
  LockTokensModal,
  RemoveLiquidityModal,
  SuperfluidValidatorModal,
} from "~/modals";
import { ConcentratedLiquidityLearnMoreModal } from "~/modals/concentrated-liquidity-intro";
import { UserUpgradesModal } from "~/modals/user-upgrades";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

const E = EventName.PoolDetail;

export const SharePool: FunctionComponent<{ poolId: string }> = observer(
  ({ poolId }) => {
    const router = useRouter();
    const {
      chainStore,
      queriesStore,
      accountStore,
      priceStore,
      queriesExternalStore: { queryPoolFeeMetrics, queryAccountsPoolRewards },
      derivedDataStore,
      userUpgrades,
    } = useStore();
    const { t } = useTranslation();
    const { isMobile } = useWindowSize();

    const [poolDetailsContainerRef, { y: poolDetailsContainerOffset }] =
      useMeasure<HTMLDivElement>();
    const [poolHeaderRef, { height: poolHeaderHeight }] =
      useMeasure<HTMLDivElement>();
    const [poolBreakdownRef, { height: poolBreakdownHeight }] =
      useMeasure<HTMLDivElement>();

    const { chainId } = chainStore.osmosis;

    const flags = useFeatureFlags();

    const queryCosmos = queriesStore.get(chainId).cosmos;
    const queryOsmosis = queriesStore.get(chainId).osmosis!;
    const account = accountStore.getWallet(chainStore.osmosis.chainId);
    const address = account?.address ?? "";
    const queryAccountPoolRewards = queryAccountsPoolRewards.get(address);

    // initialize pool data stores once root pool store is loaded
    const { sharePoolDetail, superfluidPoolDetail, poolBonding } =
      typeof poolId === "string" && Boolean(poolId)
        ? derivedDataStore.getForPool(poolId as string)
        : {
            sharePoolDetail: undefined,
            superfluidPoolDetail: undefined,
            poolBonding: undefined,
          };
    const pool = sharePoolDetail?.querySharePool;
    const { delegateSharesToValidator } = useSuperfluidPool();

    // feature flag check
    useEffect(() => {
      // redirect if CL pool and CL feature is off
      if (pool?.type === "concentrated" && !flags.concentratedLiquidity) {
        router.push("/pools");
      }
    }, [pool?.type, flags.concentratedLiquidity, router]);

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
      [pool?.poolAssets, pool?.weightedPoolInfo?.assets]
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
      pool
        ? queryOsmosis.queryGammPoolShare.makeShareCurrency(pool.id)
        : undefined
    );
    const [showSuperfluidValidatorModal, setShowSuperfluidValidatorsModal] =
      useState(false);
    const [showPoolDetails, setShowPoolDetails] = useState(false);
    const bondDurations = pool ? poolBonding?.bondDurations ?? [] : [];

    const highestAPRBondableDuration = poolBonding?.highestBondDuration;

    const highestAPRDailyPeriodicRate =
      highestAPRBondableDuration?.aggregateApr
        .sub(highestAPRBondableDuration?.swapFeeApr)
        .quo(new Dec(365)) // get daily periodic rate
        .toDec() ?? new Dec(0);

    /**
     * In mainnet, highestAPRBondableDuration should be superfluid as the highest gauge index.
     */
    const isSuperfluidEnabled =
      highestAPRBondableDuration?.userShares?.toDec().gt(new Dec(0)) &&
      (Boolean(highestAPRBondableDuration?.superfluid?.delegated) ||
        Boolean(highestAPRBondableDuration?.superfluid?.undelegating));

    // handle user actions
    const baseEventInfo = useMemo(
      () => ({
        poolId,
        poolName,
        poolWeight,
        isSuperfluidPool: superfluidPoolDetail?.isSuperfluid ?? false,
        isStableswapPool: pool?.type === "stable",
      }),
      [
        pool?.type,
        poolId,
        poolName,
        poolWeight,
        superfluidPoolDetail?.isSuperfluid,
      ]
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
          .catch(console.error)
          .finally(() => setShowAddLiquidityModal(false));
      },
      [baseEventInfo, isSuperfluidEnabled, logEvent]
    );
    const onRemoveLiquidity = useCallback(
      (result: Promise<void>, config: ObservableRemoveLiquidityConfig) => {
        const removeLiqInfo = {
          ...baseEventInfo,
          isSuperfluidEnabled,
          poolSharePercentage: config.percentage,
        };

        logEvent([E.removeLiquidityStarted, removeLiqInfo]);

        result
          .then(() => logEvent([E.removeLiquidityCompleted, removeLiqInfo]))
          .catch(console.error)
          .finally(() => setShowRemoveLiquidityModal(false));
      },
      [baseEventInfo, isSuperfluidEnabled, logEvent]
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
        const lockIds = sharePoolDetail?.userLockedAssets.reduce<string[]>(
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
      [sharePoolDetail?.userLockedAssets, baseEventInfo, logEvent, unlockTokens]
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

        delegateSharesToValidator(poolId, validatorAddress, lockLPTokensConfig)
          .then(() => logEvent([E.superfluidStakeCompleted, poolInfo]))
          .finally(() => setShowSuperfluidValidatorsModal(false));
      },
      [
        baseEventInfo,
        poolId,
        queryCosmos.queryValidators,
        isSuperfluidEnabled,
        logEvent,
        delegateSharesToValidator,
        lockLPTokensConfig,
      ]
    );

    const levelCta = poolBonding?.calculateBondLevel(bondDurations);
    const level2Disabled = !bondDurations.some((duration) => duration.bondable);

    const additionalRewardsByBonding = queryAccountPoolRewards
      .getUsdRewardsForPool(poolId)
      ?.day.mul(highestAPRDailyPeriodicRate)
      .maxDecimals(3)
      .inequalitySymbol(false);

    const setShowModal = useCallback(
      (setter: Function, show: boolean) => () => setter(show),
      []
    );

    // migrate to CL from this pool
    const [showClLearnMoreModal, setShowClLearnMoreModal] = useState(false);
    const {
      isOpen: isUserUpgradesOpen,
      onOpen: onOpenUserUpgrades,
      onClose: onCloseUserUpgrades,
    } = useDisclosure();
    const relevantCfmmToClUpgrade = userUpgrades.availableCfmmToClUpgrades.find(
      ({ cfmmPoolId }) => cfmmPoolId === poolId
    );

    return (
      <main className="m-auto flex min-h-screen max-w-container flex-col gap-8 bg-osmoverse-900 px-8 py-4 md:gap-4 md:p-4">
        {pool && showAddLiquidityModal && (
          <AddLiquidityModal
            isOpen={true}
            poolId={pool.id}
            onRequestClose={setShowModal(setShowAddLiquidityModal, false)}
            onAddLiquidity={onAddLiquidity}
          />
        )}
        {pool && showRemoveLiquidityModal && (
          <RemoveLiquidityModal
            isOpen={true}
            poolId={pool.id}
            onRequestClose={setShowModal(setShowRemoveLiquidityModal, false)}
            onRemoveLiquidity={onRemoveLiquidity}
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
        {superfluidPoolDetail?.isSuperfluid &&
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
                superfluidPoolDetail?.userUpgradeableSharePoolLockIds
                  ? superfluidPoolDetail.userUpgradeableSharePoolLockIds.amount // is delegating amount from existing lockup
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
                  <div className="flex flex-wrap items-center gap-3">
                    {pool && (
                      <PoolAssetsIcon
                        assets={pool.poolAssets.map((asset) => ({
                          coinDenom: asset.amount.denom,
                          coinImageUrl: asset.amount.currency.coinImageUrl,
                        }))}
                        size="sm"
                      />
                    )}
                    <h5>{poolName}</h5>
                  </div>
                  <div className="flex flex-col gap-1">
                    {superfluidPoolDetail?.isSuperfluid && (
                      <span className="body2 text-superfluid-gradient flex items-center gap-1.5">
                        <Image
                          alt=""
                          src="/icons/superfluid-osmo.svg"
                          height={18}
                          width={18}
                        />
                        {t("pool.superfluidEnabled")}
                      </span>
                    )}
                    {pool?.type === "stable" && (
                      <div className="body2 text-gradient-positive flex items-center gap-1.5">
                        <Image
                          alt=""
                          src="/icons/stableswap-pool.svg"
                          height={18}
                          width={18}
                        />
                        <span>{t("pool.stableswapEnabled")}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-10 xl:w-full xl:place-content-between lg:w-fit lg:flex-col lg:items-start lg:gap-3">
                  <div className="space-y-2">
                    <span className="body2 gap-2 text-osmoverse-400">
                      {t("pool.24hrTradingVolume")}
                    </span>
                    <h4 className="text-osmoverse-100">
                      {queryPoolFeeMetrics
                        .getPoolFeesMetrics(poolId, priceStore)
                        .volume24h.toString()}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <span className="body2 gap-2 text-osmoverse-400">
                      {t("pool.liquidity")}
                    </span>
                    <h4 className="text-osmoverse-100">
                      {sharePoolDetail?.totalValueLocked.toString()}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <span className="body2 gap-2 text-osmoverse-400">
                      {t("pool.swapFee")}
                    </span>
                    <h4 className="text-osmoverse-100">
                      {pool?.swapFee.toString() ?? ""}
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
            <Button
              mode="text"
              className="subtitle2 mx-auto gap-1"
              onClick={() => {
                logEvent([E.showHidePoolDetails]);
                setShowPoolDetails(!showPoolDetails);
              }}
            >
              <span>
                {showPoolDetails
                  ? t("pool.collapseDetails")
                  : t("pool.showDetails")}
              </span>
              <div
                className={classNames(
                  "flex items-center transition-transform",
                  {
                    "rotate-180": showPoolDetails,
                  }
                )}
              >
                <Icon id="chevron-down" width="14" height="8" />
              </div>
            </Button>
          </div>
          {sharePoolDetail?.userStats && (
            <div className="flex w-full gap-4 1.5lg:flex-col">
              <div className="flex flex-col gap-3 rounded-4xl bg-osmoverse-1000 px-8 py-7">
                <span className="body2 text-osmoverse-300">
                  {t("pool.yourStats")}
                </span>
                <div className="flex place-content-between  gap-6 sm:flex-col sm:items-start">
                  <div className="flex shrink-0 flex-col gap-1">
                    <h4 className="text-osmoverse-100">
                      {sharePoolDetail.userStats.totalShareValue.toString()}
                    </h4>
                    <h6 className="subtitle1 text-osmoverse-300">
                      {t("pool.sharesAmount", {
                        shares: sharePoolDetail.userStats.totalShares
                          .maxDecimals(6)
                          .hideDenom(true)
                          .toString(),
                      })}
                    </h6>
                  </div>

                  <PoolComposition assets={sharePoolDetail.userPoolAssets} />
                </div>
              </div>

              <div className="flex flex-1 gap-4 1.5md:flex-col">
                <div className="flex flex-1 flex-col space-y-3 rounded-4xl bg-osmoverse-1000 px-8 pt-2 pb-4">
                  <PriceBreakdownChart
                    prices={[
                      {
                        label: t("pool.bonded"),
                        price: sharePoolDetail.userStats.bondedValue,
                      },
                      {
                        label: t("pool.available"),
                        price: sharePoolDetail.userStats.unbondedValue,
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

                  {sharePoolDetail?.userAvailableValue.toDec().gt(new Dec(0)) &&
                    bondDurations.some((duration) => duration.bondable) && (
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
        {flags.concentratedLiquidity &&
          flags.upgrades &&
          relevantCfmmToClUpgrade &&
          pool && (
            <section>
              <SuperchargePool
                title={t("addConcentratedLiquidityPoolCta.title", {
                  pair: pool.poolAssets
                    .map((asset) => asset.amount.denom)
                    .join("/"),
                })}
                caption={t("addConcentratedLiquidityPoolCta.caption")}
                primaryCta={t("addConcentratedLiquidityPoolCta.primaryCta")}
                secondaryCta={t("addConcentratedLiquidityPoolCta.secondaryCta")}
                onCtaClick={onOpenUserUpgrades}
                onSecondaryClick={() => {
                  setShowClLearnMoreModal(true);
                }}
              />
              {showClLearnMoreModal && (
                <ConcentratedLiquidityLearnMoreModal
                  isOpen={true}
                  onRequestClose={() => setShowClLearnMoreModal(false)}
                />
              )}
              <UserUpgradesModal
                explicitCfmmToClUpgrades={[relevantCfmmToClUpgrade]}
                isOpen={isUserUpgradesOpen}
                onRequestClose={onCloseUserUpgrades}
              />
            </section>
          )}
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
                            ? queryPoolFeeMetrics
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
                        {sharePoolDetail?.userAvailableValue.toString()}
                      </h4>
                      <h6 className="subtitle1 text-osmoverse-300">
                        {t("pool.sharesAmount", {
                          shares: formatPretty(
                            queryOsmosis.queryGammPoolShare
                              .getAvailableGammShare(address, poolId)
                              .hideDenom(true),
                            { maxDecimals: 4 }
                          ),
                        })}
                      </h6>
                    </div>
                    <div className="flex shrink-0 flex-wrap place-content-end gap-4 xs:shrink">
                      <Button
                        className="w-fit shrink-0 xs:w-full"
                        mode="secondary"
                        disabled={queryOsmosis.queryGammPoolShare
                          .getAvailableGammShare(address, poolId)
                          .toDec()
                          .isZero()}
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
                        mode={levelCta === 1 ? "special-1" : "primary"}
                        className="w-fit shrink-0 xs:w-full"
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
                    {sharePoolDetail?.userAvailableValue.toString()}
                  </h4>
                  <h6 className="subtitle1 text-osmoverse-300">
                    {t("pool.sharesAmount", {
                      shares: formatPretty(
                        queryOsmosis.queryGammPoolShare
                          .getAvailableGammShare(address, poolId)
                          .hideDenom(true),
                        { maxDecimals: 8 }
                      ),
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
                        sharePoolDetail && sharePoolDetail.isIncentivized
                          ? sharePoolDetail.lockableDurations.length > 0 &&
                            sharePoolDetail.lockableDurations[0].asDays() ===
                              bondDuration.duration.asDays()
                            ? "/images/small-vial.svg"
                            : sharePoolDetail.lockableDurations.length > 1 &&
                              sharePoolDetail.lockableDurations[1].asDays() ===
                                bondDuration.duration.asDays()
                            ? "/images/medium-vial.svg"
                            : sharePoolDetail.lockableDurations.length > 2 &&
                              sharePoolDetail.lockableDurations[2].asDays() ===
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
  }
);

const LevelBadge: FunctionComponent<{ level: number } & Disableable> = ({
  level,
  disabled,
}) => {
  const { t } = useTranslation();
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
