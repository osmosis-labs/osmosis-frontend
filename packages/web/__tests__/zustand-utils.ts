/* eslint-disable import/no-extraneous-dependencies */
import { act } from "@testing-library/react";
import type { StateCreator, StoreApi } from "zustand";

/**
 * Store registry for tracking Zustand stores during tests
 * Allows resetting all stores between tests
 */
const storeResetFns = new Set<() => void>();

/**
 * Creates a Zustand store with reset capability for testing
 * Wraps the standard create function to register reset functions
 */
export const createTestableStore = <T>(
  createState: StateCreator<T>
): ((set: StoreApi<T>["setState"], get: StoreApi<T>["getState"]) => T) => {
  return (set, get) => {
    const initialState = createState(set, get, {} as StoreApi<T>);
    storeResetFns.add(() => {
      set(initialState, true);
    });
    return initialState;
  };
};

/**
 * Resets all registered Zustand stores to their initial state
 * Call this in afterEach() to ensure clean state between tests
 */
export const resetAllStores = () => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn();
    });
  });
};

/**
 * Clears the store registry
 * Call this in afterAll() to clean up
 */
export const clearStoreRegistry = () => {
  storeResetFns.clear();
};

/**
 * Helper to mock Zustand store state for testing
 * Provides a way to set initial state before rendering components
 */
export const mockStoreState = <T>(
  useStore: { getState: () => T; setState: (state: Partial<T>) => void },
  partialState: Partial<T>
) => {
  const originalState = useStore.getState();
  useStore.setState(partialState);
  return () => useStore.setState(originalState);
};
