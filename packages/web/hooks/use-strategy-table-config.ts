import {
  getCoreRowModel,
  getFilteredRowModel,
  TableOptions,
} from "@tanstack/react-table";
import { useContext, useMemo } from "react";

import { FilterContext } from "~/components/earn/filters/filter-context";
import { tableColumns } from "~/components/earn/table/columns";
import { Strategy } from "~/components/earn/table/types/strategy";
import {
  arrLengthEquals,
  getDefaultFiltersState,
  MOCK_tableData,
  strictEqualFilter,
} from "~/components/earn/table/utils";

export const useStrategyTableConfig = (showBalance: boolean) => {
  const { filters, setFilter } = useContext(FilterContext);
  const columnFilters = useMemo(
    () => getDefaultFiltersState(filters),
    [filters]
  );
  const { search: globalFilter } = filters;

  const tableConfig: TableOptions<Strategy> = {
    data: MOCK_tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility: {
        balance_quantity: showBalance,
      },
      globalFilter,
      columnFilters,
    },
    filterFns: {
      strictEqualFilter,
      arrLengthEquals,
    },
    globalFilterFn: "includesString",
    onGlobalFilterChange: (e) => setFilter("search", e),
  };

  return { tableConfig };
};
