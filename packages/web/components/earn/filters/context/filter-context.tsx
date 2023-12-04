import { useCallback } from "react";
import { createContext, PropsWithChildren, useState } from "react";

interface Filters {
  search: string;
  strategyMethod: string;
  tvl: string;
}

type FilterContextState = {
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
};

export const FilterContext = createContext<FilterContextState>({
  filters: {
    search: "",
    strategyMethod: "",
    tvl: "",
  },
  setFilter: () => {},
});

export const FilterProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    strategyMethod: "",
    tvl: "",
  });

  const setFilter = useCallback((key: keyof Filters, value: string) => {
    return setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <FilterContext.Provider value={{ filters, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};
