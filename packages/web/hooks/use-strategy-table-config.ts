import {
  getCoreRowModel,
  getFilteredRowModel,
  TableOptions,
} from "@tanstack/react-table";
import { useContext, useMemo } from "react";

import { FilterContext } from "~/components/earn/filters/filter-context";
import { tableColumns } from "~/components/earn/table/columns";
import { getDefaultFiltersState } from "~/components/earn/table/utils";
import { useWindowSize } from "~/hooks/window/use-window-size";
import { EarnStrategy } from "~/server/queries/numia/earn";

export const useStrategyTableConfig = (
  data: EarnStrategy[],
  showBalance: boolean
) => {
  const { filters, setFilter } = useContext(FilterContext);
  const columnFilters = useMemo(
    () => getDefaultFiltersState(filters!),
    [filters]
  );
  const { isMobile } = useWindowSize();

  const tableConfig: TableOptions<EarnStrategy> = {
    data,
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
