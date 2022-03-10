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

export const useAllPoolsTable = (
  poolsWithFeeMetrics: ObservablePoolWithFeeMetrics[],
  isIncentivizedPools: boolean
) => {
  const router = useRouter();
  const { queriesOsmosisStore, queriesExternalStore } = useStore();
  const queriesOsmosis = queriesOsmosisStore.get("osmosis");
  const queriesExternal = queriesExternalStore.get();

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

      displayCell: MetricLoaderCell,
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
      displayCell: MetricLoaderCell,
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
      { poolId: poolWithMetrics.pool.id, value: poolWithMetrics.pool.id },
      { value: poolWithMetrics.liquidity.toString() },
      {
        value: poolWithMetrics.volume24h.toString(),
        isLoading: !queriesExternal.queryGammPoolMetrics.response,
      },
      {
        value: poolWithMetrics.fees7d.toString(),
        isLoading: !queriesExternal.queryGammPoolMetrics.response,
      },
      {
        value: isIncentivizedPools
          ? poolWithMetrics.apr?.toString()
          : poolWithMetrics.myLiquidity?.toString(),
        isLoading: isIncentivizedPools
          ? queriesOsmosis.queryIncentivizedPools.isAprFetching
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
