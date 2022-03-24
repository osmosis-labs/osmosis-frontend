import { useState } from "react";
import { DataProcessor } from "./types";

/**
 * General hook that can take data and let a user process it via text input state.
 * Will not process with empty user input.
 *
 * @param data Data to process.
 * @param processor Instance that can process the data given user input.
 * @returns [userInput, setUserInput, processedData]
 */
export function useUserProcessedData<TData>(
  data: TData[],
  processor: DataProcessor<TData[]>
): [string, (terms: string) => void, TData[]] {
  const [userInput, setUserInput] = useState("");

  return [
    userInput,
    setUserInput,
    userInput === "" ? data : processor.process(userInput),
  ];
}
