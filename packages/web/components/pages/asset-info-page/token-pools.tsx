import { SortDirection } from "@osmosis-labs/utils";
import { useMemo, useState } from "react";

import {
  incentiveTypes,
  MarketIncentivePoolsSortKey,
  poolFilterTypes,
  PoolsTabelSortParams,
  PoolsTable,
  PoolsTableFilters,
} from "~/components/complex/pools-table";

interface TokenPoolsProps {
  denom: string;
}

const defaultFilters: PoolsTableFilters = {
  searchQuery: "",
  poolTypesFilter: poolFilterTypes,
  poolIncentivesFilter: incentiveTypes,
};

export const TokenPools = (props: TokenPoolsProps) => {
  const { denom } = props;
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [sortKey, setSortKey] =
    useState<MarketIncentivePoolsSortKey>("volume24hUsd");
  const [] = useState();

  const filters = useMemo(
    () => ({
      ...defaultFilters,
      searchQuery: denom,
    }),
    [denom]
  );

  const sortParams: PoolsTabelSortParams = useMemo(
    () => ({
      allPoolsSort: sortKey,
      allPoolsSortDir: sortDirection,
    }),
    [sortDirection, sortKey]
  );

  return (
    <section>
      <h5 className="mb-6">Pools</h5>

      <PoolsTable
        limit={4}
        filters={filters}
        disablePagination
        sortParams={sortParams}
        setSortDirection={setSortDirection}
        setSortKey={(key) => setSortKey(key ?? "volume24hUsd")}
      />
    </section>
  );
};
