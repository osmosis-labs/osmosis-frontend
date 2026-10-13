import { useState } from "react";

/**
 * Returns `value` while it satisfies `condition`, otherwise the most recent value that did.
 * Useful for holding on to the last good value while the next one loads.
 *
 * `value` must keep its identity across re-renders with the same inputs (e.g. query data or
 * props), since a changed qualifying value is stored with a render-phase state update.
 */
export function useLatestWhen<T>(value: T, condition: (value: T) => boolean) {
  const [latest, setLatest] = useState<T | undefined>(undefined);
  const qualifies = condition(value);

  if (qualifies && !Object.is(latest, value)) {
    setLatest(value);
  }

  return qualifies ? value : latest;
}
