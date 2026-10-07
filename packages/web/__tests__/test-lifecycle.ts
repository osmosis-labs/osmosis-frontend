import { clearTimeout, setTimeout } from "node:timers";

const pendingWork = new Set<Promise<unknown>>();
const failures: unknown[] = [];
const cleanups = new Set<() => void | Promise<void>>();

/** Observe the real promise, including failures caught by a dependency later. */
export function trackTestWork<T>(work: Promise<T>): Promise<T> {
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

export function registerTestCleanup(cleanup: () => void | Promise<void>) {
  cleanups.add(cleanup);
}

/** Keep handlers installed until the dependency's JSON parsing/state update finishes. */
export async function settleTestWork() {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      (async () => {
        while (pendingWork.size) {
          await Promise.allSettled([...pendingWork]);
        }
      })(),
      new Promise<never>((_, reject) => {
        // Real Node timers: teardown must also be bounded in fake-timer suites.
        timeout = setTimeout(
          () => reject(new Error("Test async work did not settle within 5s")),
          5_000
        );
      }),
    ]);
    if (failures.length) {
      throw new AggregateError(failures.splice(0), "Test async work failed");
    }
  } finally {
    clearTimeout(timeout);
  }
}

export async function cleanupTestResources() {
  for (const cleanup of cleanups) await cleanup();
  await settleTestWork();
}
