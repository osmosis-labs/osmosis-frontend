import { FilterFn, SortingFn } from "@tanstack/react-table";

import { Filters } from "~/components/earn/filters/filter-context";
import { ListOption } from "~/components/earn/table/types/filters";
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

export const lockDurationFilter: FilterFn<EarnStrategy> = (
  row,
  colID,
  filterValue
) => {
  const hasLockDuration = row.getValue(colID) as boolean;

  switch (filterValue) {
    case "lock":
      return hasLockDuration;
    case "nolock":
      return !hasLockDuration;
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

export const sortDecValues: SortingFn<EarnStrategy> = (rowA, rowB) => {
  const rowAConvertedValue = Number(rowA.original.tvl.toDec().toString());
  const rowBConvertedValue = Number(rowB.original.tvl.toDec().toString());

  if (rowAConvertedValue === rowBConvertedValue) return 0;
  /**
   * We can also write it as a === b ? 0 : a < b ? -1 : 1
   * but I prefer using guard clauses as written above.
   */
  return rowAConvertedValue < rowBConvertedValue ? -1 : 1;
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
    case "lockDurationType":
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
  valueAccessor: keyof Pick<EarnStrategy, "provider" | "type">,
  labelAccessor: keyof Pick<EarnStrategy, "provider" | "category">,
  allLabel: string
) => {
  const uniqueOptionsMap = new Map<string, ListOption<T>>();

  strategies.forEach((strategy) => {
    const value = strategy[valueAccessor] as unknown as T;
    const label = strategy[labelAccessor];
    const uniqueKey = `${label}-${String(value)}`;

    if (!uniqueOptionsMap.has(uniqueKey)) {
      uniqueOptionsMap.set(uniqueKey, { label, value });
    }
  });

  uniqueOptionsMap.set("all", { value: "" as unknown as T, label: allLabel });

  return Array.from(uniqueOptionsMap.values());
};
