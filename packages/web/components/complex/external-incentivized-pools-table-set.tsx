import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useMemo, useCallback } from "react";
import { ExternalIncentiveGaugeAllowList } from "../../config";
import {
  useFilteredData,
  usePaginatedData,
  useSortedData,
  useWindowSize,
} from "../../hooks";
import { useStore } from "../../stores";
import { PageList, SortMenu } from "../control";
import { SearchBox } from "../input";
import { RowDef, Table } from "../table";
import { MetricLoaderCell, PoolCompositionCell } from "../table/cells";
import { Breakpoint } from "../types";
import { CompactPoolTableDisplay } from "./compact-pool-table-display";
import { POOLS_PER_PAGE } from ".";

export const ExternalIncentivizedPoolsTableSet: FunctionComponent = observer(
  () => {
    const {
      chainStore,
      queriesExternalStore,
      priceStore,
      queriesStore,
      accountStore,
    } = useStore();
    const { isMobile } = useWindowSize();

    const { chainId } = chainStore.osmosis;
    const queryExternal = queriesExternalStore.get();
    const queryOsmosis = queriesStore.get(chainId).osmosis!;
    const account = accountStore.getAccount(chainId);

    const pools = Object.keys(ExternalIncentiveGaugeAllowList).map(
      (poolId: string) => {
        const pool = queryOsmosis.queryGammPools.getPool(poolId);
        if (pool) {
          return pool;
        }
      }
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

            const inner = ExternalIncentiveGaugeAllowList[pool.id];
            const data = Array.isArray(inner) ? inner : [inner];

            if (data.length === 0) {
              return false;
            }
            const gaugeIds = data.map((d) => d.gaugeId);
            const gauges = gaugeIds.map((gaugeId) =>
              queryOsmosis.queryGauge.get(gaugeId)
            );

            let maxRemainingEpoch = 0;
            for (const gauge of gauges) {
              if (maxRemainingEpoch < gauge.remainingEpoch) {
                maxRemainingEpoch = gauge.remainingEpoch;
              }
            }

            return maxRemainingEpoch > 0;
          }
        ),
      [pools, queryOsmosis]
    );

    const externalIncentivizedPoolsWithMetrics = useMemo(
      () =>
        externalIncentivizedPools.map((pool) => {
          const inner = ExternalIncentiveGaugeAllowList[pool.id];
          const data = Array.isArray(inner) ? inner : [inner];
          const gaugeIds = data.map((d) => d.gaugeId);
          const gauges = gaugeIds.map((gaugeId) => {
            return queryOsmosis.queryGauge.get(gaugeId);
          });
          const incentiveDenom = data[0].denom;
          const currency = chainStore
            .getChain(chainId)
            .forceFindCurrency(incentiveDenom);
          let sumRemainingBonus: CoinPretty = new CoinPretty(
            currency,
            new Dec(0)
          );
          let maxRemainingEpoch = 0;
          for (const gauge of gauges) {
            sumRemainingBonus = sumRemainingBonus.add(
              gauge.getRemainingCoin(currency)
            );

            if (gauge.remainingEpoch > maxRemainingEpoch) {
              maxRemainingEpoch = gauge.remainingEpoch;
            }
          }

          return {
            ...queryExternal.queryGammPoolFeeMetrics.makePoolWithFeeMetrics(
              pool,
              priceStore
            ),
            epochsRemaining: maxRemainingEpoch,
            myLiquidity: pool
              .computeTotalValueLocked(priceStore)
              .mul(
                queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
                  account.bech32Address,
                  pool.id
                )
              ),
            apr: queryOsmosis.queryIncentivizedPools
              .computeMostAPY(pool.id, priceStore)
              .maxDecimals(2),
            poolName: pool.poolAssets
              .map((asset) => asset.amount.currency.coinDenom)
              .join("/"),
          };
        }),
      [
        chainId,
        externalIncentivizedPools,
        queryOsmosis,
        queryExternal,
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
      ["pool.id", "poolName"]
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
                    setSortDirection("descending");
                    break;
                  case "descending":
                    if (sortKeyPath === initialKeyPath) {
                      // default sort key toggles forever
                      setSortDirection("ascending");
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
                setSortKeyPath(keyPath);
                setSortDirection("ascending");
              },
            },
      [sortKeyPath, sortDirection, setSortDirection, setSortKeyPath]
    );
    const tableCols = useMemo(
      () => [
        {
          id: "pool.id",
          display: "Pool Name",
          sort: makeSortMechanism("pool.id"),
          displayCell: PoolCompositionCell,
        },
        {
          id: "liquidity",
          display: "Liquidity",
          sort: makeSortMechanism("liquidity"),
        },
        {
          id: "apr",
          display: "APR",
          sort: makeSortMechanism("apr"),
          displayCell: MetricLoaderCell,
        },
        {
          id: "epochsRemaining",
          display: "Epochs Remaining",
          sort: makeSortMechanism("epochsRemaining"),
          collapseAt: Breakpoint.XL,
        },
        {
          id: "myLiquidity",
          display: "My Liquidity",
          sort: makeSortMechanism("myLiquidity"),
          collapseAt: Breakpoint.LG,
        },
      ],
      [makeSortMechanism]
    );

    const tableRows: RowDef[] = useMemo(
      () =>
        allData.map((poolWithFeeMetrics) => ({
          link: `/pool/${poolWithFeeMetrics.pool.id}`,
        })),
      [allData]
    );

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
          const isIncentivized =
            queryOsmosis.queryIncentivizedPools.isIncentivized(poolId);

          return [
            { poolId, poolAssets, isIncentivized },
            { value: poolWithMetrics.liquidity.toString() },
            {
              value: poolWithMetrics.apr?.toString(),
              isLoading: queryOsmosis.queryIncentivizedPools.isAprFetching,
            },
            { value: poolWithMetrics.epochsRemaining?.toString() },
            { value: poolWithMetrics.myLiquidity?.toString() },
          ];
        }),
      [allData, queryOsmosis]
    );

    if (isMobile) {
      return (
        <CompactPoolTableDisplay
          title="External Incentive Pool"
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
                  ? { label: "TVL", value: poolData.liquidity.toString() }
                  : {
                      label: "APR",
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
            placeholder: "Filtery by symbol",
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
        <div className="mt-5 flex flex-wrap gap-3 items-center justify-between">
          <h5>External Incentive Pools</h5>
          <div className="flex gap-8 lg:w-full lg:place-content-between">
            <SearchBox
              currentValue={query}
              onInput={setQuery}
              placeholder="Filter by name"
              className="!w-64"
            />
            <SortMenu
              options={tableCols}
              selectedOptionId={sortKeyPath}
              onSelect={(id) =>
                id === sortKeyPath ? setSortKeyPath("") : setSortKeyPath(id)
              }
              onToggleSortDirection={toggleSortDirection}
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
