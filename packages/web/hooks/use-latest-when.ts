import { useState } from "react";

/**
 * Returns `value` while it satisfies `condition`, otherwise the most recent value that did.
 * Useful for holding on to the last good value while the next one loads.
 *
 * When `resetKey` changes, the held value is discarded and nothing is returned
 * until a value qualifies under the new key, so a value captured under one key
 * (e.g. one quote direction) is never served under another.
 *
 * `value` must keep its identity across re-renders with the same inputs (e.g. query data or
 * props), since a changed qualifying value is stored with a render-phase state update.
 */
export function useLatestWhen<T>(
  value: T,
  condition: (value: T) => boolean,
  resetKey?: unknown
): T | undefined {
  const [held, setHeld] = useState<{ key: unknown; value: T } | null>(null);

  if (condition(value)) {
    if (
      !held ||
      !Object.is(held.key, resetKey) ||
      !Object.is(held.value, value)
    ) {
      setHeld({ key: resetKey, value });
    }
    return value;
  }

  if (held && !Object.is(held.key, resetKey)) {
    setHeld(null);
    return undefined;
  }

  return held?.value;
}
