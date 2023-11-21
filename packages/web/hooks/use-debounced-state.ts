import { useState } from "react";
import { useDebounce } from "react-use";

/**
 * A hook that returns a debounced state value.
 * @param initialValue The initial value of the state.
 * @param delay The delay in milliseconds to debounce the state.
 * @returns A tuple containing the debounced state value and a setter function. */
export function useDebouncedState<TState>(initialValue: TState, delay: number) {
  const [val, setVal] = useState<TState>(initialValue);
  const [debouncedVal, setDebouncedVal] = useState<TState>(initialValue);
  useDebounce(
    () => {
      setDebouncedVal(debouncedVal);
    },
    delay,
    [val]
  );

  return [debouncedVal, setVal] as const;
}
