import { useEffect } from "react";
import { MenuOption } from "../components/control";
import { BaseCell, ColumnDef, RowDef } from "../components/table";
import { PoolCompositionCell } from "../components/table/cells";
import { ObservablePoolWithMetric } from "../stores/imperator-queries";
import { useFilteredData, usePaginatedData, useSortedData } from "./data";

export const useExternalIncentivizedPoolsTable = (
  pools: ObservablePoolWithMetric[]
) => {
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
    sortedAllPoolsWithMetric,
  ] = useSortedData(filteredPools);
  const [page, setPage, minPage, numPages, allPoolsPages] = usePaginatedData(
    sortedAllPoolsWithMetric,
    10
  );
  const tableCols: (ColumnDef<PoolCompositionCell> & MenuOption)[] = [
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
      display: "APR",
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
      id: "epochsRemaining",
      display: "Epochs Remaining",
      sort:
        sortKeyPath === "epochsRemaining"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("epochsRemaining");
                setSortDirection("ascending");
              },
            },
    },
    {
      id: "myLiquidity",
      display: "My Liquidity",
      sort:
        sortKeyPath === "myLiquidity"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("myLiquidity");
                setSortDirection("ascending");
              },
            },
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

  const tableData: Partial<PoolCompositionCell>[][] = allPoolsPages.map(
    (poolWithMetric) => {
      return [
        { poolId: poolWithMetric.pool.id },
        { value: poolWithMetric.liquidity },
        { value: poolWithMetric.volume24h },
        { value: poolWithMetric.epochsRemaining.toString() },
        { value: poolWithMetric.myLiquidity },
      ];
    }
  );

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
