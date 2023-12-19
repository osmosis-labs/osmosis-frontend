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

export type SetFilterFn = (
  key: keyof Filters,
  value:
    | string
    | boolean
    | ListOption<StrategyMethod>
    | ListOption<Platform>
    | ListOption<StrategyButtonResponsibility>
) => void;

type FilterContextState = {
  filters: Filters | null;
  setFilter: SetFilterFn;
  resetFilters?: () => void;
};

export const FilterContext = createContext<FilterContextState>({
  filters: null,
  setFilter: () => {},
  resetFilters: () => {},
});

export const FilterProvider = ({
  children,
  defaultFilters,
}: PropsWithChildren<{ defaultFilters: Filters }>) => {
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

  const resetFilters = useCallback(
    () => setFilters(defaultFilters),
    [defaultFilters]
  );

  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};
