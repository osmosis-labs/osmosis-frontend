/**
 * Route-checking of family-merge withdraw destinations. Skip lists every
 * asset-list counterparty of every variant in an asset's family, but has no
 * cheap routability check, so each such candidate is probed with a real
 * `/route` request and dropped only when Skip says definitively that it
 * cannot route there.
 */

/** A family-merge counterparty to route-check. `denom` is Skip's denom. */
export interface RouteProbeCandidate {
  key: string;
  chainId: string;
  denom: string;
  decimals: number;
}

/** USD value of the route-check request. */
export const ROUTE_PROBE_USD = 500;

/** Parallel `/route` requests per supported-assets call. */
const ROUTE_PROBE_CONCURRENCY = 5;

/** Per-request cap for a probe or the price lookup; on expiry the answer is unknown. */
export const ROUTE_PROBE_REQUEST_TIMEOUT_MS = 3_000;

/** Cap for the whole probe phase; candidates unresolved at the deadline are kept. */
const ROUTE_PROBE_DEADLINE_MS = 5_000;

/** Rejects when `promise` has not settled within `ms` (the answer is unknown). */
export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("probe timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

/** Messages meaning Skip cannot route (or not usefully) to the destination. */
const DEFINITIVE_NO_ROUTE_MESSAGES = [
  "no routes found",
  "no single-tx routes found",
  "cannot transfer across cctp after route demands swap",
  // Thin liquidity: the swap legs would lose far more than the USD value
  // tolerance allows at a $500 trade.
  "Difference in USD value of route input and output is too large",
];

/**
 * Whether an error from Skip's `/route` definitively means "no route". Any
 * other failure (timeout, 5xx, rate limit, unrecognised message) says nothing
 * about the destination and must not hide it.
 */
export const isDefinitiveNoRouteError = (error: unknown) =>
  error instanceof Error &&
  DEFINITIVE_NO_ROUTE_MESSAGES.some((message) =>
    error.message.includes(message)
  );

/**
 * Returns the keys of candidates to drop. `isRoutable` resolves true/false
 * for a definitive answer and rejects when the answer is unknown; unknown
 * candidates are kept (fail-open), so a provider outage never hides exits.
 */
export async function findUnroutableCandidates<T extends { key: string }>(
  candidates: T[],
  isRoutable: (candidate: T) => Promise<boolean>
): Promise<string[]> {
  const dead: string[] = [];
  let next = 0;
  let expired = false;
  const worker = async () => {
    while (!expired && next < candidates.length) {
      const candidate = candidates[next++];
      try {
        if (!(await isRoutable(candidate))) dead.push(candidate.key);
      } catch {
        // unknown answer: keep the candidate
      }
    }
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([
    Promise.all(
      Array.from(
        { length: Math.min(ROUTE_PROBE_CONCURRENCY, candidates.length) },
        worker
      )
    ),
    new Promise<void>((resolve) => {
      timer = setTimeout(resolve, ROUTE_PROBE_DEADLINE_MS);
    }),
  ]);
  clearTimeout(timer);
  expired = true;
  // Candidates unresolved at the deadline are kept.
  return dead;
}
