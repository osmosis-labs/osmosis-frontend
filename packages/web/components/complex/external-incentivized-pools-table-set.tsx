import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useMemo, useCallback, useState } from "react";
import EventEmitter from "eventemitter3";
import { EventName } from "../../config";
import {
  useFilteredData,
  usePaginatedData,
  useSortedData,
  useWindowSize,
  useAmplitudeAnalytics,
} from "../../hooks";
import { useStore } from "../../stores";
import { PageList, SortMenu } from "../control";
import { SearchBox } from "../input";
import { RowDef, Table } from "../table";
import {
  MetricLoaderCell,
  PoolCompositionCell,
  PoolQuickActionCell,
} from "../table/cells";
import { Breakpoint } from "../types";
import { CompactPoolTableDisplay } from "./compact-pool-table-display";
import { POOLS_PER_PAGE } from ".";
import { useTranslation } from "react-multi-lang";

export const ExternalIncentivizedPoolsTableSet: FunctionComponent<{
  quickAddLiquidity: (poolId: string) => void;
  quickRemoveLiquidity: (poolId: string) => void;
  quickLockTokens: (poolId: string) => void;
}> = observer(
  ({ quickAddLiquidity, quickRemoveLiquidity, quickLockTokens }) => {
    const {
      chainStore,
      queriesExternalStore,
      priceStore,
      queriesStore,
      accountStore,
    } = useStore();
    const { isMobile } = useWindowSize();
    const { logEvent } = useAmplitudeAnalytics();
    const t = useTranslation();

    const { chainId } = chainStore.osmosis;
    const queryCosmos = queriesStore.get(chainId).cosmos;
    const queryOsmosis = queriesStore.get(chainId).osmosis!;
    const queryActiveGauges = queriesExternalStore.queryActiveGauges;
    const account = accountStore.getAccount(chainId);

    const pools = Object.keys(queryActiveGauges.poolIdsForActiveGauges).map(
      (poolId) => queryOsmosis.queryGammPools.getPool(poolId)
    );

    const externalIncentivizedPools = useMemo(
      () =>
        pools.filter(
          (
            pool: ObservableQueryPool | undefined
          ): pool is ObservableQueryPool => {
            if (!pool) {
              return false;
            }

            const gauges = queryActiveGauges.getExternalGaugesForPool(pool.id);

            if (!gauges || gauges.length === 0) {
              return false;
            }

            let maxRemainingEpoch = 0;
            for (const gauge of gauges) {
              if (maxRemainingEpoch < gauge.remainingEpoch) {
                maxRemainingEpoch = gauge.remainingEpoch;
              }
            }

            return maxRemainingEpoch > 0;
          }
        ),
      [pools, queryActiveGauges.response]
    );

    const externalIncentivizedPoolsWithMetrics = useMemo(
      () =>
        externalIncentivizedPools.map((pool) => {
          const gauges = queryActiveGauges.getExternalGaugesForPool(pool.id);

          let maxRemainingEpoch = 0;
          for (const gauge of gauges ?? []) {
            if (gauge.remainingEpoch > maxRemainingEpoch) {
              maxRemainingEpoch = gauge.remainingEpoch;
            }
          }

          const poolTvl = pool.computeTotalValueLocked(priceStore);
          const myLiquidity = poolTvl.mul(
            queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
              account.bech32Address,
              pool.id
            )
          );

          // sum aprs for highest duration
          const internalIncentiveApr =
            queryOsmosis.queryIncentivizedPools.computeMostApr(
              pool.id,
              priceStore
            );
          const swapFeeApr =
            queriesExternalStore.queryGammPoolFeeMetrics.get7dPoolFeeApr(
              pool,
              priceStore
            );
          const highestDuration =
            queryOsmosis.queryLockableDurations.highestDuration;

          const externalApr = (gauges ?? []).reduce((sum, gauge) => {
            if (
              !gauge ||
              !highestDuration ||
              gauge.lockupDuration.asMilliseconds() !==
                highestDuration.asMilliseconds()
            ) {
              return sum;
            }

            const gaugeData = gauge.gauge;
            if (gaugeData) {
              gaugeData.coins.forEach((coin) => {
                return sum.add(
                  queryOsmosis.queryIncentivizedPools.computeExternalIncentiveGaugeAPR(
                    pool.id,
                    gaugeData.id,
                    coin.denom,
                    priceStore
                  )
                );
              });
            }
            return sum;
          }, new RatePretty(0));
          const superfluidApr =
            queryOsmosis.querySuperfluidPools.isSuperfluidPool(pool.id)
              ? new RatePretty(
                  queryCosmos.queryInflation.inflation
                    .mul(
                      queryOsmosis.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                        pool.id
                      )
                    )
                    .moveDecimalPointLeft(2)
                )
              : new RatePretty(0);

          return {
            pool,
            ...queriesExternalStore.queryGammPoolFeeMetrics.getPoolFeesMetrics(
              pool.id,
              priceStore
            ),
            liquidity: pool.computeTotalValueLocked(priceStore),
            epochsRemaining: maxRemainingEpoch,
            myLiquidity,
            myAvailableLiquidity: myLiquidity.toDec().isZero()
              ? new PricePretty(
                  priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!,
                  0
                )
              : poolTvl.mul(
                  queryOsmosis.queryGammPoolShare
                    .getAvailableGammShare(account.bech32Address, pool.id)
                    .quo(pool.totalShare)
                ),
            apr: internalIncentiveApr
              .add(swapFeeApr)
              .add(externalApr)
              .add(superfluidApr)
              .maxDecimals(0),
            poolName: pool.poolAssets
              .map((asset) => asset.amount.currency.coinDenom)
              .join("/"),
            networkNames: pool.poolAssets
              .map(
                (asset) =>
                  chainStore.getChainFromCurrency(asset.amount.denom)
                    ?.chainName ?? ""
              )
              .join(" "),
          };
        }),
      [
        chainId,
        externalIncentivizedPools,
        queryOsmosis.queryIncentivizedPools.response,
        queryOsmosis.querySuperfluidPools.response,
        queryCosmos.queryInflation.isFetching,
        queriesExternalStore.queryGammPoolFeeMetrics.response,
        queryOsmosis.queryGammPools.response,
        queryActiveGauges.response,
        priceStore,
        account,
        chainStore,
      ]
    );

    const initialKeyPath = "liquidity";
    const initialSortDirection = "descending";
    const [
      sortKeyPath,
      setSortKeyPath,
      sortDirection,
      setSortDirection,
      toggleSortDirection,
      sortedAllPoolsWithMetrics,
    ] = useSortedData(
      externalIncentivizedPoolsWithMetrics,
      initialKeyPath,
      initialSortDirection
    );

    const [query, setQuery, filteredPools] = useFilteredData(
      sortedAllPoolsWithMetrics,
      [
        "pool.id",
        "poolName",
        "networkNames",
        "pool.poolAssets.amount.currency.originCurrency.pegMechanism",
      ]
    );

    const [page, setPage, minPage, numPages, allData] = usePaginatedData(
      filteredPools,
      POOLS_PER_PAGE
    );
    const makeSortMechanism = useCallback(
      (keyPath: string) =>
        sortKeyPath === keyPath
          ? {
              currentDirection: sortDirection,
              onClickHeader: () => {
                switch (sortDirection) {
                  case "ascending":
                    const newSortDirection = "descending";
                    logEvent([
                      EventName.Pools.externalIncentivePoolsListSorted,
                      {
                        sortedBy: keyPath,
                        sortDirection: newSortDirection,
                        sortedOn: "table-head",
                      },
                    ]);
                    setSortDirection(newSortDirection);
                    break;
                  case "descending":
                    // default sort key toggles forever

                    if (sortKeyPath === initialKeyPath) {
                      const newSortDirection = "ascending";
                      logEvent([
                        EventName.Pools.externalIncentivePoolsListSorted,
                        {
                          sortedBy: keyPath,
                          sortDirection: newSortDirection,
                          sortedOn: "table-head",
                        },
                      ]);
                      setSortDirection(newSortDirection);
                      setSortDirection(newSortDirection);
                    } else {
                      // other keys toggle then go back to default
                      setSortKeyPath(initialKeyPath);
                      setSortDirection(initialSortDirection);
                    }
                }
              },
            }
          : {
              onClickHeader: () => {
                const newSortDirection = "ascending";
                logEvent([
                  EventName.Pools.externalIncentivePoolsListSorted,
                  {
                    sortedBy: keyPath,
                    sortDirection: newSortDirection,
                    sortedOn: "table-head",
                  },
                ]);
                setSortKeyPath(keyPath);
                setSortDirection(newSortDirection);
              },
            },
      [sortKeyPath, sortDirection]
    );
    const tableCols = useMemo(
      () => [
        {
          id: "pool.id",
          display: t("pools.externalIncentivized.sort.poolName"),
          sort: makeSortMechanism("pool.id"),
          displayCell: PoolCompositionCell,
        },
        {
          id: "liquidity",
          display: t("pools.externalIncentivized.sort.liquidity"),
          sort: makeSortMechanism("liquidity"),
        },
        {
          id: "apr",
          display: t("pools.externalIncentivized.sort.APR"),
          sort: makeSortMechanism("apr"),
          displayCell: MetricLoaderCell,
        },
        {
          id: "epochsRemaining",
          display: t("pools.externalIncentivized.sort.epochs"),
          sort: makeSortMechanism("epochsRemaining"),
          collapseAt: Breakpoint.XL,
        },
        {
          id: "myLiquidity",
          display: t("pools.externalIncentivized.sort.myLiquidity"),
          sort: makeSortMechanism("myLiquidity"),
          collapseAt: Breakpoint.LG,
        },
        { id: "quickActions", display: "", displayCell: PoolQuickActionCell },
      ],
      [makeSortMechanism, t]
    );

    const tableRows: RowDef[] = useMemo(
      () =>
        allData.map((poolWithFeeMetrics) => ({
          link: `/pool/${poolWithFeeMetrics.pool.id}`,
          onClick: () => {
            logEvent([
              EventName.Pools.externalIncentivePoolsItemClicked,
              {
                poolId: poolWithFeeMetrics.pool.id,
                poolName: poolWithFeeMetrics.pool.poolAssets
                  .map((poolAsset) => poolAsset.amount.denom)
                  .join(" / "),
                poolWeight: poolWithFeeMetrics.pool.weightedPoolInfo?.assets
                  .map((poolAsset) => poolAsset.weightFraction?.toString())
                  .join(" / "),
                isSuperfluidPool:
                  queryOsmosis.querySuperfluidPools.isSuperfluidPool(
                    poolWithFeeMetrics.pool.id
                  ),
              },
            ]);
          },
        })),
      [allData]
    );

    const [cellGroupEventEmitter] = useState(() => new EventEmitter());
    const tableData = useMemo(
      () =>
        allData.map((poolWithMetrics) => {
          const poolId = poolWithMetrics.pool.id;
          const poolAssets = poolWithMetrics.pool.poolAssets.map(
            (poolAsset) => ({
              coinImageUrl: poolAsset.amount.currency.coinImageUrl,
              coinDenom: poolAsset.amount.currency.coinDenom,
            })
          );

          return [
            { poolId, poolAssets },
            { value: poolWithMetrics.liquidity.toString() },
            {
              value: poolWithMetrics.apr?.toString(),
              isLoading: queryOsmosis.queryIncentivizedPools.isAprFetching,
            },
            { value: poolWithMetrics.epochsRemaining?.toString() },
            { value: poolWithMetrics.myLiquidity?.toString() },
            {
              poolId,
              cellGroupEventEmitter,
              onAddLiquidity: () => quickAddLiquidity(poolId),
              onRemoveLiquidity: !poolWithMetrics.myAvailableLiquidity
                .toDec()
                .isZero()
                ? () => quickRemoveLiquidity(poolId)
                : undefined,
              onLockTokens: !poolWithMetrics.myAvailableLiquidity
                .toDec()
                .isZero()
                ? () => quickLockTokens(poolId)
                : undefined,
            },
          ];
        }),
      [allData, queryOsmosis.queryIncentivizedPools.isAprFetching]
    );

    if (isMobile) {
      return (
        <CompactPoolTableDisplay
          pools={allData.map((poolData) => ({
            id: poolData.pool.id,
            assets: poolData.pool.poolAssets.map(
              (asset) => asset.amount.currency
            ),
            metrics: [
              ...[
                sortKeyPath === "epochsRemaining"
                  ? {
                      label: "",
                      value: poolData.epochsRemaining.toString(),
                    }
                  : sortKeyPath === "myLiquidity"
                  ? {
                      label: "",
                      value: poolData.myLiquidity.toString(),
                    }
                  : sortKeyPath === "apr"
                  ? {
                      label: "",
                      value: poolData.apr?.toString() ?? "0%",
                    }
                  : { label: "TVL", value: poolData.liquidity.toString() },
              ],
              ...[
                sortKeyPath === "apr"
                  ? {
                      label: t("pools.externalIncentivized.TVL"),
                      value: poolData.liquidity.toString(),
                    }
                  : {
                      label: t("pools.externalIncentivized.APR"),
                      value: poolData.apr?.toString() ?? "0%",
                    },
              ],
            ],
            isSuperfluid: queryOsmosis.querySuperfluidPools.isSuperfluidPool(
              poolData.pool.id
            ),
          }))}
          searchBoxProps={{
            currentValue: query,
            onInput: setQuery,
            placeholder: t("pools.externalIncentivized.search"),
          }}
          sortMenuProps={{
            options: tableCols,
            selectedOptionId: sortKeyPath,
            onSelect: (id) =>
              id === sortKeyPath ? setSortKeyPath("") : setSortKeyPath(id),
            onToggleSortDirection: toggleSortDirection,
          }}
          pageListProps={{
            currentValue: page,
            max: numPages,
            min: minPage,
            onInput: setPage,
          }}
        />
      );
    }

    return (
      <>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h5>{t("pools.externalIncentivized.title")}</h5>
          <div className="flex items-center gap-3 lg:w-full lg:place-content-between">
            <SearchBox
              currentValue={query}
              onInput={setQuery}
              placeholder={t("pools.externalIncentivized.search")}
              className="!w-64"
            />
            <SortMenu
              options={tableCols}
              selectedOptionId={sortKeyPath}
              onSelect={(id) => {
                if (id === sortKeyPath) {
                  setSortKeyPath("");
                } else {
                  logEvent([
                    EventName.Pools.externalIncentivePoolsListSorted,
                    {
                      sortedBy: id,
                      sortDirection: sortDirection,
                      sortedOn: "dropdown",
                    },
                  ]);
                  setSortKeyPath(id);
                }
              }}
            />
          </div>
        </div>
        <Table<PoolCompositionCell & MetricLoaderCell>
          className="mt-5 w-full lg:text-sm"
          columnDefs={tableCols}
          rowDefs={tableRows}
          data={tableData}
        />
        <div className="flex place-content-around">
          <PageList
            currentValue={page}
            max={numPages}
            min={minPage}
            onInput={setPage}
            editField
          />
        </div>
      </>
    );
  }
);
