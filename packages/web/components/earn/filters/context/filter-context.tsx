import { useCallback } from "react";
import { createContext, PropsWithChildren, useState } from "react";

interface Filters {
  tokenHolder: string;
  strategyMethod: string;
  platforms: string;
  noLockingDuration: boolean;
  search: string;
  stablecoins: boolean;
  correlated: boolean;
  bluechip: boolean;
  rewardType: string;
}

type SetFilterFn = (key: keyof Filters, value: string | boolean) => void;

const defaultFilters: Filters = {
  tokenHolder: "",
  strategyMethod: "",
  platforms: "",
  noLockingDuration: false,
  search: "",
  stablecoins: false,
  correlated: false,
  bluechip: false,
  rewardType: "",
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
