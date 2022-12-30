import Image from "next/image";
import type { NextPage } from "next";
import {
  CoinPretty,
  Dec,
  DecUtils,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useState, ComponentProps, useMemo, useCallback } from "react";
import { Duration } from "dayjs/plugin/duration";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { PoolCard } from "../../components/cards";
import { AllPoolsTableSet } from "../../components/complex/all-pools-table-set";
import { ExternalIncentivizedPoolsTableSet } from "../../components/complex/external-incentivized-pools-table-set";
import {
  CreatePoolModal,
  AddLiquidityModal,
  RemoveLiquidityModal,
  SuperfluidValidatorModal,
  LockTokensModal,
} from "../../modals";
import { PoolsOverview } from "../../components/overview/pools";
import { MetricLoader } from "../../components/loaders";
import { TabBox } from "../../components/control";
import { useStore } from "../../stores";
import { DataSorter } from "../../hooks/data/data-sorter";
import {
  useWindowSize,
  useFilteredData,
  usePaginatedData,
  useSortedData,
  useCreatePoolConfig,
  useAmplitudeAnalytics,
  useLockTokenConfig,
  useSuperfluidPool,
  useHideDustUserSetting,
} from "../../hooks";
import { CompactPoolTableDisplay } from "../../components/complex/compact-pool-table-display";
import { ShowMoreButton } from "../../components/buttons/show-more";
import { EventName, ExternalIncentiveGaugeAllowList } from "../../config";
import { POOLS_PER_PAGE } from "../../components/complex";
import { useTranslation } from "react-multi-lang";
import { priceFormatter } from "../../utils/formatter";

const TVL_FILTER_THRESHOLD = 1000;

const LESS_SUPERFLUID_POOLS_COUNT = 6;

const Pools: NextPage = observer(function () {
  const {
    chainStore,
    accountStore,
    priceStore,
    queriesStore,
    queriesExternalStore,
  } = useStore();
  const t = useTranslation();
  const { isMobile } = useWindowSize();
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Pools.pageViewed],
  });

  const { chainId } = chainStore.osmosis;
  const queryCosmos = queriesStore.get(chainId).cosmos;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getAccount(chainId);

  const superfluidPoolIds = queryOsmosis.querySuperfluidPools.superfluidPoolIds;
  const superfluidPools = new DataSorter(
    superfluidPoolIds
      ?.map((poolId) => queryOsmosis.queryGammPools.getPool(poolId))
      .filter((pool): pool is ObservableQueryPool => pool !== undefined)
      .map((superfluidPool) => ({
        id: superfluidPool.id,
        poolFeesMetrics:
          queriesExternalStore.queryGammPoolFeeMetrics.getPoolFeesMetrics(
            superfluidPool.id,
            priceStore
          ),
        apr: queryOsmosis.queryIncentivizedPools.computeMostApr(
          superfluidPool.id,
          priceStore
        ),
        poolLiquidity: superfluidPool.computeTotalValueLocked(priceStore),
        assets: superfluidPool.poolAssets.map((asset) => {
          const weightedAsset = superfluidPool.weightedPoolInfo?.assets.find(
            (weightedAsset) =>
              weightedAsset.denom === asset.amount.currency.coinMinimalDenom
          );
          const weightFraction =
            weightedAsset?.weightFraction ??
            new RatePretty(
              new Dec(1).quo(new Dec(superfluidPool.poolAssets.length))
            ); // stableswap pools have consistent weight fraction

          return {
            coinImageUrl: asset.amount.currency.coinImageUrl,
            coinDenom: asset.amount.currency.coinDenom,
            weightFraction,
          };
        }),
      })) ?? []
  )
    .process("poolLiquidity")
    .reverse();
  const [showMoreSfsPools, setShowMoreSfsPools] = useState(false);

  // create pool dialog
  const [isCreatingPool, setIsCreatingPool] = useState(false);

  const createPoolConfig = useCreatePoolConfig(
    chainStore,
    chainId,
    account.bech32Address,
    queriesStore
  );

  // Mobile only - pools (superfluid) pools sorting/filtering
  const [showMoreMyPools, setShowMoreMyPools] = useState(false);
  const [query, setQuery, fiteredSfsPools] = useFilteredData(
    superfluidPools ?? [],
    ["id", "assets.coinDenom"]
  );

  const [sortKeyPath, setSortKeyPath, , , toggleSortDirection, sortedSfsPools] =
    useSortedData(fiteredSfsPools, "apr", "descending");

  const [page, setPage, minPage, numPages, sfsPoolsPage] = usePaginatedData(
    sortedSfsPools,
    POOLS_PER_PAGE
  );
  /// show pools > $1k TVL
  const [isPoolTvlFiltered, setIsPoolTvlFiltered] = useState(false);

  // pool quick action modals
  const [addLiquidityModalPoolId, setAddLiquidityModalPoolId] = useState<
    string | null
  >(null);
  const [removeLiquidityModalPoolId, setRemoveLiquidityModalPoolId] = useState<
    string | null
  >(null);
  const [lockLpTokenModalPoolId, setLockLpTokenModalPoolId] = useState<
    string | null
  >(null);
  const [superfluidDelegateModalProps, setSuperfluidDelegateModalProps] =
    useState<ComponentProps<typeof SuperfluidValidatorModal> | null>(null);

  // TODO: add amplitude events for quick actions on pool
  const quickActionProps = {
    quickAddLiquidity: (poolId: string) => setAddLiquidityModalPoolId(poolId),
    quickRemoveLiquidity: (poolId: string) =>
      setRemoveLiquidityModalPoolId(poolId),
    quickLockTokens: (poolId: string) => setLockLpTokenModalPoolId(poolId),
  };

  // lock tokens (& possibly select sfs validator) quick action state
  const { superfluidDelegateToValidator } = useSuperfluidPool(
    lockLpTokenModalPoolId ?? ""
  );
  const selectedPoolShareCurrency = lockLpTokenModalPoolId
    ? queryOsmosis.queryGammPoolShare.getShareCurrency(lockLpTokenModalPoolId)
    : undefined;
  const { config: lockLpTokenConfig, lockToken } = useLockTokenConfig(
    selectedPoolShareCurrency
  );
  const onLockToken = (duration: Duration, electSuperfluid?: boolean) => {
    if (electSuperfluid && selectedPoolShareCurrency) {
      // open superfluid modal
      setSuperfluidDelegateModalProps({
        isOpen: true,
        availableBondAmount: new CoinPretty(
          selectedPoolShareCurrency,
          lockLpTokenConfig.getAmountPrimitive().amount
        ),
        onSelectValidator: (address) =>
          superfluidDelegateToValidator(address, lockLpTokenConfig).finally(
            () => {
              setSuperfluidDelegateModalProps(null);
              lockLpTokenConfig.setAmount("");
            }
          ),
        onRequestClose: () => setSuperfluidDelegateModalProps(null),
      });
      setLockLpTokenModalPoolId(null);
    } else {
      lockToken(duration).finally(() => {
        setLockLpTokenModalPoolId(null);
        setSuperfluidDelegateModalProps(null);
        lockLpTokenConfig.setAmount("");
      });
    }
  };

  const onCreatePool = useCallback(async () => {
    try {
      if (createPoolConfig.poolType === "weighted") {
        await account.osmosis.sendCreateBalancerPoolMsg(
          createPoolConfig.swapFee,
          createPoolConfig.assets.map((asset) => {
            if (!asset.percentage)
              throw new Error(
                "Pool config with poolType of weighted doesn't include asset percentage"
              );

            return {
              weight: new Dec(asset.percentage)
                .mul(DecUtils.getTenExponentNInPrecisionRange(4))
                .truncate()
                .toString(),
              token: {
                amount: asset.amountConfig.amount,
                currency: asset.amountConfig.sendCurrency,
              },
            };
          }),
          undefined,
          () => {
            setIsCreatingPool(false);
          }
        );
      } else if (createPoolConfig.poolType === "stable") {
        const scalingFactorController =
          createPoolConfig.scalingFactorControllerAddress
            ? createPoolConfig.scalingFactorControllerAddress
            : undefined;
        await account.osmosis.sendCreateStableswapPoolMsg(
          createPoolConfig.swapFee,
          createPoolConfig.assets.map((asset) => {
            if (!asset.scalingFactor)
              throw new Error(
                "Pool config with poolType of stable doesn't include scaling factors"
              );

            return {
              scalingFactor: asset.scalingFactor,
              token: {
                amount: asset.amountConfig.amount,
                currency: asset.amountConfig.sendCurrency,
              },
            };
          }),
          scalingFactorController,
          undefined,
          () => {
            setIsCreatingPool(false);
          }
        );
      }
    } catch (e) {
      setIsCreatingPool(false);
      console.error(e);
    }
  }, [createPoolConfig, account]);

  // my pools
  const myPoolIds = queryOsmosis.queryGammPoolShare.getOwnPools(
    account.bech32Address
  );
  const poolCountShowMoreThreshold = isMobile ? 3 : 6;
  const myPools = useMemo(
    () =>
      (isMobile && !showMoreMyPools
        ? myPoolIds.slice(0, poolCountShowMoreThreshold)
        : myPoolIds
      )
        .map((myPoolId) => queryOsmosis.queryGammPools.getPool(myPoolId))
        .filter((pool): pool is ObservableQueryPool => !!pool),
    [
      isMobile,
      showMoreMyPools,
      myPoolIds,
      queryOsmosis.queryGammPools.isFetching,
    ]
  );
  const dustFilteredPools = useHideDustUserSetting(myPools, (pool) =>
    pool
      .computeTotalValueLocked(priceStore)
      .mul(
        queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
          account.bech32Address,
          pool.id
        )
      )
  );

  const [mobilePoolsTabIndex, _setMobilePoolsTabIndex] = useState(0);
  const setMobilePoolsTabIndex = useCallback((tabIndex: number) => {
    if (tabIndex === 1) {
      queryOsmosis.queryGammPools.fetchRemainingPools();
    }
    _setMobilePoolsTabIndex(tabIndex);
  }, []);

  return (
    <main className="m-auto max-w-container bg-osmoverse-900 px-8 md:px-3">
      <CreatePoolModal
        isOpen={isCreatingPool}
        onRequestClose={() => setIsCreatingPool(false)}
        title={t("pools.createPool.title")}
        createPoolConfig={createPoolConfig}
        isSendingMsg={account.txTypeInProgress !== ""}
        onCreatePool={onCreatePool}
      />
      {addLiquidityModalPoolId && (
        <AddLiquidityModal
          title={t("addLiquidity.titleInPool", {
            poolId: addLiquidityModalPoolId,
          })}
          poolId={addLiquidityModalPoolId}
          isOpen={true}
          onRequestClose={() => setAddLiquidityModalPoolId(null)}
        />
      )}
      {removeLiquidityModalPoolId && (
        <RemoveLiquidityModal
          title={t("removeLiquidity.titleInPool", {
            poolId: removeLiquidityModalPoolId,
          })}
          poolId={removeLiquidityModalPoolId}
          isOpen={true}
          onRequestClose={() => setRemoveLiquidityModalPoolId(null)}
        />
      )}
      {lockLpTokenModalPoolId && (
        <LockTokensModal
          title={t("lockToken.titleInPool", { poolId: lockLpTokenModalPoolId })}
          isOpen={true}
          poolId={lockLpTokenModalPoolId}
          amountConfig={lockLpTokenConfig}
          onLockToken={onLockToken}
          onRequestClose={() => setLockLpTokenModalPoolId(null)}
        />
      )}
      {superfluidDelegateModalProps && (
        <SuperfluidValidatorModal {...superfluidDelegateModalProps} />
      )}
      <section className="pt-8 pb-10 md:pt-4 md:pb-5">
        <PoolsOverview className="mx-auto" />
      </section>
      <section>
        <div className="mx-auto pb-[3.75rem]">
          <h5 className="md:px-3">{t("pools.myPools")}</h5>
          <div className="flex flex-col gap-4">
            <div className="grid-cards mt-5 grid md:gap-3">
              {dustFilteredPools.map((myPool) => {
                // TODO: refactor to use new pool detail stores

                const internalIncentiveApr =
                  queryOsmosis.queryIncentivizedPools.computeMostApr(
                    myPool.id,
                    priceStore
                  );
                const swapFeeApr =
                  queriesExternalStore.queryGammPoolFeeMetrics.get7dPoolFeeApr(
                    myPool,
                    priceStore
                  );
                const whitelistedGauges =
                  ExternalIncentiveGaugeAllowList?.[myPool.id] ?? undefined;
                const highestDuration =
                  queryOsmosis.queryLockableDurations.highestDuration;

                const externalApr = (whitelistedGauges ?? []).reduce(
                  (sum, { gaugeId, denom }) => {
                    const gauge = queryOsmosis.queryGauge.get(gaugeId);

                    if (
                      !gauge ||
                      !highestDuration ||
                      gauge.lockupDuration.asMilliseconds() !==
                        highestDuration.asMilliseconds()
                    ) {
                      return sum;
                    }

                    return sum.add(
                      queryOsmosis.queryIncentivizedPools.computeExternalIncentiveGaugeAPR(
                        myPool.id,
                        gaugeId,
                        denom,
                        priceStore
                      )
                    );
                  },
                  new RatePretty(0)
                );
                const superfluidApr =
                  queryOsmosis.querySuperfluidPools.isSuperfluidPool(myPool.id)
                    ? new RatePretty(
                        queryCosmos.queryInflation.inflation
                          .mul(
                            queryOsmosis.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                              myPool.id
                            )
                          )
                          .moveDecimalPointLeft(2)
                      )
                    : new RatePretty(0);
                const apr = internalIncentiveApr
                  .add(swapFeeApr)
                  .add(externalApr)
                  .add(superfluidApr);

                const poolLiquidity =
                  myPool.computeTotalValueLocked(priceStore);
                const myBonded =
                  queryOsmosis.queryGammPoolShare.getLockedGammShareValue(
                    account.bech32Address,
                    myPool.id,
                    poolLiquidity,
                    priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!
                  );
                const myLiquidity = !myPool.totalShare
                  .toDec()
                  .equals(new Dec(0))
                  ? myPool
                      .computeTotalValueLocked(priceStore)
                      .mul(
                        queryOsmosis.queryGammPoolShare
                          .getAvailableGammShare(
                            account.bech32Address,
                            myPool.id
                          )
                          .quo(myPool.totalShare)
                      )
                  : new PricePretty(
                      priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!,
                      new Dec(0)
                    );

                let myPoolMetrics = [
                  {
                    label: t("pools.APR"),
                    value: isMobile ? (
                      apr.maxDecimals(2).toString()
                    ) : (
                      <MetricLoader
                        isLoading={
                          queryOsmosis.queryIncentivizedPools.isAprFetching
                        }
                      >
                        <h6>{apr.maxDecimals(2).toString()}</h6>
                      </MetricLoader>
                    ),
                  },
                  {
                    label: isMobile
                      ? t("pools.available")
                      : t("pools.myLiquidity"),
                    value: (
                      <MetricLoader isLoading={poolLiquidity.toDec().isZero()}>
                        <h6>
                          {isMobile
                            ? priceFormatter(myLiquidity)
                            : myLiquidity.maxDecimals(2).toString()}
                        </h6>
                      </MetricLoader>
                    ),
                  },
                  {
                    label: t("pools.bonded"),
                    value: isMobile ? (
                      myBonded.toString()
                    ) : (
                      <MetricLoader isLoading={poolLiquidity.toDec().isZero()}>
                        <h6>{priceFormatter(myBonded)}</h6>
                      </MetricLoader>
                    ),
                  },
                ];

                // rearrange metrics for mobile pool card
                if (isMobile) {
                  myPoolMetrics = [
                    myPoolMetrics[2], // Bonded
                    myPoolMetrics[1], // Available
                    myPoolMetrics[0], // APR
                  ];
                }

                return (
                  <PoolCard
                    key={myPool.id}
                    poolId={myPool.id}
                    poolAssets={myPool.poolAssets.map((poolAsset) => ({
                      coinImageUrl: poolAsset.amount.currency.coinImageUrl,
                      coinDenom: poolAsset.amount.currency.coinDenom,
                    }))}
                    poolMetrics={myPoolMetrics}
                    isSuperfluid={queryOsmosis.querySuperfluidPools.isSuperfluidPool(
                      myPool.id
                    )}
                    mobileShowFirstLabel
                    onClick={() =>
                      logEvent([
                        EventName.Pools.myPoolsCardClicked,
                        {
                          poolId: myPool.id,
                          poolName: myPool.poolAssets
                            .map(
                              (poolAsset) => poolAsset.amount.currency.coinDenom
                            )
                            .join(" / "),
                          poolWeight: myPool.weightedPoolInfo?.assets
                            .map((poolAsset) =>
                              poolAsset.weightFraction?.toString()
                            )
                            .join(" / "),
                          isSuperfluidPool:
                            queryOsmosis.querySuperfluidPools.isSuperfluidPool(
                              myPool.id
                            ),
                        },
                      ])
                    }
                  />
                );
              })}
            </div>
            {isMobile && myPoolIds.length > poolCountShowMoreThreshold && (
              <div className="mx-auto">
                <ShowMoreButton
                  isOn={showMoreMyPools}
                  onToggle={() => setShowMoreMyPools(!showMoreMyPools)}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      {isMobile ? (
        <section>
          <h5 className="md:px-3">{t("pools.all")}</h5>
          <TabBox
            tabs={[
              {
                title: t("pools.incentivized"),
                content: (
                  <AllPoolsTableSet
                    tableSet="incentivized-pools"
                    {...quickActionProps}
                  />
                ),
              },
              {
                title: t("pools.allTab"),
                content: (
                  <AllPoolsTableSet
                    tableSet="all-pools"
                    {...quickActionProps}
                  />
                ),
              },
              {
                title: t("pools.externalIncentivized.title"),
                content: (
                  <ExternalIncentivizedPoolsTableSet {...quickActionProps} />
                ),
              },
              {
                title: (
                  <span className="text-superfluid">
                    {t("pools.superfluid.tab")}
                  </span>
                ),
                content: (
                  <CompactPoolTableDisplay
                    pools={
                      sfsPoolsPage?.map(
                        ({ id, poolLiquidity, apr, assets }) => ({
                          id,
                          assets: assets ?? [],
                          metrics: [
                            ...[
                              sortKeyPath === "poolLiquidity"
                                ? {
                                    label: t("pools.allPools.TVL"),
                                    value: poolLiquidity.toString(),
                                  }
                                : sortKeyPath === "apr"
                                ? {
                                    label: t("pools.allPools.APR"),
                                    value: apr
                                      .maxDecimals(2)
                                      .trim(true)
                                      .toString(),
                                  }
                                : {
                                    label: t("pools.allPools.APR"),
                                    value: apr
                                      .maxDecimals(2)
                                      .trim(true)
                                      .toString(),
                                  },
                            ],
                            ...[
                              sortKeyPath === "poolLiquidity"
                                ? {
                                    label: t("pools.allPools.APR"),
                                    value: apr
                                      .maxDecimals(2)
                                      .trim(true)
                                      .toString(),
                                  }
                                : {
                                    label: t("pools.allPools.TVL"),
                                    value: poolLiquidity.toString(),
                                  },
                            ],
                          ],
                          isSuperfluid: true,
                        })
                      ) ?? []
                    }
                    searchBoxProps={{
                      currentValue: query,
                      onInput: setQuery,
                      placeholder: "Filter by symbol",
                    }}
                    sortMenuProps={{
                      options: [
                        { id: "id", display: t("pools.allPools.sort.poolId") },
                        { id: "apr", display: t("pools.allPools.APR") },
                        {
                          id: "poolLiquidity",
                          display: t("pools.allPools.sort.liquidity"),
                        },
                      ],
                      selectedOptionId: sortKeyPath,
                      onSelect: (id) =>
                        id === sortKeyPath
                          ? setSortKeyPath("")
                          : setSortKeyPath(id),
                      onToggleSortDirection: toggleSortDirection,
                    }}
                    pageListProps={{
                      currentValue: page,
                      max: numPages,
                      min: minPage,
                      onInput: setPage,
                    }}
                    minTvlToggleProps={{
                      isOn: isPoolTvlFiltered,
                      onToggle: setIsPoolTvlFiltered,
                      label: t("pools.allPools.displayLowLiquidity", {
                        value: new PricePretty(
                          priceStore.getFiatCurrency(
                            priceStore.defaultVsCurrency
                          )!,
                          TVL_FILTER_THRESHOLD
                        ).toString(),
                      }),
                    }}
                  />
                ),
                className: "!border-superfluid",
              },
            ]}
            tabSelection={{
              selectedTabIndex: mobilePoolsTabIndex,
              onTabSelected: setMobilePoolsTabIndex,
            }}
          />
        </section>
      ) : (
        <>
          <section>
            <div className="mx-auto">
              <h5>{t("pools.superfluid.title")}</h5>
              <div className="grid-cards my-5 grid">
                {superfluidPools &&
                  (showMoreSfsPools
                    ? superfluidPools
                    : superfluidPools.slice(0, LESS_SUPERFLUID_POOLS_COUNT)
                  ).map(
                    ({ id, apr, assets, poolFeesMetrics, poolLiquidity }) => (
                      <PoolCard
                        key={id}
                        poolId={id}
                        poolAssets={assets}
                        poolMetrics={[
                          {
                            label: t("pools.superfluid.APR"),
                            value: (
                              <MetricLoader
                                isLoading={
                                  queryOsmosis.queryIncentivizedPools
                                    .isAprFetching
                                }
                              >
                                <h6>{apr.maxDecimals(2).toString()}</h6>
                              </MetricLoader>
                            ),
                          },
                          {
                            label: t("pools.superfluid.liquidity"),
                            value: (
                              <MetricLoader
                                isLoading={poolLiquidity.toDec().isZero()}
                              >
                                <h6>{priceFormatter(poolLiquidity)}</h6>
                              </MetricLoader>
                            ),
                          },
                          {
                            label: t("pools.superfluid.fees7D"),
                            value: (
                              <MetricLoader
                                isLoading={!poolFeesMetrics.feesSpent7d.isReady}
                              >
                                <h6>
                                  {poolFeesMetrics.feesSpent7d.toString()}
                                </h6>
                              </MetricLoader>
                            ),
                          },
                        ]}
                        isSuperfluid
                        onClick={() =>
                          logEvent([
                            EventName.Pools.superfluidPoolsCardClicked,
                            {
                              poolId: id,
                              poolName: assets
                                .map((asset) => asset.coinDenom)
                                .join(" / "),
                              poolWeight: assets
                                .map((asset) =>
                                  asset.weightFraction?.toString()
                                )
                                .join(" / "),
                            },
                          ])
                        }
                      />
                    )
                  )}
              </div>
              {superfluidPools.length > LESS_SUPERFLUID_POOLS_COUNT && (
                <ShowMoreButton
                  className="mx-auto"
                  isOn={showMoreSfsPools}
                  onToggle={() => setShowMoreSfsPools(!showMoreSfsPools)}
                />
              )}
            </div>
          </section>
          <section>
            <div className="mx-auto py-[3.75rem]">
              <AllPoolsTableSet {...quickActionProps} />
            </div>
          </section>
          <section className="min-h-screen">
            <div className="mx-auto py-[3.75rem]">
              <ExternalIncentivizedPoolsTableSet {...quickActionProps} />
            </div>
          </section>
        </>
      )}
      <section className="pb-4">
        <div className="flex w-full items-center rounded-full bg-osmoverse-800 px-5 py-4">
          <span className="subtitle1 flex items-center gap-1 md:text-subtitle2 md:font-subtitle2">
            {t("pools.createPool.interestedCreate")}{" "}
            <u
              className="flex cursor-pointer items-center text-wosmongton-300"
              onClick={() => setIsCreatingPool(true)}
            >
              {t("pools.createPool.startProcess")}
              <div className="flex shrink-0 items-center">
                <Image
                  alt="right arrow"
                  src="/icons/arrow-right-wosmongton-300.svg"
                  height={24}
                  width={24}
                />
              </div>
            </u>
          </span>
        </div>
      </section>
    </main>
  );
});

export default Pools;
