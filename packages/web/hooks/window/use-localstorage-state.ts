import { useState } from "react";

export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: T | Function) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);

      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | Function) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }

      setStoredValue(valueToStore);
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}
