import { FilterFn } from "@tanstack/react-table";

import { Filters } from "~/components/earn/filters/filter-context";
import { Strategy } from "~/components/earn/table/types/strategy";

export const strictEqualFilter: FilterFn<Strategy> = (
  row,
  colID,
  _filterValue
) => {
  const filterValue = _filterValue.value;
  if (filterValue === "") {
    return true;
  }
  return row.getValue(colID) === filterValue;
};

export const arrLengthEquals: FilterFn<Strategy> = (
  row,
  colID,
  filterValue
) => {
  const value = row.getValue(colID) as string[];

  switch (filterValue) {
    case "single":
      return value.length === 1;
    case "multi":
      return value.length > 1;
    default:
      return true;
  }
};

export const _getKey = (k: keyof Filters) => {
  switch (k) {
    case "strategyMethod":
      return "strategyMethod_id";
    case "platform":
      return "platform_id";
    case "rewardType":
      return "reward";
    default:
      return k;
  }
};

export const getDefaultFiltersState = (filters: Filters) =>
  Object.entries(filters).map(([key, value]) => ({
    id: _getKey(key as keyof Filters),
    value,
  }));
