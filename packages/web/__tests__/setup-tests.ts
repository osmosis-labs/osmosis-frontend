/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import "~/__mocks__/intersection-observer";

import { cleanup } from "@testing-library/react";

import { server } from "~/__tests__/msw";
import { cleanupTestResources } from "~/__tests__/test-lifecycle";

// Cosmos Kit starts fetchUrls in WalletRepo's constructor without exposing or
// cancelling the promise on unmount. Exercise the real fetcher, but own its work
// in Jest so no request or state update can outlive a test or server.close().
jest.mock("@chain-registry/client", () => {
  const actual = jest.requireActual("@chain-registry/client");
  const { trackTestWork } = jest.requireActual("~/__tests__/test-lifecycle");
  return {
    ...actual,
    ChainRegistryFetcher: class extends actual.ChainRegistryFetcher {
      fetchUrls() {
        return trackTestWork(super.fetchUrls());
      }
    },
  };
});

// Point the app's `api` hooks at the tRPC context provided by test-utils.
jest.mock("~/utils/trpc", () => ({
  ...jest.requireActual("~/utils/trpc"),
  api: jest.requireActual("~/__tests__/trpc-react").trpcReact,
}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(async () => {
  // Unmount observers first, then cancel queries and settle registry loads while
  // this test's handlers are still installed. RTL's own cleanup is idempotent.
  cleanup();
  try {
    await cleanupTestResources();
  } finally {
    server.resetHandlers();
  }
});
afterAll(async () => {
  try {
    await cleanupTestResources();
  } finally {
    server.close();
  }
});
