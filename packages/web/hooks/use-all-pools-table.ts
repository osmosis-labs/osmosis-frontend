import { useEffect } from "react";
import { RowDef } from "../components/table";
import {
  MetricLoaderCell,
  PoolCompositionCell,
} from "../components/table/cells";
import { useStore } from "../stores";
import { ObservablePoolWithFeeMetrics } from "../stores/imperator-queries";
import { useFilteredData, usePaginatedData, useSortedData } from "./data";

export const useAllPoolsTable = (
  pools: ObservablePoolWithFeeMetrics[],
  isIncentivizedPools: boolean
) => {
  const { queriesOsmosisStore } = useStore();
  const queryOsmosis = queriesOsmosisStore.get("osmosis");
  const [query, setQuery, filteredPools] = useFilteredData(pools, [
    "pool.id",
    "pool.poolAssets.amount.currency.coinDenom",
  ]);

  const [
    sortKeyPath,
    setSortKeyPath,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    sortedAllPoolsWithMetrics,
  ] = useSortedData(filteredPools);
  const [page, setPage, minPage, numPages, allPoolsPages] = usePaginatedData(
    sortedAllPoolsWithMetrics,
    10
  );
  const tableCols = [
    {
      id: "pool.id",
      display: "Pool ID/Tokens",
      displayClassName: "!pl-[5.25rem]",
      sort:
        sortKeyPath === "pool.id"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("pool.id");
                setSortDirection("ascending");
              },
            },
      displayCell: PoolCompositionCell,
    },
    {
      id: "liquidity",
      display: "Liquidity",
      infoTooltip: "This is liquidity",
      sort:
        sortKeyPath === "liquidity"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("liquidity");
                setSortDirection("ascending");
              },
            },
    },
    {
      id: "volume24h",
      display: "Volume (24H)",
      sort:
        sortKeyPath === "volume24h"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("volume24h");
                setSortDirection("ascending");
              },
            },
    },
    {
      id: "fees7d",
      display: "Fees (7D)",
      sort:
        sortKeyPath === "fees7d"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("fees7d");
                setSortDirection("ascending");
              },
            },
    },
    {
      id: isIncentivizedPools ? "apr" : "myLiquidity",
      display: isIncentivizedPools ? "APR" : "My Liquidity",
      sort:
        sortKeyPath === (isIncentivizedPools ? "apr" : "myLiquidity")
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath(isIncentivizedPools ? "apr" : "myLiquidity");
                setSortDirection("ascending");
              },
            },
      displayCell: isIncentivizedPools ? MetricLoaderCell : undefined,
    },
  ];
  useEffect(() => {
    setSortKeyPath("liquidity");
    setSortDirection("descending");
  }, []);
  const baseRow: RowDef = {
    makeHoverClass: () => "text-secondary-200",
  };

  const tableRows: RowDef[] = pools.map(() => ({
    ...baseRow,
    onClick: (i) => console.log(i),
  }));

  const tableData = allPoolsPages.map((poolWithMetricss) => {
    return [
      { poolId: poolWithMetricss.pool.id },
      { value: poolWithMetricss.liquidity },
      { value: poolWithMetricss.volume24h },
      { value: poolWithMetricss.fees7d },
      {
        value: isIncentivizedPools
          ? `${poolWithMetricss.apr}%`
          : poolWithMetricss.myLiquidity,
        isLoading: isIncentivizedPools
          ? queryOsmosis.queryIncentivizedPools.isAprFetching
          : false,
      },
    ];
  });

  return {
    query,
    setQuery,
    sortKeyPath,
    setSortKeyPath,
    toggleSortDirection,
    page,
    setPage,
    minPage,
    numPages,
    tableCols,
    tableRows,
    tableData,
  };
};
