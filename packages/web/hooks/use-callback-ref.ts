import { useCallback, useEffect, useRef } from "react";

/**
 * The `useCallbackRef` hook returns a stable function that always calls the latest `callback`.
 * Useful to avoid passing a function as a dependency to prevent unneeded re-renders
 * inside `useEffect`, `useCallback` or `useMemo`, and subsequently layout.
 */
export function useCallbackRef<T extends (...args: any[]) => any>(
  callback: T | undefined
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  const stableCallback = useCallback(
    (...args: Parameters<T>): ReturnType<T> => callbackRef.current?.(...args),
    []
  );
  return stableCallback as T;
}
