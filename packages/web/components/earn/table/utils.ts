import { RatePretty } from "@keplr-wallet/unit";
import { EarnStrategy, StrategyCMSData } from "@osmosis-labs/server";
import { FilterFn, SortingFn } from "@tanstack/react-table";
import dayjs from "dayjs";

import { Filters } from "~/components/earn/filters/filter-context";
import { ListOption } from "~/components/earn/table/types/filters";

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
  const values = row.getValue(colID) as string[];
  const inputFilter = filterValue as ListOption<string>[];

  // If the passed filter is empty, show all strategies
  if (inputFilter.length === 0) {
    return true;
  }

  return inputFilter.every((f) => values.includes(f.label));
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

export const sortDecValues: SortingFn<EarnStrategy> = (rowA, rowB, colId) => {
  const valueA: RatePretty | undefined = rowA.getValue(colId);
  const valueB: RatePretty | undefined = rowB.getValue(colId);

  if (!valueA || !valueB) return -1;

  const rowAConvertedValue = Number(
    (rowA.getValue(colId) as RatePretty).toDec().toString()
  );
  const rowBConvertedValue = Number(
    (rowB.getValue(colId) as RatePretty).toDec().toString()
  );

  if (rowAConvertedValue === rowBConvertedValue) return 0;
  /**
   * We can also write it as a === b ? 0 : a < b ? -1 : 1
   * but I prefer using guard clauses as written above.
   */
  return rowAConvertedValue < rowBConvertedValue ? -1 : 1;
};

export const sortDurationValues: SortingFn<EarnStrategy> = (
  rowA,
  rowB,
  colId
) => {
  const valueA: string = rowA.getValue(colId);
  const valueB: string = rowB.getValue(colId);

  if (!valueA || !valueB) return -1;

  const rowAConvertedValue = dayjs.duration(valueA).asMilliseconds();
  const rowBConvertedValue = dayjs.duration(valueB).asMilliseconds();

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
    case "rewardType":
      return "rewardAssets";
    case "search":
      return "name";
    case "lockDurationType":
      return "hasLockingDuration";
    case "tokenHolder":
      return "holdsTokens";
    case "specialTokens":
      return "categories";
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
  strategies: StrategyCMSData[],
  valueAccessor: keyof Pick<StrategyCMSData, "platform" | "type" | "method">,
  labelAccessor: keyof Pick<StrategyCMSData, "platform" | "type" | "method">,
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

  const uniqueOptions = Array.from(uniqueOptionsMap.values());

  uniqueOptions.unshift({ value: "" as unknown as T, label: allLabel });

  return uniqueOptions;
};
