import { Search } from "@osmosis-labs/server";
import { useCallback, useMemo } from "react";
import { useState } from "react";

import { useDebouncedState } from "../use-debounced-state";

/** Manages input for a search box that will be used
 *  to perform a search remotely (is debounced). */
export function useSearchQueryInput(debounceMs = 500) {
  // get selectable currencies for trading, including user balances if wallect connected
  const [searchInput, setSearchInput_] = useState<string>("");

  // generate debounced search from user inputs
  const [debouncedSearchInput, setDebouncedSearchInput] =
    useDebouncedState<string>("", debounceMs);

  const setSearchInput = useCallback(
    (input: string) => {
      const sanitizedSearchInput = input.replace(/#/g, "").trim();
      setSearchInput_(sanitizedSearchInput);
      setDebouncedSearchInput(sanitizedSearchInput);
    },
    [setDebouncedSearchInput]
  );

  const queryInput: Search | undefined = useMemo(
    () => (debouncedSearchInput ? { query: debouncedSearchInput } : undefined),
    [debouncedSearchInput]
  );

  return {
    searchInput,
    debouncedSearchInput,
    setSearchInput,
    queryInput,
  };
}
