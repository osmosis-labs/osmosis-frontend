import { Chain } from "@osmosis-labs/types";
import { apiClient, ClientOptions, runIfFn } from "@osmosis-labs/utils";

/**
 * ES6-compatible `Promise.any`: resolves with the first fulfilled promise.
 * Rejects with `{ errors }` if every promise rejects.
 */
function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const errors: unknown[] = [];
    let rejected = 0;

    if (promises.length === 0) {
      return reject(
        Object.assign(new Error("All promises were rejected"), { errors })
      );
    }

    promises.forEach((p, i) => {
      p.then(resolve).catch((err) => {
        errors[i] = err;
        rejected++;
        if (rejected === promises.length) {
          reject(
            Object.assign(new Error("All promises were rejected"), { errors })
          );
        }
      });
    });
  });
}

/**
 * Create a timeout AbortSignal, preferring the native `AbortSignal.timeout`
 * when available and falling back to `AbortController + setTimeout` for
 * older Node versions.
 */
function createTimeoutSignal(
  ms: number,
  parent?: AbortController
): { signal: AbortSignal; cleanup: () => void } {
  if (typeof AbortSignal.timeout === "function") {
    const signal = AbortSignal.timeout(ms);
    // Wire into parent so the parent can abort the native signal's consumer
    if (parent) {
      signal.addEventListener("abort", () => parent.abort(), { once: true });
    }
    return { signal, cleanup: () => {} };
  }

  // Fallback for older runtimes
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  if (parent) {
    parent.signal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }
  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

/** Creates a node query function that can be used to query any
 *  chain in the given chain list.
 *
 *  If given a `chainId` it will try to query that chain's endpoint
 *  or will throw if not found. If not given a `chainId`, it will
 *  query the first chain in the list as though it were the preferred chain.
 *
 *  Can be provided additional options for sending a fetch request
 *  that isn't a simple GET request. If the options include a body,
 *  the request will be sent to the RPC endpoint since it's
 *  assumed the LCD rest endpoint only accepts GET requests.
 *
 *  ENDPOINT FALLBACK (hedged requests):
 *  REST endpoints come from the chain's asset list. Requests are fired in a
 *  staggered pattern (`hedgeDelay` apart). The first successful response wins
 *  via a `Promise.any`-style race; all other in-flight requests are aborted.
 *  Endpoints are tried in their original order from the chain registry.
 */
export const createNodeQuery =
  <Result, PathParameters extends Record<any, any> | unknown = unknown>({
    path,
    options,
    timeout = 3000,
    hedgeDelay = 1000,
    maxTotalTime = 8000,
  }: {
    path: string | ((params: PathParameters) => string);
    /** Additional query options such as
     *  headers, body, etc. If a body is included
     *  the query will be redirected to the RPC endpoint
     *  due to the node-query invariant of rest services
     *  only accepting GET requests. */
    options?: (params: PathParameters) => ClientOptions;
    /** Per-attempt timeout in milliseconds. Default: 3000ms */
    timeout?: number;
    /** Stagger delay between hedged endpoint requests in ms. Default: 1000ms */
    hedgeDelay?: number;
    /** Maximum total wall-clock time across all endpoints. Default: 8000ms */
    maxTotalTime?: number;
  }) =>
  async (
    ...params: PathParameters extends Record<any, any>
      ? [PathParameters & { chainId?: string; chainList: Chain[] }]
      : [{ chainId?: string; chainList: Chain[] }]
  ): Promise<Result> => {
    const chainList = params[0]?.chainList;

    if (!chainList) throw new Error("Missing chainList");

    const chainId =
      (params as [PathParameters & { chainId?: string }])[0]?.chainId ??
      chainList[0].chain_id;

    const chain = chainList.find((chain) => chain.chain_id === chainId);

    if (!chain) throw new Error(`Chain ${chainId} not found`);

    const restEndpoints = chain.apis.rest;

    if (!restEndpoints || restEndpoints.length === 0) {
      throw new Error(`No REST endpoints available for chain ${chainId}`);
    }

    const opts = options?.(...(params as [PathParameters]));
    const pathStr = runIfFn(
      path,
      ...((params as [PathParameters & { chainId?: string }]) ?? [])
    );

    const raceController = new AbortController();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const cleanups: (() => void)[] = [];
    const startTime = Date.now();

    const schedulable = restEndpoints.filter(
      (_, i) => i * hedgeDelay < maxTotalTime
    );

    const attempts = schedulable.map(
      (endpoint, i) =>
        new Promise<Result>((resolve, reject) => {
          const delay = i * hedgeDelay;

          const timer = setTimeout(async () => {
            if (raceController.signal.aborted) {
              return reject(new Error("Aborted"));
            }

            const elapsed = Date.now() - startTime;
            const remaining = maxTotalTime - elapsed;
            if (remaining <= 0) {
              return reject(new Error("Time budget exceeded"));
            }

            const effectiveTimeout = Math.min(timeout, remaining);
            const { signal, cleanup } = createTimeoutSignal(
              effectiveTimeout,
              raceController
            );
            cleanups.push(cleanup);

            try {
              const url = new URL(pathStr, endpoint.address);
              const result = await apiClient<Result>(url.toString(), {
                ...opts,
                signal,
              });
              cleanup();
              resolve(result);
            } catch (error) {
              cleanup();
              reject(error);
            }
          }, delay);

          timers.push(timer);

          raceController.signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timer);
              reject(new Error("Aborted"));
            },
            { once: true }
          );
        })
    );

    const globalTimer = setTimeout(() => raceController.abort(), maxTotalTime);
    timers.push(globalTimer);

    try {
      const result = await promiseAny(attempts);
      raceController.abort();
      return result;
    } catch (e: any) {
      raceController.abort();
      const errors: Error[] = e?.errors ?? [];
      const lastError = errors[errors.length - 1];

      console.warn(
        `[createNodeQuery] All ${schedulable.length} REST endpoints exhausted for chain ${chainId}.`
      );

      throw new Error(
        `All ${schedulable.length} REST endpoints failed for chain ${chainId}` +
          ` (budget: ${maxTotalTime}ms, elapsed: ${
            Date.now() - startTime
          }ms).` +
          ` Last error: ${lastError?.message || "Unknown error"}`
      );
    } finally {
      timers.forEach((t) => clearTimeout(t));
      cleanups.forEach((fn) => fn());
    }
  };
