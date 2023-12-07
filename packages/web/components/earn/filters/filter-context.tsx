import { createContext, PropsWithChildren, useCallback, useState } from "react";

import {
  ListOption,
  Platform,
  RewardsTypes,
  StrategyButtonResponsibility,
  StrategyMethod,
  TokenHolder,
} from "~/components/earn/table/types/filters";

export interface Filters {
  tokenHolder: TokenHolder;
  strategyMethod: ListOption<StrategyMethod>;
  platform: ListOption<Platform>;
  noLockingDuration: boolean;
  search: string;
  specialTokens: ListOption<StrategyButtonResponsibility>[];
  rewardType: RewardsTypes;
}

type SetFilterFn = (
  key: keyof Filters,
  value:
    | string
    | boolean
    | ListOption<StrategyMethod>
    | ListOption<Platform>
    | ListOption<StrategyButtonResponsibility>
) => void;

const defaultFilters: Filters = {
  tokenHolder: "all",
  strategyMethod: { label: "All", value: "" },
  platform: { label: "All", value: "" },
  noLockingDuration: false,
  search: "",
  specialTokens: [],
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
    (key, value) => {
      if (key === "specialTokens") {
        const filterValue = value as ListOption<StrategyButtonResponsibility>;
        const isValueInArray =
          filters.specialTokens.filter((f) => f.value === filterValue.value)
            .length !== 0;
        return setFilters((prev) => ({
          ...prev,
          specialTokens: isValueInArray
            ? prev.specialTokens.filter(
                (filter) => filter.value !== filterValue.value
              )
            : [...prev.specialTokens, filterValue],
        }));
      }
      return setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [filters.specialTokens]
  );

  return (
    <FilterContext.Provider value={{ filters, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};
