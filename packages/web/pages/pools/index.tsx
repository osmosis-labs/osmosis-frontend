import type { NextPage } from "next";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useState, ComponentProps } from "react";
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
import { priceFormatter } from "../../components/utils";
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
  usePoolDetailConfig,
  useSuperfluidPoolConfig,
  usePoolGauges,
  useNavBarCtas,
} from "../../hooks";
import { CompactPoolTableDisplay } from "../../components/complex/compact-pool-table-display";
import { ShowMoreButton } from "../../components/buttons/show-more";
import { EventName } from "../../config";
import { POOLS_PER_PAGE } from "../../components/complex";
import { useTranslation } from "react-multi-lang";

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
  useNavBarCtas([
    { label: "Create new Pool", onClick: () => setIsCreatingPool(true) },
  ]);

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const queriesExternal = queriesExternalStore.get();

  const account = accountStore.getAccount(chainId);

  const myPoolIds = queryOsmosis.queryGammPoolShare.getOwnPools(
    account.bech32Address
  );

  const superfluidPoolIds = queryOsmosis.querySuperfluidPools.superfluidPoolIds;
  const superfluidPools = new DataSorter(
    superfluidPoolIds
      ?.map((poolId) => queryOsmosis.queryGammPools.getPool(poolId))
      .filter((pool): pool is ObservableQueryPool => pool !== undefined)
      .map((superfluidPool) => ({
        id: superfluidPool.id,
        poolFeesMetrics:
          queriesExternal.queryGammPoolFeeMetrics.getPoolFeesMetrics(
            superfluidPool.id,
            priceStore
          ),
        apr: queryOsmosis.queryIncentivizedPools.computeMostAPY(
          superfluidPool.id,
          priceStore
        ),
        poolLiquidity: superfluidPool.computeTotalValueLocked(priceStore),
        assets: superfluidPool.poolAssets.map((poolAsset) => ({
          coinImageUrl: poolAsset.amount.currency.coinImageUrl,
          coinDenom: poolAsset.amount.currency.coinDenom,
          weightFraction: poolAsset.weightFraction,
        })),
      })) ?? []
  )
    .process("poolLiquidity")
    .reverse();
  const [showMoreSfsPools, setShowMoreSfsPools] = useState(false);

  const poolCountShowMoreThreshold = isMobile ? 3 : 6;

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
  const { poolDetailConfig } = usePoolDetailConfig(
    lockLpTokenModalPoolId ?? undefined
  );
  const { allAggregatedGauges } = usePoolGauges(
    lockLpTokenModalPoolId ?? undefined
  );
  const { superfluidPoolConfig: _, superfluidDelegateToValidator } =
    useSuperfluidPoolConfig(poolDetailConfig);
  const selectedPoolShareCurrency = lockLpTokenModalPoolId
    ? queryOsmosis.queryGammPoolShare.getShareCurrency(lockLpTokenModalPoolId)
    : undefined;
  const { config: lockLpTokenConfig, lockToken } = useLockTokenConfig(
    chainStore,
    queriesStore,
    chainId,
    selectedPoolShareCurrency
  );
  const onLockToken = (gaugeId: string, electSuperfluid?: boolean) => {
    const gauge = allAggregatedGauges?.find((gauge) => gauge.id === gaugeId);
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
    } else if (gauge) {
      lockToken(gauge.duration).finally(() => {
        setLockLpTokenModalPoolId(null);
        setSuperfluidDelegateModalProps(null);
        lockLpTokenConfig.setAmount("");
      });
    }
  };

  return (
    <main className="bg-background px-8">
      {isCreatingPool && (
        <CreatePoolModal
          isOpen={isCreatingPool}
          onRequestClose={() => setIsCreatingPool(false)}
          title={t("pools.createPool.title")}
          createPoolConfig={createPoolConfig}
          isSendingMsg={account.txTypeInProgress !== ""}
          onCreatePool={async () => {
            try {
              await account.osmosis.sendCreatePoolMsg(
                createPoolConfig.swapFee,
                createPoolConfig.assets.map((asset) => ({
                  weight: new Dec(asset.percentage)
                    .mul(DecUtils.getTenExponentNInPrecisionRange(4))
                    .truncate()
                    .toString(),
                  token: {
                    amount: asset.amountConfig.amount,
                    currency: asset.amountConfig.sendCurrency,
                  },
                })),
                undefined,
                () => {
                  setIsCreatingPool(false);
                }
              );
            } catch (e) {
              setIsCreatingPool(false);
              console.error(e);
            }
          }}
        />
      )}
      {addLiquidityModalPoolId && (
        <AddLiquidityModal
          poolId={addLiquidityModalPoolId}
          isOpen={true}
          onRequestClose={() => setAddLiquidityModalPoolId(null)}
        />
      )}
      {removeLiquidityModalPoolId && (
        <RemoveLiquidityModal
          poolId={removeLiquidityModalPoolId}
          isOpen={true}
          onRequestClose={() => setRemoveLiquidityModalPoolId(null)}
        />
      )}
      {lockLpTokenModalPoolId && (
        <LockTokensModal
          title={`Lock shares in Pool #${lockLpTokenModalPoolId}`}
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
      <section className="pt-20 pb-10">
        <PoolsOverview className="mx-auto" />
      </section>
      <section>
        <div className="mx-auto pb-[3.75rem]">
          {isMobile ? (
            <span className="subtitle2">{t("pools.myPools")}</span>
          ) : (
            <h5>{t("pools.myPools")}</h5>
          )}
          <div className="flex flex-col gap-4">
            <div className="mt-5 grid grid-cards md:gap-3">
              {(isMobile && !showMoreMyPools
                ? myPoolIds.slice(0, poolCountShowMoreThreshold)
                : myPoolIds
              ).map((myPoolId) => {
                const myPool = queryOsmosis.queryGammPools.getPool(myPoolId);
                if (myPool) {
                  const apr =
                    queryOsmosis.queryIncentivizedPools.computeMostAPY(
                      myPool.id,
                      priceStore
                    );
                  const poolLiquidity =
                    myPool.computeTotalValueLocked(priceStore);
                  const myBonded =
                    queryOsmosis.queryGammPoolShare.getLockedGammShareValue(
                      account.bech32Address,
                      myPoolId,
                      poolLiquidity,
                      priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!
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
                          {apr.maxDecimals(2).toString()}
                        </MetricLoader>
                      ),
                    },
                    {
                      label: isMobile
                        ? t("pools.available")
                        : t("pools.liquidity"),
                      value: isMobile ? (
                        (!myPool.totalShare.toDec().equals(new Dec(0))
                          ? myPool
                              .computeTotalValueLocked(priceStore)
                              .mul(
                                queryOsmosis.queryGammPoolShare
                                  .getAvailableGammShare(
                                    account.bech32Address,
                                    myPoolId
                                  )
                                  .quo(myPool.totalShare)
                              )
                          : new PricePretty(
                              priceStore.getFiatCurrency(
                                priceStore.defaultVsCurrency
                              )!,
                              new Dec(0)
                            )
                        )
                          .maxDecimals(2)
                          .toString()
                      ) : (
                        <MetricLoader
                          isLoading={poolLiquidity.toDec().isZero()}
                        >
                          {priceFormatter(poolLiquidity)}
                        </MetricLoader>
                      ),
                    },
                    {
                      label: t("pools.bonded"),
                      value: isMobile ? (
                        myBonded.toString()
                      ) : (
                        <MetricLoader
                          isLoading={poolLiquidity.toDec().isZero()}
                        >
                          {priceFormatter(myBonded)}
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
                      key={myPoolId}
                      poolId={myPoolId}
                      poolAssets={myPool.poolAssets.map((poolAsset) => ({
                        coinImageUrl: poolAsset.amount.currency.coinImageUrl,
                        coinDenom: poolAsset.amount.currency.coinDenom,
                      }))}
                      poolMetrics={myPoolMetrics}
                      isSuperfluid={queryOsmosis.querySuperfluidPools.isSuperfluidPool(
                        myPoolId
                      )}
                      mobileShowFirstLabel
                      onClick={() =>
                        logEvent([
                          EventName.Pools.myPoolsCardClicked,
                          {
                            poolId: myPoolId,
                            poolName: myPool.poolAssets
                              .map(
                                (poolAsset) =>
                                  poolAsset.amount.currency.coinDenom
                              )
                              .join(" / "),
                            poolWeight: myPool.poolAssets
                              .map((poolAsset) =>
                                poolAsset.weightFraction.toString()
                              )
                              .join(" / "),
                            isSuperfluidPool:
                              queryOsmosis.querySuperfluidPools.isSuperfluidPool(
                                myPoolId
                              ),
                          },
                        ])
                      }
                    />
                  );
                }
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
                title: t("pools.all"),
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
                  <span className="superfluid caption">Superfluid Pools</span>
                ),
                content: (
                  <CompactPoolTableDisplay
                    title="Superfluid Pools"
                    pools={
                      sfsPoolsPage?.map(
                        ({ id, poolLiquidity, apr, assets }) => ({
                          id,
                          assets: assets ?? [],
                          metrics: [
                            ...[
                              sortKeyPath === "poolLiquidity"
                                ? {
                                    label: "",
                                    value: poolLiquidity.toString(),
                                  }
                                : sortKeyPath === "apr"
                                ? {
                                    label: "",
                                    value: apr
                                      .maxDecimals(2)
                                      .trim(true)
                                      .toString(),
                                  }
                                : {
                                    label: "APR",
                                    value: apr
                                      .maxDecimals(2)
                                      .trim(true)
                                      .toString(),
                                  },
                            ],
                            ...[
                              sortKeyPath === "poolLiquidity"
                                ? {
                                    label: "APR",
                                    value: apr
                                      .maxDecimals(2)
                                      .trim(true)
                                      .toString(),
                                  }
                                : {
                                    label: "TVL",
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
                        { id: "id", display: "Pool ID" },
                        { id: "apr", display: "APR" },
                        { id: "poolLiquidity", display: "Liquidity" },
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
                      label: `Show pools less than ${new PricePretty(
                        priceStore.getFiatCurrency(
                          priceStore.defaultVsCurrency
                        )!,
                        TVL_FILTER_THRESHOLD
                      ).toString()}`,
                    }}
                  />
                ),
                className: "!border-superfluid",
              },
            ]}
          />
        </section>
      ) : (
        <>
          <section>
            <div className="mx-auto">
              <h5>{t("pools.superfluid.title")}</h5>
              <div className="my-5 grid grid-cards">
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
                                {apr.maxDecimals(2).toString()}
                              </MetricLoader>
                            ),
                          },
                          {
                            label: t("pools.superfluid.liquidity"),
                            value: (
                              <MetricLoader
                                isLoading={poolLiquidity.toDec().isZero()}
                              >
                                {priceFormatter(poolLiquidity)}
                              </MetricLoader>
                            ),
                          },
                          {
                            label: t("pools.superfluid.fees7D"),
                            value: (
                              <MetricLoader
                                isLoading={!poolFeesMetrics.feesSpent7d.isReady}
                              >
                                {poolFeesMetrics.feesSpent7d.toString()}
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
                                .map((asset) => asset.weightFraction.toString())
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
    </main>
  );
});

export default Pools;
