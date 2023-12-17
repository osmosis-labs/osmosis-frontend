import { useEffect, useMemo, useState } from "react";

import type { Search } from "~/utils/search";

import { useDebouncedState } from "../use-debounced-state";

/** Manages input for a search box that will be used
 *  to perform a search remotely (is debounced). */
export function useSearchQueryInput(debounceMs = 500) {
  // get selectable currencies for trading, including user balances if wallect connected
  const [searchInput, setSearchInput] = useState<string>("");

  // generate debounced search from user inputs
  const [debouncedSearchInput, setDebouncedSearchInput] =
    useDebouncedState<string>("", debounceMs);
  useEffect(() => {
    const sanitizedSearchInput = searchInput.replace(/#/g, "").trim();
    setDebouncedSearchInput(sanitizedSearchInput);
  }, [setDebouncedSearchInput, searchInput]);

  const queryInput: Search | undefined = useMemo(
    () => (debouncedSearchInput ? { query: debouncedSearchInput } : undefined),
    [debouncedSearchInput]
  );

  return [
    searchInput,
    debouncedSearchInput,
    setSearchInput,
    queryInput,
  ] as const;
}
