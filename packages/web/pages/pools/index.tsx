import {
  CoinPretty,
  Dec,
  DecUtils,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import {
  ObservablePoolDetail,
  ObservableQueryPool,
} from "@osmosis-labs/stores";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import Image from "next/image";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { ShowMoreButton } from "~/components/buttons/show-more";
import { PoolCard } from "~/components/cards";
import { POOLS_PER_PAGE } from "~/components/complex";
import { AllPoolsTableSet } from "~/components/complex/all-pools-table-set";
import { CompactPoolTableDisplay } from "~/components/complex/compact-pool-table-display";
import { ExternalIncentivizedPoolsTableSet } from "~/components/complex/external-incentivized-pools-table-set";
import { TabBox } from "~/components/control";
import { MetricLoader } from "~/components/loaders";
import { PoolsOverview } from "~/components/overview/pools";
import { EventName, UserAction } from "~/config";
import {
  useAmplitudeAnalytics,
  useCreatePoolConfig,
  useFilteredData,
  useHideDustUserSetting,
  useLockTokenConfig,
  usePaginatedData,
  useSortedData,
  useSuperfluidPool,
  useWindowSize,
} from "~/hooks";
import { DataSorter } from "~/hooks/data/data-sorter";
import {
  AddLiquidityModal,
  CreatePoolModal,
  LockTokensModal,
  RemoveLiquidityModal,
  SuperfluidValidatorModal,
} from "~/modals";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

const TVL_FILTER_THRESHOLD = 1000;

const LESS_SUPERFLUID_POOLS_COUNT = 6;

const Pools: NextPage = observer(function () {
  const {
    chainStore,
    accountStore,
    priceStore,
    queriesStore,
    queriesExternalStore,
    derivedDataStore,
  } = useStore();
  const t = useTranslation();
  const { isMobile } = useWindowSize();
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Pools.pageViewed],
  });

  const { chainId } = chainStore.osmosis;
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
        apr:
          derivedDataStore.poolsBonding.get(superfluidPool.id)
            .highestBondDuration?.aggregateApr ?? new RatePretty(0),
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
  const { superfluidDelegateToValidator } = useSuperfluidPool();
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
        onSelectValidator: (address) => {
          if (!lockLpTokenModalPoolId) {
            console.error(
              "onSelectValidator: lockLpTokenModalPoolId is undefined"
            );
            setSuperfluidDelegateModalProps(null);
            lockLpTokenConfig.setAmount("");
            return;
          }

          superfluidDelegateToValidator(
            lockLpTokenModalPoolId,
            address,
            lockLpTokenConfig
          ).finally(() => {
            setSuperfluidDelegateModalProps(null);
            lockLpTokenConfig.setAmount("");
          });
        },
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
        .map((myPoolId) => derivedDataStore.poolDetails.get(myPoolId))
        .filter((pool): pool is ObservablePoolDetail => !!pool),
    [
      isMobile,
      showMoreMyPools,
      myPoolIds,
      queryOsmosis.queryGammPools.isFetching,
    ]
  );
  const dustFilteredPools = useHideDustUserSetting(myPools, (pool) => {
    const _queryPool = pool.pool;
    if (!_queryPool) return;
    return pool.totalValueLocked.mul(
      queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
        account.bech32Address,
        _queryPool.id
      )
    );
  });

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
                const _queryPool = myPool.pool;

                if (!_queryPool) return null;

                const poolBonding = derivedDataStore.poolsBonding.get(
                  _queryPool.id
                );
                const apr =
                  poolBonding.highestBondDuration?.aggregateApr ??
                  new RatePretty(0);

                const poolLiquidity = myPool.totalValueLocked;
                const myBonded = myPool.userBondedValue;
                const myLiquidity = myPool.userAvailableValue;

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
                            ? formatPretty(myLiquidity)
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
                        <h6>{formatPretty(myBonded)}</h6>
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
                    key={_queryPool.id}
                    poolId={_queryPool.id}
                    poolAssets={_queryPool.poolAssets.map((poolAsset) => ({
                      coinImageUrl: poolAsset.amount.currency.coinImageUrl,
                      coinDenom: poolAsset.amount.currency.coinDenom,
                    }))}
                    poolMetrics={myPoolMetrics}
                    isSuperfluid={queryOsmosis.querySuperfluidPools.isSuperfluidPool(
                      _queryPool.id
                    )}
                    mobileShowFirstLabel
                    onClick={() =>
                      logEvent([
                        EventName.Pools.myPoolsCardClicked,
                        {
                          poolId: _queryPool.id,
                          poolName: _queryPool.poolAssets
                            .map(
                              (poolAsset) => poolAsset.amount.currency.coinDenom
                            )
                            .join(" / "),
                          poolWeight: _queryPool.weightedPoolInfo?.assets
                            .map((poolAsset) =>
                              poolAsset.weightFraction?.toString()
                            )
                            .join(" / "),
                          isSuperfluidPool:
                            queryOsmosis.querySuperfluidPools.isSuperfluidPool(
                              _queryPool.id
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
                                <h6>{formatPretty(poolLiquidity)}</h6>
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
      {UserAction.CreateNewPool && (
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
      )}
    </main>
  );
});

export default Pools;
