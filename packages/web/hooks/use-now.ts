import { useSyncExternalStore } from "react";

const TICK_MS = 1_000;

const listeners = new Set<() => void>();
let timeoutId: ReturnType<typeof setTimeout> | undefined;

/** Fires on each whole-second boundary so every subscriber sees the same tick. */
function scheduleTick() {
  timeoutId = setTimeout(
    () => {
      listeners.forEach((listener) => listener());
      scheduleTick();
    },
    TICK_MS - (Date.now() % TICK_MS)
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) scheduleTick();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };
}

/** Floored to the second so repeated reads within a tick return the same snapshot. */
const getSnapshot = () => Math.floor(Date.now() / TICK_MS) * TICK_MS;

const getServerSnapshot = () => null;

/**
 * Current time in ms, floored to the second and updated every second.
 * `null` during SSR and hydration so server and client markup match.
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
