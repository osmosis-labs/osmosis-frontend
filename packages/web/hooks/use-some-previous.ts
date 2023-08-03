import { useEffect, useRef } from "react";

/** Inspired by `usePrevious` from react-use, but includes a condition for using the previous value. */
export function useSomePrevious<T>(value: T, condition: (prev: T) => boolean) {
  const ref = useRef<T>();
  useEffect(() => {
    if (condition(value)) ref.current = value;
  });
  return ref.current;
}
