import type { NextPage } from "next";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { PoolCard } from "../../components/cards";
import { AllPoolsTableSet } from "../../components/complex/all-pools-table-set";
import { ExternalIncentivizedPoolsTableSet } from "../../components/complex/external-incentivized-pools-table-set";
import { CreatePoolModal } from "../../modals/create-pool";
import { LeftTime } from "../../components/left-time";
import { MetricLoader } from "../../components/loaders";
import { Overview } from "../../components/overview";
import { TabBox } from "../../components/control";
import { useStore } from "../../stores";
import { DataSorter } from "../../hooks/data/data-sorter";
import {
  useWindowSize,
  useFilteredData,
  usePaginatedData,
  useSortedData,
  useCreatePoolConfig,
} from "../../hooks";
import { CompactPoolTableDisplay } from "../../components/complex/compact-pool-table-display";
import { ShowMoreButton } from "../../components/buttons/show-more";
import { UserAction } from "../../config";
import { POOLS_PER_PAGE } from "../../components/complex";

const REWARD_EPOCH_IDENTIFIER = "day";
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
  const { isMobile } = useWindowSize();

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const queriesExternal = queriesExternalStore.get();

  const account = accountStore.getAccount(chainId);

  const queryEpoch = queryOsmosis.queryEpochs.getEpoch(REWARD_EPOCH_IDENTIFIER);
  const now = new Date();
  const epochRemainingTime = dayjs.duration(
    dayjs(queryEpoch.endTime).diff(dayjs(now), "second"),
    "second"
  );
  const epochRemainingTimeString =
    epochRemainingTime.asSeconds() <= 0
      ? dayjs.duration(0, "seconds").format("HH-mm")
      : epochRemainingTime.format("HH-mm");
  const [epochRemainingHour, epochRemainingMinute] =
    epochRemainingTimeString.split("-");

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
        })),
      })) ?? []
  )
    .process("poolLiquidity")
    .reverse();
  const [showMoreSfsPools, setShowMoreSfsPools] = useState(false);

  const osmoPrice = priceStore.calculatePrice(
    new CoinPretty(
      chainStore.osmosis.stakeCurrency,
      DecUtils.getTenExponentNInPrecisionRange(
        chainStore.osmosis.stakeCurrency.coinDecimals
      )
    )
  );

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

  return (
    <main>
      {isCreatingPool && (
        <CreatePoolModal
          isOpen={isCreatingPool}
          onRequestClose={() => setIsCreatingPool(false)}
          title="Create New Pool"
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
                () => setIsCreatingPool(false)
              );
            } catch (e) {
              setIsCreatingPool(false);
              console.log(e);
            }
          }}
        />
      )}
      <Overview
        title="Active Pools"
        titleButtons={
          UserAction.CreateNewPool
            ? [
                {
                  label: "Create New Pool",
                  onClick: () => setIsCreatingPool(true),
                },
              ]
            : []
        }
        primaryOverviewLabels={[
          {
            label: "OSMO Price",
            value: (
              <MetricLoader
                className="h-[2.5rem] !mt-0"
                isLoading={!osmoPrice || osmoPrice.toDec().isZero()}
              >
                <div className="h-[2.5rem]">{osmoPrice?.toString()}</div>
              </MetricLoader>
            ),
          },
          {
            label: "Reward distribution in",
            value: (
              <LeftTime
                className="-mt-1 md:mt-0"
                hour={epochRemainingHour}
                minute={epochRemainingMinute}
                isMobile={isMobile}
              />
            ),
          },
        ]}
      />
      <section className="bg-background">
        <div className="max-w-container mx-auto md:p-4 p-10 pb-[3.75rem]">
          {isMobile ? (
            <span className="subtitle2">My Pools</span>
          ) : (
            <h5>My Pools</h5>
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
                      label: "APR",
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
                      label: isMobile ? "Available" : "Pool Liquidity",
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
                          {poolLiquidity.toString()}
                        </MetricLoader>
                      ),
                    },
                    {
                      label: "Bonded",
                      value: isMobile ? (
                        myBonded.toString()
                      ) : (
                        <MetricLoader
                          isLoading={poolLiquidity.toDec().isZero()}
                        >
                          {myBonded.toString()}
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
        <section className="bg-background">
          <TabBox
            tabs={[
              {
                title: "Incentivized Pools",
                content: <AllPoolsTableSet tableSet="incentivized-pools" />,
              },
              {
                title: "All Pools",
                content: <AllPoolsTableSet tableSet="all-pools" />,
              },
              {
                title: "External Incentive Pools",
                content: <ExternalIncentivizedPoolsTableSet />,
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
          <section className="bg-surface">
            <div className="max-w-container mx-auto p-10">
              <h5>Superfluid Pools</h5>
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
                            label: "APR",
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
                            label: "Pool Liquidity",
                            value: (
                              <MetricLoader
                                isLoading={poolLiquidity.toDec().isZero()}
                              >
                                {poolLiquidity.toString()}
                              </MetricLoader>
                            ),
                          },
                          {
                            label: "Fees (7D)",
                            value: (
                              <MetricLoader
                                isLoading={poolFeesMetrics.feesSpent7d
                                  .toDec()
                                  .isZero()}
                              >
                                {poolFeesMetrics.feesSpent7d.toString()}
                              </MetricLoader>
                            ),
                          },
                        ]}
                        isSuperfluid
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
          <section className="bg-surface shadow-separator">
            <div className="max-w-container mx-auto md:p-4 p-10 py-[3.75rem]">
              <AllPoolsTableSet />
            </div>
          </section>
          <section className="bg-surface shadow-separator min-h-screen">
            <div className="max-w-container mx-auto md:p-4 p-10 py-[3.75rem]">
              <ExternalIncentivizedPoolsTableSet />
            </div>
          </section>
        </>
      )}
    </main>
  );
});

export default Pools;
