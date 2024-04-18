import { createContext, PropsWithChildren, useCallback, useState } from "react";

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

const MULTI_OPTION_BASE_VALUE = { label: "All", value: "" };

export const FilterProvider = ({
  children,
  defaultFilters,
}: PropsWithChildren<{ defaultFilters: Filters }>) => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const resetMultiFilter = useCallback(
    (key: MultiAction) =>
      setFilters((prev) => ({
        ...prev,
        [key]: [MULTI_OPTION_BASE_VALUE],
      })),
    []
  );

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

      // handle "All" click case
      if (filterValue.value === "") {
        // reset to base case
        resetMultiFilter(key as MultiAction);
      }

      return setFilters((prev) => {
        const prevArray = prev[key] as ListOption<string>[];
        /**
         * This code chooses what new array
         * to return based on the existence of the incoming filter value.
         *
         * If the incoming value is already present in the state value,
         * then remove it. If it doesn't, then add it.
         *
         * In both cases, we are going to remove the base case (which is the
         * "all" case that opens the filter to everything) in order to not
         * have it present on the filter when some value exists.
         */
        const newArray = exists
          ? prevArray.filter(
              (prevOption) =>
                prevOption.value !== filterValue.value &&
                prevOption.value !== ""
            )
          : [...prevArray, filterValue].filter((v) => v.value !== "");

        return {
          ...prev,
          [key]:
            /**
             * Now here, if the filter corresponds to
             * "specialTokens" (or token type, "specialTokens" is a legacy name),
             * we just return the new array, which COULD be empty, and that would be nice
             * for specialTokens, but not for the other multi filters,
             * because having them empty would break the purpose of the
             * listOptionValueEquals function, which relies on having
             * at least the base case on the state array.
             *
             * So, to solve this issue, we will always push an array with
             * the base case if there would be no filters in the new array.
             */
            key === "specialTokens"
              ? newArray
              : newArray.length === 0
              ? [MULTI_OPTION_BASE_VALUE]
              : newArray,
        };
      });
    },
    [filters, resetMultiFilter]
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
