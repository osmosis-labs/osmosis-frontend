import { useEffect, useState } from "react";

/** Stores and syncs to a value in `localStorage` at `key`.
 *  Will `JSON.stringify` and `JSON.parse` value of type `T`.
 *  Use `null` over `undefined` state.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // init from localstorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawItem = window.localStorage.getItem(key);

      if (rawItem) {
        try {
          const item = JSON.parse(rawItem);
          setStoredValue(item);
        } catch {
          console.error("Problem parsing localStorage item at key: ", key);
        }
      }
    }
  }, [key, setStoredValue]);

  const setValue = (value: T) => {
    try {
      if (typeof window !== "undefined" && key) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }

      setStoredValue(value);
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}
