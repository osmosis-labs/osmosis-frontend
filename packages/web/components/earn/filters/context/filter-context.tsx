import { createContext, PropsWithChildren, useCallback, useState } from "react";

import {
  Platform,
  RewardsTypes,
  StrategyMethod,
  TokenHolder,
} from "~/components/earn/types";

interface Filters {
  tokenHolder: TokenHolder;
  strategyMethod: StrategyMethod;
  platform: Platform;
  noLockingDuration: boolean;
  search: string;
  stablecoins: boolean;
  correlated: boolean;
  bluechip: boolean;
  rewardType: RewardsTypes;
}

type SetFilterFn = (
  key: keyof Filters,
  value: string | boolean | StrategyMethod | Platform
) => void;

const defaultFilters: Filters = {
  tokenHolder: "all",
  strategyMethod: "All",
  platform: "All",
  noLockingDuration: false,
  search: "",
  stablecoins: false,
  correlated: false,
  bluechip: false,
  rewardType: "all",
};

type FilterContextState = {
  filters: Filters;
  setFilter: SetFilterFn;
};

export const FilterContext = createContext<FilterContextState>({
  filters: defaultFilters,
  setFilter: () => {},
});

export const FilterProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const setFilter = useCallback<SetFilterFn>(
    (key, value) => setFilters((prev) => ({ ...prev, [key]: value })),
    []
  );

  return (
    <FilterContext.Provider value={{ filters, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};
