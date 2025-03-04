import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useState } from "react";

/**
 * A hook that allows you to copy a value to the clipboard using Expo's Clipboard API.
 *
 * @param value The value to copy to the clipboard.
 * @param timeout The duration to keep the `hasCopied` state active.
 *
 * @returns An object containing the copied value, a function to set the value, a function to copy the value to the clipboard, and a boolean indicating if the value has been copied.
 */
export function useClipboard(value: string, timeout: number = 1500) {
  const [hasCopied, setHasCopied] = useState(false);
  const [valueState, setValueState] = useState(value);

  useEffect(() => setValueState(value), [value]);

  const onCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(valueState);
      setHasCopied(true);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, [valueState]);

  useEffect(() => {
    let timeoutId: number | null = null;

    if (hasCopied) {
      timeoutId = window.setTimeout(() => {
        setHasCopied(false);
      }, timeout);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [timeout, hasCopied]);

  return {
    value: valueState,
    setValue: setValueState,
    onCopy,
    hasCopied,
  };
}
