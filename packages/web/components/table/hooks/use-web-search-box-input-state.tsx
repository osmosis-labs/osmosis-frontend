import { useRef } from "react";
import { useKey } from "react-use";

import { useControllableState } from "~/hooks/use-controllable-state";

export const delayOnFalse =
  (callback: (newValue: boolean) => void, ms: number = 100) =>
  (newVale: boolean) => {
    if (!newVale) {
      setTimeout(() => {
        callback(false);
      }, ms);
    } else {
      callback(true);
    }
  };

export const useWebSearchBoxInputState = () => {
  const [searchBoxInputIsFocused, setSearchBoxInputIsFocused] =
    useControllableState({
      defaultValue: false,
    });
  const searchBoxRef = useRef<HTMLInputElement>(null);
  useKey(
    "/",
    (event) => {
      event.preventDefault(); // Prevent the '/' from being entered into the input
      searchBoxRef.current?.focus();
    },
    { event: "keydown" },
    []
  );
  useKey(
    "Escape",
    () => searchBoxRef.current?.blur(),
    { event: "keydown" },
    []
  );

  return {
    searchBoxInputIsFocused,
    searchBoxRef,
    setSearchBoxInputIsFocused,
  };
};
