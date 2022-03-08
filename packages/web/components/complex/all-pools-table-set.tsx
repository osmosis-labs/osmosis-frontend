import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { useAllPoolsTable } from "../../hooks/use-all-pools-table";
import { useStore } from "../../stores";
import { ObservablePoolWithFeeMetrics } from "../../stores/imperator-queries";
import { MenuToggle, PageList, SortMenu } from "../control";
import { SearchBox } from "../input";
import { PoolTable } from "../table";

const poolsMenuOptions = [
  { id: "incentivized-pools", display: "Incentivized Pools" },
  { id: "all-pools", display: "All Pools" },
];

const TVL_FILTER_THRESHOLD = 1000;

export const AllPoolsTableSet: FunctionComponent = observer(() => {
  const {
    chainStore,
    queriesImperatorStore,
    priceStore,
    queriesOsmosisStore,
    accountStore,
  } = useStore();
  const [activeOptionId, setActiveOptionId] = useState(poolsMenuOptions[0].id);
  const [isPoolTvlFiltered, setIsPoolTvlFiltered] = useState(false);

  const chainInfo = chainStore.getChain("osmosis");
  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
  const queryImperator = queriesImperatorStore.get();
  const account = accountStore.getAccount(chainInfo.chainId);

  const allPools = queryOsmosis.queryGammPools.getAllPools();
  const incentivizedPoolIds =
    queryOsmosis.queryIncentivizedPools.incentivizedPools;

  const allPoolsWithMetrics = allPools.map((pool) => ({
    ...queryImperator.queryGammPoolMetrics.makePoolWithFeeMetrics(
      pool,
      priceStore,
      priceStore.getFiatCurrency("usd")!
    ),
    myLiquidity: pool
      .computeTotalValueLocked(priceStore, priceStore.getFiatCurrency("usd")!)
      .mul(
        queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
          account.bech32Address,
          pool.id
        )
      ),
    apr: queryOsmosis.queryIncentivizedPools
      .computeMostAPY(pool.id, priceStore, priceStore.getFiatCurrency("usd")!)
      .toString(),
  }));
  const incentivizedPoolsWithMetrics = allPoolsWithMetrics.reduce(
    (
      incentivizedPools: ObservablePoolWithFeeMetrics[],
      poolWithMetricss: ObservablePoolWithFeeMetrics
    ) => {
      if (
        incentivizedPoolIds.some(
          (incentivizedPoolId) =>
            poolWithMetricss.pool.id === incentivizedPoolId
        )
      ) {
        incentivizedPools.push(poolWithMetricss);
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
    : activeOptionPools.filter((poolWithMetricss) =>
        poolWithMetricss.liquidity.toDec().gte(new Dec(TVL_FILTER_THRESHOLD))
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
          onSelect={(optionId) => setActiveOptionId(optionId)}
        />
        <div className="flex gap-8">
          <SearchBox
            currentValue={query}
            onInput={setQuery}
            placeholder="Search by pool id or tokens"
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
      <PoolTable
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
        <label
          htmlFor="show-all-pools"
          className="absolute right-2 bottom-1 text-base flex items-center"
          onClick={() => setIsPoolTvlFiltered(!isPoolTvlFiltered)}
        >
          <input
            className="mr-2"
            id="show-all-pools"
            type="checkbox"
            checked={isPoolTvlFiltered}
          />
          Show pools less then $1,000 TVL
        </label>
      </div>
    </>
  );
});
