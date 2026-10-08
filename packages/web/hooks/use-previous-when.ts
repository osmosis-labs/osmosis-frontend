import { useEffect, useRef } from "react";

/** Inspired by `usePrevious` from react-use, but includes a predicate for when to set the previous value.
 *
 *  When `resetKey` changes, the held value is discarded and nothing is returned
 *  until a value is accepted under the new key, so a value captured under one
 *  key (e.g. one quote direction) is never served under another. */
export function usePreviousWhen<T>(
  value: T,
  condition: (prev: T) => boolean,
  resetKey?: unknown
) {
  // Holds at most one entry, keyed by the resetKey it was accepted under.
  const ref = useRef(new Map<unknown, T>());
  useEffect(() => {
    const held = ref.current;
    if (!held.has(resetKey)) held.clear();
    if (condition(value)) {
      held.clear();
      held.set(resetKey, value);
    }
  });
  return ref.current.get(resetKey);
}
