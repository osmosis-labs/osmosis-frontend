/** Object instance capable of processing memoized data via user input. */
export interface DataProcessor<T> {
  process: (userInput: string) => T;
}
