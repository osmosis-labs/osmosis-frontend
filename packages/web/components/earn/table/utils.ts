import { FilterFn } from "@tanstack/react-table";

import { Filters } from "~/components/earn/filters/filter-context";
import { ListOption } from "~/components/earn/table/types/filters";
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
    chainType: "bluechip",
    hasLockingDuration: true,
    holdsTokens: true,
  },
  {
    involvedTokens: ["OSMO"],
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
    risk: 1,
    actions: {
      onClick: () => console.log("Hey!"),
    },
    balance: {
      quantity: 36849,
      converted: "$11,548.52",
    },
    chainType: "stablecoins",
    hasLockingDuration: false,
    holdsTokens: false,
  },
  {
    involvedTokens: ["ETH", "BTC"],
    strategyMethod: {
      displayName: "Staking",
      id: "staking",
    },
    platform: {
      displayName: "Osmosis",
      id: "osmosis",
    },
    strategyName: "ETH/BTC Liquidity Pool",
    tvl: {
      value: 8000000,
      fluctuation: 1.2,
    },
    apy: 8.75,
    daily: 0.001,
    reward: ["ETH", "BTC"],
    lock: 30,
    risk: 3,
    actions: {
      externalURL: "#",
    },
    balance: {
      quantity: 50000,
      converted: "$120,000.00",
    },
    chainType: "correlated",
    hasLockingDuration: true,
    holdsTokens: true,
  },
  {
    involvedTokens: ["BTC", "ETH"],
    strategyMethod: {
      displayName: "Vaults",
      id: "vaults",
    },
    platform: {
      displayName: "Levana",
      id: "levana",
    },
    strategyName: "BTC/ETH Liquidity Pool",
    tvl: {
      value: 9500000,
      fluctuation: 2.8,
    },
    apy: 9.25,
    daily: 0.0012,
    reward: ["BTC", "ETH"],
    lock: 25,
    risk: 2,
    actions: {
      externalURL: "#",
    },
    balance: {
      quantity: 45000,
      converted: "$110,000.00",
    },
    chainType: "correlated",
    hasLockingDuration: true,
    holdsTokens: true,
  },
  {
    involvedTokens: ["LINK", "USDC"],
    strategyMethod: {
      displayName: "Lending",
      id: "lending",
    },
    platform: {
      displayName: "Mars",
      id: "mars",
    },
    strategyName: "LINK-USDC Farm",
    tvl: {
      value: 7500000,
      fluctuation: -1.5,
    },
    apy: 11.5,
    daily: 0.0015,
    reward: ["LINK"],
    risk: 3,
    actions: {
      externalURL: "#",
    },
    balance: {
      quantity: 55000,
      converted: "$85,000.00",
    },
    chainType: "stablecoins",
    hasLockingDuration: false,
    holdsTokens: true,
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

export const listOptionValueEquals: FilterFn<Strategy> = (
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

export const boolEqualsString: FilterFn<Strategy> = (
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

export const boolEquals: FilterFn<Strategy> = (row, colID, filterValue) => {
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
      return "strategyMethod_id";
    case "platform":
      return "platform_id";
    case "rewardType":
      return "reward";
    case "search":
      return "strategyName";
    case "noLockingDuration":
      return "hasLockingDuration";
    case "tokenHolder":
      return "holdsTokens";
    case "specialTokens":
      return "chainType";
    default:
      return k;
  }
};

export const getDefaultFiltersState = (filters: Filters) =>
  Object.entries(filters).map(([key, value]) => ({
    id: _getKey(key as keyof Filters),
    value,
  }));
