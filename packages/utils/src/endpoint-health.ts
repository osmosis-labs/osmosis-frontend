const TTL_MS = 5 * 60 * 1000; // 5 minutes

const successes = new Map<string, number>();

/** Record that an endpoint responded successfully. */
export function recordEndpointSuccess(url: string): void {
  successes.set(url, Date.now());
}

/**
 * Sort a list of endpoint URLs so that recently-successful endpoints come
 * first, preserving the original order as a tiebreaker.
 *
 * This lets callers (e.g. TxTracer) start with a known-good endpoint
 * without needing explicit propagation through the call chain.
 */
export function sortEndpointsByHealth<T extends string | { address: string }>(
  endpoints: T[]
): T[] {
  const now = Date.now();
  return [...endpoints].sort((a, b) => {
    const urlA = typeof a === "string" ? a : a.address;
    const urlB = typeof b === "string" ? b : b.address;
    const tA = successes.get(urlA);
    const tB = successes.get(urlB);
    const healthyA = tA && now - tA < TTL_MS ? 1 : 0;
    const healthyB = tB && now - tB < TTL_MS ? 1 : 0;
    return healthyB - healthyA;
  });
}

/** Visible for testing only. */
export function _clearHealthCache(): void {
  successes.clear();
}
