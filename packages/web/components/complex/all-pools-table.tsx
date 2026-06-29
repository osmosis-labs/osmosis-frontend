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
  marketIncentivePoolsSortKeys,
  poolFilterTypes,
  PoolsTable,
  PoolType,
  PoolTypeFilter,
} from "~/components/complex/pools-table";
import { Button } from "~/components/ui/button";
import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";

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
      // The incentive-type filter UI was removed in the pools page redesign.
      // PoolsTable defaults poolIncentivesFilter to all incentive types (no
      // filtering) when the prop is absent, so we no longer track it as URL
      // state here.
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
  quickAddLiquidity: (poolId: string, poolType: PoolType) => void;
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
  const { width } = useWindowSize();
  // width === 0 during SSR; default to the wide desktop layout to avoid a flash of the compact layout on hydration.
  const isWide = width === 0 || width >= Breakpoint.xl;

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

  const searchBox = (
    <SearchBox
      size="small"
      placeholder={t("assets.table.search")}
      debounce={500}
      currentValue={filters.searchQuery ?? undefined}
      onInput={onSearchInput}
      className={isWide ? undefined : "!w-full"}
    />
  );

  const filterAndCreate = (
    <div className="flex flex-none items-center gap-3">
      <CheckboxSelect
        label={t("components.pool.title")}
        selectedOptionIds={filters.poolTypesFilter}
        buttonClassName="!h-9 md:!w-auto"
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
        className="!h-9 !bg-osmoverse-700 !py-1.5 hover:!bg-osmoverse-600"
      >
        {t("pools.createPool.title")}
      </Button>
    </div>
  );

  if (isWide) {
    return (
      <div className="flex w-full items-center gap-5">
        <h5 className="mr-auto">{t("pools.allPools.title")}</h5>
        {searchBox}
        {filterAndCreate}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full items-center gap-5">
        <h5 className="mr-auto">{t("pools.allPools.title")}</h5>
        {filterAndCreate}
      </div>
      {searchBox}
    </div>
  );
};
