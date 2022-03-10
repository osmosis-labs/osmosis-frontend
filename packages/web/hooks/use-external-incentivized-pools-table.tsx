import { useEffect } from "react";
import { RowDef } from "../components/table";
import {
  MetricLoaderCell,
  PoolCompositionCell,
} from "../components/table/cells";
import { useStore } from "../stores";
import { ObservablePoolWithFeeMetrics } from "@osmosis-labs/stores";
import { useFilteredData, usePaginatedData, useSortedData } from "./data";
import { useRouter } from "next/router";

export const useExternalIncentivizedPoolsTable = (
  poolsWithFeeMetrics: ObservablePoolWithFeeMetrics[]
) => {
  const router = useRouter();
  const { queriesOsmosisStore } = useStore();
  const queryOsmosis = queriesOsmosisStore.get("osmosis");

  const [query, setQuery, filteredPools] = useFilteredData(
    poolsWithFeeMetrics,
    ["pool.id", "pool.poolAssets.amount.currency.coinDenom"]
  );

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
      id: "apr",
      display: "APR",
      sort:
        sortKeyPath === "apr"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("apr");
                setSortDirection("ascending");
              },
            },
      displayCell: MetricLoaderCell,
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
  // TODO: Remove when pull request for asset page get merged.
  useEffect(() => {
    setSortKeyPath("liquidity");
    setSortDirection("descending");
  }, []);

  const baseRow: RowDef = {
    makeHoverClass: () => "text-secondary-200",
  };

  const tableRows: RowDef[] = poolsWithFeeMetrics.map((poolWithFeeMetrics) => ({
    ...baseRow,
    onClick: () => router.push(`/pool/${poolWithFeeMetrics.pool.id}`),
  }));

  const tableData = allPoolsPages.map((poolWithMetrics) => {
    return [
      { poolId: poolWithMetrics.pool.id },
      { value: poolWithMetrics.liquidity },
      {
        value: `${poolWithMetrics.apr}%`,
        isLoading: queryOsmosis.queryIncentivizedPools.isAprFetching,
      },
      { value: poolWithMetrics.epochsRemaining?.toString() },
      { value: poolWithMetrics.myLiquidity },
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
