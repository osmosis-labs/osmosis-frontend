import { useRouter } from "next/router";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ListOption,
  LockType,
  RewardsTypes,
  TokenHolder,
} from "~/components/earn/table/types/filters";

export interface Filters {
  tokenHolder: TokenHolder;
  strategyMethod: ListOption<string>[];
  platform: ListOption<string>[];
  lockDurationType: LockType;
  search: string;
  specialTokens: ListOption<string>[];
  rewardType: RewardsTypes;
}

export type SetFilterFn = (
  key: keyof Filters,
  value: string | boolean | ListOption<string> | ListOption<string>
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

type MultiAction = "specialTokens" | "strategyMethod" | "platform";

const MULTI_OPTION_ACTIONS: MultiAction[] = [
  "specialTokens",
  "strategyMethod",
  "platform",
];

export const FilterProvider = ({
  children,
  defaultFilters,
}: PropsWithChildren<{ defaultFilters: Filters }>) => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const router = useRouter();
  const { search } = router.query;

  useEffect(() => {
    if (typeof search === "string" && search !== "") {
      setFilters((prev) => ({ ...prev, search }));
    }
  }, [search]);

  const setFilter = useCallback<SetFilterFn>(
    (key, value) => {
      if (!MULTI_OPTION_ACTIONS.includes(key as MultiAction)) {
        return setFilters((prev) => ({ ...prev, [key]: value }));
      }

      const filterValue = value as ListOption<string>;

      const valueIdx = (filters[key] as ListOption<string>[]).findIndex(
        (option) => option.value === filterValue.value
      );

      const exists = valueIdx !== -1;

      return setFilters((prev) => {
        const prevArray = prev[key] as ListOption<string>[];
        const newArray = exists
          ? prevArray.filter(
              (prevOption) => prevOption.value !== filterValue.value
            )
          : [...prevArray, filterValue];

        return {
          ...prev,
          [key]: newArray,
        };
      });
    },
    [filters]
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
