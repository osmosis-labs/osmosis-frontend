import type { SortDirection } from "@osmosis-labs/utils";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useCallback } from "react";

import {
  incentiveTypes,
  marketIncentivePoolsSortKeys,
  poolFilterTypes,
  PoolIncentiveFilter,
  PoolsTable,
  PoolTypeFilter,
} from "~/components/complex/pools-table";
import { useTranslation } from "~/hooks";

import { CheckboxSelect } from "../control";
import { SearchBox } from "../input";

const useAllPoolsTable = () => {
  const [sortParams, setSortParams] = useQueryStates(
    {
      allPoolsSort: parseAsStringLiteral(
        marketIncentivePoolsSortKeys
      ).withDefault("market.volume24hUsd"),
      allPoolsSortDir: parseAsStringEnum<SortDirection>([
        "asc",
        "desc",
      ]).withDefault("desc"),
    },
    {
      history: "push",
    }
  );

  const [filters, setFilters] = useQueryStates(
    {
      searchQuery: parseAsString,
      poolTypesFilter: parseAsArrayOf<PoolTypeFilter>(
        parseAsStringLiteral<PoolTypeFilter>(poolFilterTypes)
      ).withDefault([...poolFilterTypes]),
      poolIncentivesFilter: parseAsArrayOf<PoolIncentiveFilter>(
        parseAsStringLiteral<PoolIncentiveFilter>(incentiveTypes)
      ).withDefault([...incentiveTypes]),
    },
    {
      history: "push",
    }
  );

  return {
    filters,
    setFilters,
    sortParams,
    setSortParams,
  };
};

interface AllPoolsTableProps {
  topOffset: number;
  quickAddLiquidity: (poolId: string) => void;
}

export const AllPoolsTable = (props: AllPoolsTableProps) => {
  const { filters, sortParams, setSortParams } = useAllPoolsTable();

  const setSortDirection = useCallback(
    (dir: SortDirection) => {
      setSortParams((state) => ({
        ...state,
        allPoolsSortDir: dir,
      }));
    },
    [setSortParams]
  );

  const setSortKey = useCallback(
    (key: (typeof sortParams)["allPoolsSort"] | undefined) => {
      if (key) {
        setSortParams((state) => ({
          ...state,
          allPoolsSort: key,
        }));
      }
    },
    [setSortParams]
  );

  return (
    <PoolsTable
      {...props}
      filters={filters}
      sortParams={sortParams}
      setSortDirection={setSortDirection}
      setSortKey={setSortKey}
    >
      <TableControls />
    </PoolsTable>
  );
};

const TableControls = () => {
  const { t } = useTranslation();

  const { filters, setFilters } = useAllPoolsTable();

  filters.poolTypesFilter;

  const onSearchInput = useCallback(
    (data: string) => {
      setFilters((state) => ({
        ...state,
        searchQuery: data.length === 0 ? null : data,
      }));
    },
    [setFilters]
  );

  return (
    <div className="flex w-full place-content-between items-center gap-5 xl:flex-col xl:items-start">
      <h5>{t("pools.allPools.title")}</h5>

      <div className="flex h-12 flex-wrap gap-3 xl:h-fit">
        <CheckboxSelect
          label={t("components.pool.title")}
          selectedOptionIds={filters.poolTypesFilter}
          atLeastOneSelected
          options={[
            { id: "weighted", display: t("components.table.weighted") },
            { id: "stable", display: t("components.table.stable") },
            {
              id: "concentrated",
              display: t("components.table.concentrated"),
            },
            {
              id: "cosmwasm-transmuter",
              display: t("components.table.transmuter"),
            },
          ]}
          onSelect={(poolType) => {
            if (filters.poolTypesFilter.includes(poolType as PoolTypeFilter)) {
              setFilters((state) => ({
                ...state,
                poolTypesFilter: state.poolTypesFilter.filter(
                  (type) => type !== poolType
                ),
              }));
            } else {
              setFilters((state) => ({
                ...state,
                poolTypesFilter: [
                  ...state.poolTypesFilter,
                  poolType as PoolTypeFilter,
                ],
              }));
            }
          }}
        />
        <CheckboxSelect
          label={t("components.incentive.title")}
          selectedOptionIds={filters.poolIncentivesFilter}
          atLeastOneSelected
          options={[
            { id: "superfluid", display: t("pools.aprBreakdown.superfluid") },
            { id: "osmosis", display: t("pools.aprBreakdown.boost") },
            {
              id: "boost",
              display: t("pools.aprBreakdown.externalBoost"),
            },
            {
              id: "none",
              display: t("components.table.noIncentives"),
            },
          ]}
          onSelect={(incentiveType) => {
            if (
              filters.poolIncentivesFilter.includes(
                incentiveType as PoolIncentiveFilter
              )
            ) {
              setFilters((state) => ({
                ...state,
                poolIncentivesFilter: filters.poolIncentivesFilter.filter(
                  (type) => type !== (incentiveType as PoolIncentiveFilter)
                ),
              }));
            } else {
              setFilters((state) => ({
                ...state,
                poolIncentivesFilter: [
                  ...state.poolIncentivesFilter,
                  incentiveType as PoolIncentiveFilter,
                ],
              }));
            }
          }}
        />
        <SearchBox
          size="small"
          placeholder={t("assets.table.search")}
          debounce={500}
          currentValue={filters.searchQuery ?? undefined}
          onInput={onSearchInput}
        />
      </div>
    </div>
  );
};
