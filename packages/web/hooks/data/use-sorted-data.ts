import { useMemo, useState } from "react";
import { DataProcessor } from "./types";
import { useUserProcessedData } from "./use-user-processed-data";
import { DataSorter } from "./data-sorter";
import { SortDirection } from "../../components/types";

/**
 * Manages the use of user input to sort arbitrary data given a 'dot' key path (i.e. `"attributes.color"`).
 *
 * @param data Data to sort on. Reference will be copied and sorted inplace.
 * @param sorter Optional object that can sort user data.
 * @returns [keypath, setKeypath, sortDirection, setSortDirection, toggleSortDirection, results]
 */
export function useSortedData<TData>(
  data: TData[],
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
    [data]
  );
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("ascending");
  const toggleSortDirection = () =>
    setSortDirection(
      sortDirection === "ascending" ? "descending" : "ascending"
    );
  const [keypath, setKeypath, results] = useUserProcessedData(data, processor);

  if (sortDirection === "descending") {
    results.reverse();
  }

  return [
    keypath,
    setKeypath,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    results,
  ];
}
