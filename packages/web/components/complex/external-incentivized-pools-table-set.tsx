import { Dec } from "@keplr-wallet/unit";
import { FunctionComponent, useState } from "react";
import { useExternalIncentivizedPoolsTable } from "../../hooks/use-external-incentivized-pools-table";
import { ObservablePoolWithMetric } from "../../stores/imperator-queries";
import { PageList, SortMenu } from "../control";
import { SearchBox } from "../input";
import { PoolTable } from "../table";

const TVL_FILTER_THRESHOLD = 1000;

export const ExternalIncentivizedPoolsTableSet: FunctionComponent<{
  externalIncentivizedPools: ObservablePoolWithMetric[];
}> = ({ externalIncentivizedPools }) => {
  const [isPoolTvlFiltered, setIsPoolTvlFiltered] = useState(false);
  const tvlFilteredPools = isPoolTvlFiltered
    ? externalIncentivizedPools
    : externalIncentivizedPools.filter((poolWithMetric) =>
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
  } = useExternalIncentivizedPoolsTable(tvlFilteredPools);

  return (
    <>
      <div className="mt-5 flex items-center justify-between">
        <h5>External Incentive Pools</h5>
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
};
