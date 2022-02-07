import { useMemo } from "react";
import { DataProcessor } from "./types";
import { useUserProcessedData } from "./use-user-processed-data";
import { DataSorter } from "./data-sorter";

export function useSortedData<TData>(
  data: TData[],
  filter?: DataProcessor<TData[]>
): [string, (terms: string) => void, TData[]] {
  const processor = useMemo(
    () => filter ?? new DataSorter<TData>(data),
    [data]
  );

  return useUserProcessedData(data, processor);
}
