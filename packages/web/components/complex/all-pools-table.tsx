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
import { Button } from "~/components/ui/button";
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
      ).withDefault(
        poolFilterTypes.filter((type) => type !== "cosmwasm-transmuter")
      ),
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
  onCreatePool: () => void;
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
      <TableControls onCreatePool={props.onCreatePool} />
    </PoolsTable>
  );
};

const TableControls = ({ onCreatePool }: { onCreatePool: () => void }) => {
  const { t } = useTranslation();

  const { filters, setFilters } = useAllPoolsTable();

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

      <div className="flex h-12 flex-wrap items-center gap-3 xl:h-fit">
        <SearchBox
          size="small"
          placeholder={t("assets.table.search")}
          debounce={500}
          currentValue={filters.searchQuery ?? undefined}
          onInput={onSearchInput}
        />
        <CheckboxSelect
          label={t("components.pool.title")}
          selectedOptionIds={filters.poolTypesFilter}
          buttonClassName="!h-9"
          atLeastOneSelected
          options={[
            {
              id: "concentrated",
              display: t("components.table.concentrated"),
            },
            {
              id: "cosmwasm-orderbook",
              display: t("components.table.orderbook"),
            },
            { id: "weighted", display: t("components.table.weighted") },
            { id: "stable", display: t("components.table.stable") },
            {
              id: "cosmwasm-astroport-pcl",
              display: t("components.table.astroport"),
            },
            {
              id: "cosmwasm-whitewhale",
              display: t("components.table.whitewhale"),
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
        <Button
          size="md"
          onClick={onCreatePool}
          className="!h-9 !rounded-xl !bg-osmoverse-700 !py-1.5 hover:!bg-osmoverse-600"
        >
          {t("pools.createPool.title")}
        </Button>
      </div>
    </div>
  );
};
