import equal from "fast-deep-equal";
import { DependencyList, useState } from "react";

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
  const [memo, setMemo] = useState(() => ({
    dependencies,
    value: factory(),
  }));

  if (!equal(memo.dependencies, dependencies)) {
    // Storing information from previous renders: React re-renders immediately
    // with the new state, and the deep-equal check stops it from looping.
    const next = { dependencies, value: factory() };
    setMemo(next);
    return next.value;
  }

  return memo.value;
}
