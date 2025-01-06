import equal from "fast-deep-equal";
import { DependencyList, useRef } from "react";

/**
 * A custom hook for `useMemo` that uses deep comparison on the dependencies.
 *
 * @param factory - A function that produces the memoized value.
 * @param dependencies - The dependency array to be deeply compared.
 * @returns The memoized value.
 */
export function useDeepMemo<T>(
  factory: () => T,
  dependencies: DependencyList
): T {
  if (!Array.isArray(dependencies)) {
    throw new Error("useDeepMemo expects a dependency array");
  }
  const dependenciesRef = useRef<DependencyList>();
  const memoizedValueRef = useRef<T>();

  if (!equal(dependenciesRef.current, dependencies)) {
    dependenciesRef.current = dependencies;
    memoizedValueRef.current = factory();
  }

  return memoizedValueRef.current!;
}
