/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import "~/__mocks__/intersection-observer";

import {
  clearTimeout as clearNodeTimeout,
  setTimeout as setNodeTimeout,
} from "node:timers";

import { cleanup } from "@testing-library/react";

import { server } from "~/__tests__/msw";

const pendingWork = new Set<Promise<unknown>>();
const failures: unknown[] = [];
const cleanups = new Set<() => void | Promise<void>>();

export function registerTestCleanup(cleanup: () => void | Promise<void>) {
  cleanups.add(cleanup);
}

function mockTrackRegistryWork<T>(work: Promise<T>): Promise<T> {
  pendingWork.add(work);
  work.then(
    () => pendingWork.delete(work),
    (error) => {
      pendingWork.delete(work);
      failures.push(error);
    }
  );
  return work;
}

async function cleanupTestResources() {
  for (const cleanup of cleanups) await cleanup();
  let timeout: ReturnType<typeof setNodeTimeout> | undefined;
  try {
    await Promise.race([
      (async () => {
        while (pendingWork.size) {
          await Promise.allSettled([...pendingWork]);
        }
      })(),
      new Promise<never>((_, reject) => {
        // Bound teardown even when the test uses fake timers.
        timeout = setNodeTimeout(
          () => reject(new Error("Test async work did not settle within 5s")),
          5_000
        );
      }),
    ]);
    if (failures.length) {
      throw new AggregateError(failures.splice(0), "Test async work failed");
    }
  } finally {
    clearNodeTimeout(timeout);
  }
}

// Cosmos Kit starts fetchUrls in WalletRepo's constructor without exposing or
// cancelling the promise on unmount. Exercise the real fetcher, but own its work
// in Jest so no request or state update can outlive a test or server.close().
jest.mock("@chain-registry/client", () => {
  const actual = jest.requireActual("@chain-registry/client");
  return {
    ...actual,
    ChainRegistryFetcher: class extends actual.ChainRegistryFetcher {
      fetchUrls() {
        return mockTrackRegistryWork(super.fetchUrls());
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
