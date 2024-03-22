import {
  CoinPretty,
  Dec,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import type { Pool } from "@osmosis-labs/server";
import { BondStatus } from "@osmosis-labs/types";
import classNames from "classnames";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { useMeasure } from "react-use";

import { Icon, PoolAssetsIcon } from "~/components/assets";
import { BondCard } from "~/components/cards";
import { AssetBreakdownChart, PriceBreakdownChart } from "~/components/chart";
import PoolComposition from "~/components/chart/pool-composition";
import { Disableable } from "~/components/types";
import { ArrowButton } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { useTranslation, useWalletSelect } from "~/hooks";
import {
  useAmplitudeAnalytics,
  useLockTokenConfig,
  useSuperfluidPool,
  useWindowSize,
} from "~/hooks";
import {
  AddLiquidityModal,
  LockTokensModal,
  RemoveLiquidityModal,
  SuperfluidValidatorModal,
} from "~/modals";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

import { Spinner } from "../loaders";
import SkeletonLoader from "../loaders/skeleton-loader";

const E = EventName.PoolDetail;

export const SharePool: FunctionComponent<{ pool: Pool }> = observer(
  ({ pool }) => {
    const {
      chainStore,
      queriesStore,
      accountStore,
      queriesExternalStore: { queryAccountsPoolRewards },
      derivedDataStore,
    } = useStore();
    const { t } = useTranslation();
    const { isMobile } = useWindowSize();
    const { isLoading: isWalletLoading } = useWalletSelect();

    const [poolDetailsContainerRef, { y: poolDetailsContainerOffset }] =
      useMeasure<HTMLDivElement>();
    const [poolHeaderRef, { height: poolHeaderHeight }] =
      useMeasure<HTMLDivElement>();
    const [poolBreakdownRef, { height: poolBreakdownHeight }] =
      useMeasure<HTMLDivElement>();

    const { chainId } = chainStore.osmosis;

    const queryCosmos = queriesStore.get(chainId).cosmos;
    const account = accountStore.getWallet(chainStore.osmosis.chainId);
    const address = account?.address ?? "";
    const queryAccountPoolRewards = queryAccountsPoolRewards.get(address);

    // queries
    const { data: userSharePool, isLoading: isUserSharePoolLoading } =
      api.edge.pools.getUserSharePool.useQuery(
        {
          poolId: pool.id,
          userOsmoAddress: address,
        },
        {
          enabled: !isWalletLoading && Boolean(address),

          // expensive query
          trpc: {
            context: {
              skipBatch: true,
            },
          },
        }
      );
    const { data: sharePool } = api.edge.pools.getSharePool.useQuery({
      poolId: pool.id,
    });
    const { data: superfluidPoolIds } =
      api.edge.pools.getSuperfluidPoolIds.useQuery();
    const isSuperfluid = superfluidPoolIds?.includes(pool.id) ?? false;

    const { data: poolIncentives, isLoading: isPoolIncentivesLoading } =
      api.edge.pools.getPoolIncentives.useQuery({
        poolId: pool.id,
      });
    const { data: poolMarketMetrics, isLoading: isPoolMarketMetricsLoading } =
      api.edge.pools.getPoolMarketMetrics.useQuery({ poolId: pool.id });

    const { data: bondDurations_, isLoading: isLoadingBondDurations } =
      api.edge.pools.getSharePoolBondDurations.useQuery(
        {
          poolId: pool.id,
          userOsmoAddress: Boolean(address) ? address : undefined,
        },
        {
          enabled: !isWalletLoading,

          // expensive query
          trpc: {
            context: {
              skipBatch: true,
            },
          },
        }
      );
    const bondDurations = useMemo(() => bondDurations_ ?? [], [bondDurations_]);

    const apiUtils = api.useUtils();
    const invalidateQueries: <T>(value: T) => T = useCallback(
      (value) => {
        apiUtils.edge.pools.getPool.invalidate({ poolId: pool.id });
        apiUtils.edge.pools.getSharePool.invalidate();

        apiUtils.edge.pools.getUserSharePool.invalidate();
        apiUtils.edge.pools.getSharePoolBondDurations.invalidate();

        return value;
      },
      [pool.id, apiUtils]
    );

    // initialize pool data stores once root pool store is loaded
    const { superfluidPoolDetail, poolBonding } = pool.id
      ? derivedDataStore.getForPool(pool.id as string)
      : {
          superfluidPoolDetail: undefined,
          poolBonding: undefined,
        };
    const { delegateSharesToValidator } = useSuperfluidPool();

    // user analytics
    const { poolName } = useMemo(
      () => ({
        poolName: pool.reserveCoins
          .map((poolAsset) => poolAsset.denom)
          .join(" / "),
      }),
      [pool]
    );
    const { logEvent } = useAmplitudeAnalytics({
      onLoadEvent: [
        E.pageViewed,
        {
          poolId: pool.id,
          poolName,
          isSuperfluidPool: isSuperfluid,
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
    } = useLockTokenConfig(sharePool?.currency);
    const [showSuperfluidValidatorModal, setShowSuperfluidValidatorsModal] =
      useState(false);
    const [showPoolDetails, setShowPoolDetails] = useState(false);

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
        poolId: pool.id,
        poolName,
        isSuperfluidPool: isSuperfluid,
        isStableswapPool: pool.type === "stable",
      }),
      [pool, poolName, isSuperfluid]
    );
    const onAddLiquidity = useCallback(
      (result: Promise<void>) => {
        const poolInfo = {
          ...baseEventInfo,
          isSuperfluidEnabled,
        };

        logEvent([E.addLiquidityStarted, poolInfo]);

        result
          .then(invalidateQueries)
          .then(() => logEvent([E.addLiquidityCompleted, poolInfo]))
          .catch(console.error)
          .finally(() => setShowAddLiquidityModal(false));
      },
      [baseEventInfo, isSuperfluidEnabled, logEvent, invalidateQueries]
    );
    const onRemoveLiquidity = useCallback(
      (result: Promise<void>) => {
        const removeLiqInfo = {
          ...baseEventInfo,
          isSuperfluidEnabled,
        };

        logEvent([E.removeLiquidityStarted, removeLiqInfo]);

        result
          .then(invalidateQueries)
          .then(() => logEvent([E.removeLiquidityCompleted, removeLiqInfo]))
          .catch(console.error)
          .finally(() => setShowRemoveLiquidityModal(false));
      },
      [baseEventInfo, isSuperfluidEnabled, logEvent, invalidateQueries]
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
            .then(invalidateQueries)
            .then(() => logEvent([E.bondingCompleted, lockInfo]))
            .finally(() => setShowLockLPTokenModal(false));
        }
      },
      [baseEventInfo, logEvent, lockToken, invalidateQueries]
    );
    const onUnlockTokens = useCallback(
      (duration: Duration) => {
        const unlockBondDuration = bondDurations.find(
          (bondDuration) =>
            bondDuration.duration.asMilliseconds() === duration.asMilliseconds()
        );
        const locks = unlockBondDuration?.userLocks;
        if (!locks) {
          console.warn("No locks found");
          return;
        }

        const unlockEvent = {
          ...baseEventInfo,
          unbondingPeriod: duration?.asDays(),
        };
        logEvent([E.unbondAllStarted, unlockEvent]);

        unlockTokens(locks)
          .then(invalidateQueries)
          .then(() => {
            logEvent([E.unbondAllCompleted, unlockEvent]);
          });
      },
      [bondDurations, baseEventInfo, logEvent, unlockTokens, invalidateQueries]
    );
    const handleSuperfluidDelegateToValidator = useCallback(
      (validatorAddress) => {
        if (!baseEventInfo.isSuperfluidPool || !pool.id) return;

        const poolInfo = {
          ...baseEventInfo,
          unbondingPeriod: 14,
          validatorName: queryCosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .getValidator(validatorAddress)?.description.moniker,
          isSuperfluidEnabled,
        };

        logEvent([E.superfluidStakeStarted, poolInfo]);

        delegateSharesToValidator(pool.id, validatorAddress, lockLPTokensConfig)
          .then(invalidateQueries)
          .then(() => logEvent([E.superfluidStakeCompleted, poolInfo]))
          .finally(() => setShowSuperfluidValidatorsModal(false));
      },
      [
        pool,
        baseEventInfo,
        queryCosmos.queryValidators,
        isSuperfluidEnabled,
        logEvent,
        delegateSharesToValidator,
        invalidateQueries,
        lockLPTokensConfig,
      ]
    );

    const levelCta = useMemo(() => {
      if (
        userSharePool?.availableShares &&
        userSharePool.availableShares.toDec().isPositive() &&
        bondDurations.some((duration) => duration.bondable)
      )
        return 2;

      return 1;
    }, [userSharePool?.availableShares, bondDurations]);
    const level2Disabled = !bondDurations.some((duration) => duration.bondable);

    const additionalRewardsByBonding = queryAccountPoolRewards
      .getUsdRewardsForPool(pool.id)
      ?.day.mul(highestAPRDailyPeriodicRate)
      .maxDecimals(3)
      .inequalitySymbol(false);

    const setShowModal = useCallback(
      (setter: Function, show: boolean) => () => setter(show),
      []
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
        {pool &&
          showRemoveLiquidityModal &&
          userSharePool &&
          userSharePool.availableShares && (
            <RemoveLiquidityModal
              isOpen={true}
              poolId={pool.id}
              onRequestClose={setShowModal(setShowRemoveLiquidityModal, false)}
              onRemoveLiquidity={onRemoveLiquidity}
              shares={userSharePool.availableShares}
              shareValue={userSharePool.availableValue}
              underlyingCoins={userSharePool.underlyingAvailableCoins}
            />
          )}
        {lockLPTokensConfig && showLockLPTokenModal && (
          <LockTokensModal
            poolId={pool.id}
            isOpen={showLockLPTokenModal}
            title={t("lockToken.title")}
            onRequestClose={() => setShowLockLPTokenModal(false)}
            amountConfig={lockLPTokensConfig}
            onLockToken={onLockToken}
          />
        )}
        {isSuperfluid &&
          sharePool &&
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
                      sharePool.currency, // is delegating amount from new/pending lockup
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
                    <PoolAssetsIcon
                      assets={pool.reserveCoins.map((asset) => ({
                        coinDenom: asset.denom,
                        coinImageUrl: asset.currency.coinImageUrl,
                      }))}
                      size="sm"
                    />
                    <h5>{poolName}</h5>
                  </div>
                  <div className="flex flex-col gap-1">
                    {isSuperfluid && (
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
                    {pool.type === "stable" && (
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
                    <SkeletonLoader
                      className={classNames(
                        isPoolMarketMetricsLoading ? "h-full w-32" : null
                      )}
                      isLoaded={!isPoolMarketMetricsLoading}
                    >
                      {poolMarketMetrics?.volume24hUsd && (
                        <h4 className="text-osmoverse-100">
                          {poolMarketMetrics.volume24hUsd.toString()}
                        </h4>
                      )}
                    </SkeletonLoader>
                  </div>
                  <div className="space-y-2">
                    <span className="body2 gap-2 text-osmoverse-400">
                      {t("pool.liquidity")}
                    </span>
                    <h4 className="text-osmoverse-100">
                      {pool.totalFiatValueLocked.toString()}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <span className="body2 gap-2 text-osmoverse-400">
                      {t("pool.swapFee")}
                    </span>
                    <h4 className="text-osmoverse-100">
                      {pool.spreadFactor.toString()}
                    </h4>
                  </div>
                </div>
              </div>
              <div ref={poolBreakdownRef}>
                {sharePool && (
                  <AssetBreakdownChart
                    assets={pool.reserveCoins.map((poolAsset) => {
                      const weights: {
                        weight: IntPretty;
                        weightFraction: RatePretty;
                      } = {
                        weight: new IntPretty(
                          sharePool.weights.find(
                            ({ denom }) =>
                              poolAsset.currency.coinMinimalDenom === denom
                          )?.weight ?? new Dec(0)
                        ),
                        weightFraction: new RatePretty(
                          sharePool.weights.find(
                            ({ denom }) =>
                              poolAsset.currency.coinMinimalDenom === denom
                          )?.weightFraction ?? new Dec(1)
                        ),
                      };

                      return {
                        ...weights,
                        amount: poolAsset,
                      };
                    })}
                    totalWeight={new IntPretty(sharePool.totalWeight)}
                  />
                )}
              </div>
            </div>
            <Button
              variant="ghost"
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
          {userSharePool && userSharePool.totalValue.toDec().isPositive() && (
            <div className="flex w-full gap-4 1.5lg:flex-col">
              <div className="flex flex-col gap-3 rounded-4xl bg-osmoverse-1000 px-8 py-7">
                <span className="body2 text-osmoverse-300">
                  {t("pool.yourStats")}
                </span>
                <div className="flex place-content-between  gap-6 sm:flex-col sm:items-start">
                  <div className="flex shrink-0 flex-col gap-1">
                    <h4 className="text-osmoverse-100">
                      {userSharePool.totalValue.toString()}
                    </h4>
                    <h6 className="subtitle1 text-osmoverse-300">
                      {t("pool.sharesAmount", {
                        shares: userSharePool
                          .totalShares!.maxDecimals(6)
                          .hideDenom(true)
                          .toString(),
                      })}
                    </h6>
                  </div>

                  <PoolComposition assets={userSharePool.totalCoins} />
                </div>
              </div>

              <div className="flex flex-1 gap-4 1.5md:flex-col">
                <div className="flex flex-1 flex-col space-y-3 rounded-4xl bg-osmoverse-1000 px-8 pt-2 pb-4">
                  <PriceBreakdownChart
                    prices={[
                      {
                        label: t("pool.bonded"),
                        price: userSharePool.lockedValue,
                      },
                      {
                        label: t("pool.available"),
                        price: userSharePool.availableValue,
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
                            .getUsdRewardsForPool(pool.id)
                            ?.day.toString() ?? "$0",
                      })}
                    </h4>
                  </div>

                  {userSharePool.availableValue.toDec().isPositive() &&
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
                href="https://docs.osmosis.zone/overview/educate/getting-started#bonding-lp-tokens"
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
                        {isPoolIncentivesLoading ? (
                          <Spinner />
                        ) : (
                          poolIncentives?.aprBreakdown?.swapFee && (
                            <h6 className="text-bullish-400 md:text-h6 md:font-h6">{`${poolIncentives.aprBreakdown.swapFee
                              .maxDecimals(2)
                              .toString()} ${t("pool.APR")}`}</h6>
                          )
                        )}
                      </div>
                    </div>
                    <span className="body2 text-osmoverse-200">
                      {t("pool.earnSwapFeesCaption")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 lg:w-full">
                    {userSharePool && (
                      <div className="hidden flex-col items-end lg:flex">
                        <h4 className="text-osmoverse-100">
                          {userSharePool.availableValue.toString()}
                        </h4>
                        {userSharePool.availableShares && (
                          <h6 className="subtitle1 text-osmoverse-300">
                            {t("pool.sharesAmount", {
                              shares: formatPretty(
                                userSharePool.availableShares.hideDenom(true),
                                { maxDecimals: 4 }
                              ),
                            })}
                          </h6>
                        )}
                      </div>
                    )}
                    <div className="flex shrink-0 flex-wrap place-content-end gap-4 xs:shrink">
                      <Button
                        className="w-fit shrink-0 xs:w-full"
                        variant="outline"
                        disabled={
                          userSharePool?.availableShares?.toDec().isZero() ??
                          true
                        }
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
                        className={classNames(
                          "w-fit shrink-0 xs:w-full",
                          levelCta === 1 &&
                            "bg-gradient-positive text-osmoverse-1000"
                        )}
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
                  {isUserSharePoolLoading && Boolean(account) ? (
                    <Spinner />
                  ) : userSharePool ? (
                    <>
                      <h4 className="text-osmoverse-100">
                        {userSharePool.availableValue.toString()}
                      </h4>
                      <h6 className="subtitle1 text-osmoverse-300">
                        {t("pool.sharesAmount", {
                          shares: formatPretty(
                            userSharePool.availableShares?.hideDenom(true) ??
                              new Dec(0),
                            { maxDecimals: 8 }
                          ),
                        })}
                      </h6>
                    </>
                  ) : (
                    <>
                      <h4 className="text-osmoverse-100">
                        {new PricePretty(
                          pool.totalFiatValueLocked.fiatCurrency,
                          0
                        ).toString()}
                      </h4>
                      <h6 className="subtitle1 text-osmoverse-300">
                        {t("pool.sharesAmount", {
                          shares: formatPretty(new Dec(0), { maxDecimals: 8 }),
                        })}
                      </h6>
                    </>
                  )}
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
                        {level2Disabled && !isLoadingBondDurations
                          ? t("pool.bondLiquidityUnavailable")
                          : t("pool.bondLiquidity")}
                      </h6>
                    </div>
                    <span className="body2 text-osmoverse-200">
                      {t("pool.bondLiquidityCaption")}
                      {isSuperfluid &&
                        ` ${t("pool.bondSuperfluidLiquidityCaption")}`}
                    </span>
                  </div>
                  {isLoadingBondDurations ? (
                    <Spinner />
                  ) : level2Disabled ? (
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
                        sharePool
                          ? sharePool.lockableDurations.length > 0 &&
                            sharePool.lockableDurations[0].asDays() ===
                              bondDuration.duration.asDays()
                            ? "/images/small-vial.svg"
                            : sharePool.lockableDurations.length > 1 &&
                              sharePool.lockableDurations[1].asDays() ===
                                bondDuration.duration.asDays()
                            ? "/images/medium-vial.svg"
                            : sharePool.lockableDurations.length > 2 &&
                              sharePool.lockableDurations[2].asDays() ===
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
