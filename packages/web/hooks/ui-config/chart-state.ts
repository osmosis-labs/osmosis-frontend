import { useEffect, useState, useSyncExternalStore } from "react";

export const INITIAL_ZOOM = 1.05;
export const ZOOM_STEP = 0.05;

export const zoomedIn = (zoom: number) => Math.max(1, zoom - ZOOM_STEP);
export const zoomedOut = (zoom: number) => zoom + ZOOM_STEP;

/**
 * Minimal external store. Pointer-hover values change on every mouse move;
 * keeping them out of the hook's React state means only the components that
 * subscribe (the chart header) re-render, not the whole page that owns the
 * chart config.
 */
export interface ValueStore<T> {
  get: () => T;
  /** Returns without notifying when `isEqual(prev, next)`. */
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createValueStore<T>(
  initial: T,
  isEqual: (a: T, b: T) => boolean = Object.is
): ValueStore<T> {
  let value = initial;
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    set: (next) => {
      if (isEqual(value, next)) return;
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useValueStore<T>(store: ValueStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/**
 * Current time, re-sampled after commit whenever `trigger` changes. For
 * values derived from "now" that should refresh with the data they describe
 * rather than on a timer.
 */
export function useNowOnChange(trigger: string): number {
  const [store] = useState(() => createValueStore(Date.now()));
  useEffect(() => {
    store.set(Date.now());
  }, [store, trigger]);
  return useValueStore(store);
}

/**
 * `fresh` when defined, otherwise the last defined value seen for the same
 * `key`, otherwise `empty`. The last value is remembered in an external store
 * from an effect, so nothing is written during render.
 */
export function useRetainedValue<T>(
  key: string,
  fresh: T | undefined,
  empty: T
): T {
  const [store] = useState(() =>
    createValueStore<{ key: string; value: T } | null>(null)
  );
  useEffect(() => {
    if (fresh !== undefined) store.set({ key, value: fresh });
  }, [store, key, fresh]);
  const retained = useValueStore(store);

  if (fresh !== undefined) return fresh;
  return retained?.key === key ? retained.value : empty;
}
