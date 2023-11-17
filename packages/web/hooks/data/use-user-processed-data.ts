import { useMemo, useState } from "react";

import { DataProcessor } from "~/hooks/data/types";

/**
 * General hook that can take data and let a user process it via text input state.
 * Will not process with empty user input.
 *
 * @param data Data to process.
 * @param processor Instance that can process the data given user input.
 * @param initialState Initial user state.
 * @returns [userInput, setUserInput, processedData]
 */
export function useUserProcessedData<TData>(
  data: TData[],
  processor: DataProcessor<TData[]>,
  initialState: string = ""
): [string, (terms: string) => void, TData[]] {
  const [userInput, setUserInput] = useState(initialState);
  const processedData = useMemo(
    () => (userInput === "" ? data : processor.process(userInput)),
    [userInput, data, processor]
  );

  return [userInput, setUserInput, processedData];
}
