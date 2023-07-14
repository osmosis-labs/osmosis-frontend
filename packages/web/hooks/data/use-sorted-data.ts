import { useCallback, useMemo, useState } from "react";

import { SortDirection } from "~/components/types";
import { DataSorter } from "./data-sorter";
import { DataProcessor } from "./types";
import { useUserProcessedData } from "./use-user-processed-data";

/**
 * Manages the use of user input to sort arbitrary data given a 'dot' key path (i.e. `"attributes.color"`).
 *
 * @param data Data to sort on. Reference will be copied and sorted inplace.
 * @param initialKeyPath Key to sort data on for first render.
 * @param initialSortDirection Direction to sort for first render. Default: `"ascending"`.
 * @param sorter Optional object that can sort user data.
 * @returns [keypath, setKeypath, sortDirection, setSortDirection, toggleSortDirection, results]
 */
export function useSortedData<TData>(
  data: TData[],
  initialKeyPath?: string,
  initialSortDirection?: SortDirection,
  sorter?: DataProcessor<TData[]>
): [
  string,
  (terms: string) => void,
  SortDirection,
  (sortDirection: SortDirection) => void,
  () => void,
  TData[]
] {
  const processor = useMemo(
    () => sorter ?? new DataSorter<TData>(data),
    [sorter, data]
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialSortDirection ?? "ascending"
  );
  const toggleSortDirection = useCallback(
    () =>
      setSortDirection(
        sortDirection === "ascending" ? "descending" : "ascending"
      ),
    [sortDirection]
  );
  const [keypath, setKeypath, results] = useUserProcessedData(
    data,
    processor,
    initialKeyPath
  );

  const directionalResults = useMemo(
    () => (sortDirection === "descending" ? [...results].reverse() : results),
    [sortDirection, results]
  );

  return [
    keypath,
    setKeypath,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    directionalResults,
  ];
}
