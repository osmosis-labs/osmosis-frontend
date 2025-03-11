import { useCallback, useEffect, useRef } from "react";

/**
 * The `useCallbackRef` hook returns a useCallback function that its internal function
 * will stay up to date without running the useCallback hook again. Useful to avoid passing a function as a dependency
 * to prevent unneeded re-renders inside `useEffect`, `useCallback` or `useMemo`, and subsequently layout.
 */
export function useCallbackRef<T extends (...args: any[]) => any>(
  callback: T | undefined,
  deps: React.DependencyList = []
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(((...args) => callbackRef.current?.(...args)) as T, deps);
}
