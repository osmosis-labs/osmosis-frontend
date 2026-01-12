/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import "~/__mocks__/intersection-observer";

import { server } from "~/__tests__/msw";
import { clearStoreRegistry, resetAllStores } from "~/__tests__/zustand-utils";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  // Reset Zustand stores to initial state between tests
  resetAllStores();
});
afterAll(() => {
  server.close();
  // Clear the store registry
  clearStoreRegistry();
});
