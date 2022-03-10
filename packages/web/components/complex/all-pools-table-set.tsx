import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservablePoolWithFeeMetrics } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { useAllPoolsTable } from "../../hooks/use-all-pools-table";
import { useStore } from "../../stores";
import { CheckBox, MenuToggle, PageList, SortMenu } from "../control";
import { SearchBox } from "../input";
import { Table } from "../table";
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

  const chainInfo = chainStore.getChain("osmosis");
  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
  const queryExternal = queriesExternalStore.get();
  const account = accountStore.getAccount(chainInfo.chainId);

  const allPools = queryOsmosis.queryGammPools.getAllPools();
  const incentivizedPoolIds =
    queryOsmosis.queryIncentivizedPools.incentivizedPools;

  const allPoolsWithMetrics = allPools.map((pool) => ({
    ...queryExternal.queryGammPoolMetrics.makePoolWithFeeMetrics(
      pool,
      priceStore
    ),
    myLiquidity: pool
      .computeTotalValueLocked(priceStore)
      .mul(
        queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
          account.bech32Address,
          pool.id
        )
      ),
    apr: queryOsmosis.queryIncentivizedPools.computeMostAPY(
      pool.id,
      priceStore
    ),
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

  const {
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
  } = useAllPoolsTable(tvlFilteredPools, isIncentivizedPools);

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
        <div className="absolute right-2 bottom-1 text-sm flex items-center">
          <CheckBox
            isOn={isPoolTvlFiltered}
            onToggle={setIsPoolTvlFiltered}
            className="mr-2 after:!bg-transparent after:!border-2 after:!border-white-full"
            label={`Show pools less than ${new PricePretty(
              priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!,
              TVL_FILTER_THRESHOLD
            ).toString()} TVL`}
          />
        </div>
      </div>
    </>
  );
});
