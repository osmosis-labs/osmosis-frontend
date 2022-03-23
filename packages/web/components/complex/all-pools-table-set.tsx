import { Dec, PricePretty } from "@keplr-wallet/unit";
import { ObservablePoolWithFeeMetrics } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect, useState } from "react";
import {
  useFilteredData,
  usePaginatedData,
  useSortedData,
} from "../../hooks/data";
import { useStore } from "../../stores";
import { CheckBox, MenuToggle, PageList, SortMenu } from "../control";
import { SearchBox } from "../input";
import { RowDef, Table } from "../table";
import { MetricLoaderCell, PoolCompositionCell } from "../table/cells";

const poolsMenuOptions = [
  { id: "incentivized-pools", display: "Incentivized Pools" },
  { id: "all-pools", display: "All Pools" },
];

const TVL_FILTER_THRESHOLD = 1000;

export const AllPoolsTableSet: FunctionComponent = observer(() => {
  const {
    chainStore,
    queriesExternalStore,
    priceStore,
    queriesOsmosisStore,
    accountStore,
  } = useStore();
  const [activeOptionId, setActiveOptionId] = useState(poolsMenuOptions[0].id);
  const [isPoolTvlFiltered, setIsPoolTvlFiltered] = useState(false);

  const chainInfo = chainStore.osmosis;
  const queriesOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
  const queriesExternal = queriesExternalStore.get();
  const account = accountStore.getAccount(chainInfo.chainId);

  const allPools = queriesOsmosis.queryGammPools.getAllPools();
  const incentivizedPoolIds =
    queriesOsmosis.queryIncentivizedPools.incentivizedPools;

  const allPoolsWithMetrics = allPools.map((pool) => ({
    ...queriesExternal.queryGammPoolFeeMetrics.makePoolWithFeeMetrics(
      pool,
      priceStore
    ),
    myLiquidity: pool
      .computeTotalValueLocked(priceStore)
      .mul(
        queriesOsmosis.queryGammPoolShare.getAllGammShareRatio(
          account.bech32Address,
          pool.id
        )
      ),
    apr: queriesOsmosis.queryIncentivizedPools
      .computeMostAPY(pool.id, priceStore)
      .maxDecimals(2),
  }));
  const incentivizedPoolsWithMetrics = allPoolsWithMetrics.reduce(
    (
      incentivizedPools: ObservablePoolWithFeeMetrics[],
      poolWithMetrics: ObservablePoolWithFeeMetrics
    ) => {
      if (
        incentivizedPoolIds.some(
          (incentivizedPoolId) => poolWithMetrics.pool.id === incentivizedPoolId
        )
      ) {
        incentivizedPools.push(poolWithMetrics);
      }
      return incentivizedPools;
    },
    []
  );

  const isIncentivizedPools = activeOptionId === poolsMenuOptions[0].id;
  const activeOptionPools = isIncentivizedPools
    ? incentivizedPoolsWithMetrics
    : allPoolsWithMetrics;
  const tvlFilteredPools = isPoolTvlFiltered
    ? activeOptionPools
    : activeOptionPools.filter((poolWithMetrics) =>
        poolWithMetrics.liquidity.toDec().gte(new Dec(TVL_FILTER_THRESHOLD))
      );

  const [query, setQuery, filteredPools] = useFilteredData(tvlFilteredPools, [
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
  const [page, setPage, minPage, numPages, allData] = usePaginatedData(
    sortedAllPoolsWithMetrics,
    10
  );
  const tableCols = [
    {
      id: "pool.id",
      display: "Pool ID/Tokens",
      className: "!pl-[5.25rem]",
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

  const tableRows: RowDef[] = allData.map((poolWithFeeMetrics) => ({
    ...baseRow,
    link: `/pool/${poolWithFeeMetrics.pool.id}`,
  }));

  const tableData = allData.map((poolWithMetrics) => {
    const poolId = poolWithMetrics.pool.id;
    const poolAssets = poolWithMetrics.pool.poolAssets.map((poolAsset) => ({
      coinImageUrl: poolAsset.amount.currency.coinImageUrl,
      coinDenom: poolAsset.amount.currency.coinDenom,
    }));

    return [
      { poolId, poolAssets },
      { value: poolWithMetrics.liquidity.toString() },
      {
        value: poolWithMetrics.volume24h.toString(),
        isLoading: !queriesExternal.queryGammPoolFeeMetrics.response,
      },
      {
        value: poolWithMetrics.feesSpent7d.toString(),
        isLoading: !queriesExternal.queryGammPoolFeeMetrics.response,
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

  return (
    <>
      <h5>All Pools</h5>
      <div className="mt-5 flex items-center justify-between">
        <MenuToggle
          options={poolsMenuOptions}
          selectedOptionId={activeOptionId}
          onSelect={setActiveOptionId}
        />
        <div className="flex gap-8">
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
        className="mt-5 w-full"
        columnDefs={tableCols}
        rowDefs={tableRows}
        data={tableData}
      />
      <div className="relative flex place-content-around">
        <PageList
          currentValue={page}
          max={numPages}
          min={minPage}
          onInput={setPage}
          editField
        />
        <div className="absolute right-2 bottom-1 text-body2 flex items-center">
          <CheckBox
            isOn={isPoolTvlFiltered}
            onToggle={setIsPoolTvlFiltered}
            className="mr-2 after:!bg-transparent after:!border-2 after:!border-white-full"
          >
            {`Show pools less than ${new PricePretty(
              priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!,
              TVL_FILTER_THRESHOLD
            ).toString()}`}
          </CheckBox>
        </div>
      </div>
    </>
  );
});
