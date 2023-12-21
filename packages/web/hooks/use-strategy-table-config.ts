import {
  getCoreRowModel,
  getFilteredRowModel,
  TableOptions,
} from "@tanstack/react-table";
import { useContext, useMemo } from "react";

import { MOCK_tableData } from "~/components/earn/_mock-data";
import { FilterContext } from "~/components/earn/filters/filter-context";
import { tableColumns } from "~/components/earn/table/columns";
import { Strategy } from "~/components/earn/table/types/strategy";
import { getDefaultFiltersState } from "~/components/earn/table/utils";
import { useWindowSize } from "~/hooks/window/use-window-size";

export const useStrategyTableConfig = (showBalance: boolean) => {
  const { filters, setFilter } = useContext(FilterContext);
  const columnFilters = useMemo(
    () => getDefaultFiltersState(filters!),
    [filters]
  );
  const { isMobile } = useWindowSize();

  const tableConfig: TableOptions<Strategy> = {
    data: MOCK_tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility: {
        balance_quantity: showBalance,
        involvedTokens: !isMobile,
        strategyMethod_id: false,
        platform_id: false,
        hasLockingDuration: false,
        holdsTokens: false,
        chainType: false,
      },
      globalFilter: filters!.search,
      columnFilters,
    },
    globalFilterFn: "includesString",
    onGlobalFilterChange: (e) => setFilter("search", e),
  };

  return { tableConfig };
};
