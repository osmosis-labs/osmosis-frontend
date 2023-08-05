import { useEffect, useRef } from "react";

/** Inspired by `usePrevious` from react-use, but includes a predicate for when to set the previous value. */
export function usePreviousWhen<T>(value: T, condition: (prev: T) => boolean) {
  const ref = useRef<T>();
  useEffect(() => {
    if (condition(value)) ref.current = value;
  });
  return ref.current;
}
