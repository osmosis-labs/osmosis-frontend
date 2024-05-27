import Fuse from "fuse.js";
import { useMemo } from "react";

import { DataFilter } from "~/hooks/data/data-filter";
import { DataProcessor } from "~/hooks/data/types";
import { useUserProcessedData } from "~/hooks/data/use-user-processed-data";

/**
 * Manages the use of user input to filter (search) arbitrary data given a set object keys.
 *
 * @param data Data to filter/search on.
 * @param memoedKeys Object keys of a single data item to search on. For nested objects use dot syntax, e.g. `"fruit.shape"`. See: https://fusejs.io/api/options.html#keys.
 * @param filter Optional object that can filter user data.
 * @returns [query, setQuery, results]
 */
export function useFilteredData<TData>(
  data: TData[],
  memoedKeys?: Fuse.FuseOptionKey<TData>[],
  filter?: DataProcessor<TData[]>,
  initialQuery?: string
): [string, (terms: string) => void, TData[]] {
  const processor = useMemo(
    () => filter ?? new DataFilter<TData>(data, memoedKeys),
    [data, memoedKeys, filter]
  );

  return useUserProcessedData(data, processor, initialQuery);
}
