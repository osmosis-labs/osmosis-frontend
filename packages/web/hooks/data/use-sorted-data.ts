import { useMemo } from "react";
import { DataProcessor } from "./types";
import { useUserProcessedData } from "./use-user-processed-data";
import { DataSorter } from "./data-sorter";

/**
 * Manages the use of user input to sort arbitrary data given a 'dot' key path (i.e. `"attributes.color"`).
 *
 * @param data Data to sort on. Reference will be copied and sorted inplace.
 * @param sorter Optional object that can sort user data.
 * @returns [keypath, setKeypath, results]
 */
export function useSortedData<TData>(
  data: TData[],
  sorter?: DataProcessor<TData[]>
): [string, (terms: string) => void, TData[]] {
  const processor = useMemo(
    () => sorter ?? new DataSorter<TData>(data),
    [data]
  );

  return useUserProcessedData(data, processor);
}
