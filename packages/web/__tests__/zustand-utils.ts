/**
 * Helper to mock Zustand store state for testing
 * Provides a way to set initial state before rendering components
 */
export const mockStoreState = <T>(
  useStore: {
    getState: () => T;
    setState: (state: Partial<T>) => void;
  },
  partialState: Partial<T>
) => {
  const originalState = useStore.getState();
  useStore.setState(partialState);
  return () => useStore.setState(originalState);
};
