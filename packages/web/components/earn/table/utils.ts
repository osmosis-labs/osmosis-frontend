import { FilterFn } from "@tanstack/react-table";

import { Filters } from "~/components/earn/filters/filter-context";
import { ListOption } from "~/components/earn/table/types/filters";
import { EarnStrategy } from "~/server/queries/numia/earn";

export const strictEqualFilter: FilterFn<EarnStrategy> = (
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

export const arrLengthEquals: FilterFn<EarnStrategy> = (
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

export const listOptionValueEquals: FilterFn<EarnStrategy> = (
  row,
  colID,
  filterValue
) => {
  const value = row.getValue(colID) as string;
  const inputFilter = filterValue as ListOption<string>[];

  // If the passed filter is empty, show all strategies
  if (inputFilter.length === 0) {
    return true;
  }

  // this checks if in the passed filter contains the value present in the strategy
  const filterResult = inputFilter.filter((option) => option.value === value);

  return filterResult.length > 0;
};

export const boolEqualsString: FilterFn<EarnStrategy> = (
  row,
  colID,
  filterValue
) => {
  const holdsTokens = row.getValue(colID) as boolean;
  const inputFilter = filterValue as string;

  switch (inputFilter) {
    case "my":
      return holdsTokens === true; // this means that the holdsTokens flag is true, and displays only the strategies with this flag on
    case "all":
      return true;
    default:
      return false;
  }
};

export const boolEquals: FilterFn<EarnStrategy> = (row, colID, filterValue) => {
  const hasLockingDuration = row.getValue(colID) as boolean;
  const inputFilter = filterValue as boolean;

  if (!inputFilter) {
    return true;
  } else if (inputFilter === hasLockingDuration) {
    return true;
  }

  return false;
};

export const _getKey = (k: keyof Filters) => {
  switch (k) {
    case "strategyMethod":
      return "category";
    case "platform":
      return "platform";
    case "rewardType":
      return "rewards";
    case "search":
      return "name";
    case "noLockingDuration":
      return "hasLockingDuration";
    case "tokenHolder":
      return "holdsTokens";
    case "specialTokens":
      return "platform";
    default:
      return k;
  }
};

export const getDefaultFiltersState = (filters: Filters) =>
  Object.entries(filters).map(([key, value]) => ({
    id: _getKey(key as keyof Filters),
    value,
  }));
