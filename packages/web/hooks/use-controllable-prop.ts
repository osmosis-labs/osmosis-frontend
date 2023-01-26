import { useMemo } from "react";

/**
 * Given a prop value and state value, the useControllableProp hook is used to determine whether a component is controlled or uncontrolled, and also returns the computed value.
 *
 */
export function useControllableProp<T>(prop: T | undefined, state: T) {
  const controlled = typeof prop !== "undefined";
  const value = controlled ? prop : state;
  return useMemo<[boolean, T]>(() => [controlled, value], [controlled, value]);
}
