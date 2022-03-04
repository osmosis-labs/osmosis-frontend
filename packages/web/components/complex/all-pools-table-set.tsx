import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { useAllPoolsTable } from "../../hooks/use-all-pools-table";
import { ObservablePoolWithMetric } from "../../stores/imperator-queries";
import { MenuToggle, PageList, SortMenu } from "../control";
import { SearchBox } from "../input";
import { PoolTable } from "../table";

const poolsMenuOptions = [
  { id: "incentivized-pools", display: "Incentivized Pools" },
  { id: "all-pools", display: "All Pools" },
];

const TVL_FILTER_THRESHOLD = 1000;

export const AllPoolsTableSet: FunctionComponent<{
  allPools: ObservablePoolWithMetric[];
  incentivizedPoolIds: string[];
}> = observer(({ allPools, incentivizedPoolIds }) => {
  const [activeOptionId, setActiveOptionId] = useState(poolsMenuOptions[0].id);
  const [isPoolTvlFiltered, setIsPoolTvlFiltered] = useState(false);
  const incentivizedPools = allPools.reduce(
    (
      incentivizedPools: ObservablePoolWithMetric[],
      poolWithMetric: ObservablePoolWithMetric
    ) => {
      if (
        incentivizedPoolIds.some((poolId) => poolWithMetric.pool.id === poolId)
      ) {
        incentivizedPools.push(poolWithMetric);
      }
      return incentivizedPools;
    },
    []
  );
  const isIncentivizedPools = activeOptionId === poolsMenuOptions[0].id;
  const activeOptionPools = isIncentivizedPools ? incentivizedPools : allPools;
  const tvlFilteredPools = isPoolTvlFiltered
    ? activeOptionPools
    : activeOptionPools.filter((poolWithMetric) =>
        poolWithMetric.liquidity.toDec().gte(new Dec(TVL_FILTER_THRESHOLD))
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
