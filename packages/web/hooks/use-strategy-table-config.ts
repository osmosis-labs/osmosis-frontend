import { useContext, useMemo } from "react";

import { FilterContext } from "~/components/earn/filters/filter-context";
import { getDefaultFiltersState } from "~/components/earn/table/utils";

export const useStrategyTableConfig = () => {
  const { filters, setFilter } = useContext(FilterContext);
  const columnFilters = useMemo(
    () => getDefaultFiltersState(filters),
    [filters]
  );
  const { search } = filters;

  return { columnFilters, globalFilter: search, setFilter };
};
