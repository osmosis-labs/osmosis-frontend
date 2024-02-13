import { FilterFn } from "@tanstack/react-table";

import { Filters } from "~/components/earn/filters/filter-context";
import {
  ListOption,
  STRATEGY_METHODS,
  STRATEGY_PROVIDERS,
  StrategyMethods,
  StrategyProviders,
} from "~/components/earn/table/types/filters";
import { EarnStrategy } from "~/server/queries/numia/earn";

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
  const inputFilter = filterValue as ListOption<string>;

  if (inputFilter.value === "") {
    return true;
  }

  return inputFilter.value === value;
};

export const multiListOptionValueEquals: FilterFn<EarnStrategy> = (
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
      return "type";
    case "platform":
      return "provider";
    case "rewardType":
      return "rewardTokens";
    case "search":
      return "name";
    case "noLockingDuration":
      return "hasLockingDuration";
    case "tokenHolder":
      return "holdsTokens";
    case "specialTokens":
      return "tokensType";
    default:
      return k;
  }
};

export const getDefaultFiltersState = (filters: Filters) =>
  Object.entries(filters).map(([key, value]) => ({
    id: _getKey(key as keyof Filters),
    value,
  }));

export const getListOptions = <T>(
  strategies: EarnStrategy[],
  accessor: keyof Pick<EarnStrategy, "provider" | "type">,
  allLabel: string
) => {
  const possibleOptions = new Set<string>();
  let array: ListOption<T>[];

  strategies.forEach((strategy) => {
    const selection = strategy[accessor];
    possibleOptions.add(selection);
  });

  array = Array.from(possibleOptions).map((option) => ({
    value: accessor === "type" ? (option as T) : (option as T),
    label:
      accessor === "type"
        ? STRATEGY_METHODS[option as StrategyMethods]
        : STRATEGY_PROVIDERS[option as StrategyProviders],
  }));

  array.unshift({ value: "" as T, label: allLabel });

  return array;
};
