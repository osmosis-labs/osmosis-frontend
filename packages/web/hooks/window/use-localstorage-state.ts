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

/** Storage access throws when the user blocks site data; treat that as empty. */
function readItem(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
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
    () => readItem(key),
    () => null
  );

  // Parsed only when the raw item changes, so an inline `initialValue` doesn't
  // give the stored value a new identity on every render.
  const parsed = useMemo((): { ok: true; value: T } | { ok: false } => {
    if (!rawItem) return { ok: false };
    try {
      return { ok: true, value: JSON.parse(rawItem) as T };
    } catch {
      console.error("Problem parsing localStorage item at key: ", key);
      return { ok: false };
    }
  }, [rawItem, key]);
  const storedValue = parsed.ok ? parsed.value : initialValue;

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
