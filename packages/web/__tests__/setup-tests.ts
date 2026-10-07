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

// The teardown guard must fire well before Jest's hook timeout. Otherwise Jest
// abandons the hook with a generic error and the hook's `finally` runs during
// the next test, resetting the handlers that test just installed.
const TEARDOWN_SETTLE_MS = 5_000;
const TEARDOWN_HOOK_TIMEOUT_MS = 10_000;

const pendingWork = new Set<Promise<unknown>>();
const failures: unknown[] = [];
const cleanups = new Set<() => void | Promise<void>>();
// Incremented per teardown so work abandoned by a timed-out teardown cannot
// report its late failure against a later, unrelated test.
let teardownGeneration = 0;

export function registerTestCleanup(cleanup: () => void | Promise<void>) {
  cleanups.add(cleanup);
}

function mockTrackRegistryWork<T>(work: Promise<T>): Promise<T> {
  const generation = teardownGeneration;
  pendingWork.add(work);
  work.then(
    () => pendingWork.delete(work),
    (error) => {
      pendingWork.delete(work);
      if (generation === teardownGeneration) failures.push(error);
    }
  );
  return work;
}

async function runCleanupsAndSettle(errors: unknown[]) {
  // Run every cleanup even if one fails, so pending work is still settled.
  for (const cleanup of cleanups) {
    try {
      await cleanup();
    } catch (error) {
      errors.push(error);
    }
  }
  while (pendingWork.size) {
    await Promise.allSettled([...pendingWork]);
  }
}

async function cleanupTestResources() {
  const errors: unknown[] = [];
  let timeout: ReturnType<typeof setNodeTimeout> | undefined;
  try {
    await Promise.race([
      runCleanupsAndSettle(errors),
      new Promise<never>((_, reject) => {
        // Bound teardown even when the test uses fake timers.
        timeout = setNodeTimeout(
          () =>
            reject(
              new Error(
                `Test teardown did not settle within ${TEARDOWN_SETTLE_MS}ms`
              )
            ),
          TEARDOWN_SETTLE_MS
        );
      }),
    ]);
  } catch (error) {
    errors.push(error);
    // This test already fails for the hung work; stop waiting on it.
    pendingWork.clear();
  } finally {
    clearNodeTimeout(timeout);
    errors.push(...failures.splice(0));
    teardownGeneration++;
  }
  if (errors.length) {
    throw new AggregateError(errors, "Test teardown failed");
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
}, TEARDOWN_HOOK_TIMEOUT_MS);
afterAll(async () => {
  try {
    await cleanupTestResources();
  } finally {
    server.close();
  }
}, TEARDOWN_HOOK_TIMEOUT_MS);
