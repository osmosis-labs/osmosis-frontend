import { FilterFn } from "@tanstack/react-table";

import { Filters } from "~/components/earn/filters/filter-context";
import { Strategy } from "~/components/earn/table/types/strategy";

export const MOCK_tableData: Strategy[] = [
  {
    involvedTokens: ["OSMO", "MARS"],
    strategyMethod: {
      displayName: "LP",
      id: "lp",
    },
    platform: {
      displayName: "Quasar",
      id: "quasar",
    },
    strategyName: "ATOM Pro M+ Vault",
    tvl: {
      value: 10290316,
      fluctuation: 4.5,
    },
    apy: 10.94,
    daily: 0.0008,
    reward: ["OSMO", "MARS"],
    lock: 21,
    risk: 2,
    actions: {
      externalURL: "#",
    },
    balance: {
      quantity: 36849,
      converted: "$11,548.52",
    },
  },
  {
    involvedTokens: ["OSMO", "FDAI"],
    strategyMethod: {
      displayName: "Perp LP",
      id: "perp_lp",
    },
    platform: {
      displayName: "Levana",
      id: "levana",
    },
    strategyName: "OSMO Levana xLP",
    tvl: {
      value: 10290316,
      fluctuation: -2.5,
    },
    apy: 10.94,
    daily: 0.0008,
    reward: ["FDAI"],
    lock: 14,
    risk: 1,
    actions: {
      onClick: () => {},
    },
    balance: {
      quantity: 36849,
      converted: "$11,548.52",
    },
  },
];

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
