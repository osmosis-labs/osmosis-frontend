import { useCallback, useMemo, useSyncExternalStore } from "react";

/** Same-tab writes don't fire `storage` events, so notify hook instances directly. */
const localListeners = new Set<() => void>();

function subscribe(listener: () => void) {
  localListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    localListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Stores and syncs to a value in `localStorage` at `key`.
 *  Will `JSON.stringify` and `JSON.parse` value of type `T`.
 *  Use `null` over `undefined` state.
 *  Renders `initialValue` on the server and during hydration.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const rawItem = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key),
    () => null
  );

  const storedValue = useMemo(() => {
    if (!rawItem) return initialValue;
    try {
      return JSON.parse(rawItem) as T;
    } catch {
      console.error("Problem parsing localStorage item at key: ", key);
      return initialValue;
    }
  }, [rawItem, initialValue, key]);

  const setValue = useCallback(
    (value: T) => {
      try {
        if (key) {
          window.localStorage.setItem(key, JSON.stringify(value));
          localListeners.forEach((listener) => listener());
        }
      } catch (error) {
        console.error(error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
