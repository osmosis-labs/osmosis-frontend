import { apiClient, ClientOptions } from "./api-client";
import {
  recordEndpointSuccess,
  sortEndpointsByHealth,
} from "./endpoint-health";

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
    if (parent) {
      signal.addEventListener("abort", () => parent.abort(), { once: true });
    }
    return { signal, cleanup: () => {} };
  }

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

/**
 * Configuration for a single endpoint.
 * Endpoints with higher priority are tried first.
 */
export interface EndpointConfig {
  address: string;
  priority?: number;
}

/**
 * Options for configuring multi-endpoint client behavior.
 */
export interface MultiEndpointOptions {
  /** Per-attempt timeout in milliseconds. Default: 3000ms */
  timeout?: number;
  /**
   * Delay in milliseconds before staggering the next endpoint request.
   * A hedged-request pattern: if the first endpoint hasn't responded within
   * this window, fire the next one in parallel. `Promise.any` picks the
   * first success. Default: 1000ms
   */
  hedgeDelay?: number;
  /**
   * Maximum total wall-clock time in milliseconds for a single fetch() call
   * across all endpoints combined. Default: 8000ms
   */
  maxTotalTime?: number;
}

/**
 * HTTP client that supports multiple endpoints with hedged requests.
 *
 * Instead of trying endpoints sequentially (which burns the full timeout on
 * every dead endpoint), this client staggers requests across endpoints using
 * `Promise.any`.  The first successful response wins; all other in-flight
 * requests are aborted immediately.
 *
 * Endpoints are tried in order of: recently-successful (from health cache),
 * then priority (higher first), then original order.
 */
export class MultiEndpointClient {
  private endpoints: EndpointConfig[];
  private readonly timeout: number;
  private readonly hedgeDelay: number;
  private readonly maxTotalTime: number;

  constructor(endpoints: EndpointConfig[], options: MultiEndpointOptions = {}) {
    if (!endpoints || endpoints.length === 0) {
      throw new Error("At least one endpoint must be provided");
    }

    this.endpoints = [...endpoints].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );

    this.timeout = options.timeout ?? 3000;
    this.hedgeDelay = options.hedgeDelay ?? 1000;
    this.maxTotalTime = options.maxTotalTime ?? 8000;
  }

  /**
   * Fetch data using hedged requests across all configured endpoints.
   *
   * Fires endpoint requests staggered by `hedgeDelay`. The first success
   * wins via `Promise.any`; remaining in-flight requests are aborted.
   * An optional external `AbortSignal` cancels everything immediately.
   */
  async fetch<T>(
    path: string,
    options?: ClientOptions & { signal?: AbortSignal }
  ): Promise<T> {
    const { signal: externalSignal, ...restOptions } = options ?? {};

    if (externalSignal?.aborted) {
      throw new Error("Operation was aborted");
    }

    const raceController = new AbortController();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const startTime = Date.now();

    // Wire external signal into our controller
    if (externalSignal) {
      externalSignal.addEventListener("abort", () => raceController.abort(), {
        once: true,
      });
    }

    // Sort endpoints: known-good first, then by original priority order
    const sorted = sortEndpointsByHealth(this.endpoints);

    // Only schedule endpoints whose stagger delay fits within the budget
    const schedulable = sorted.filter(
      (_, i) => i * this.hedgeDelay < this.maxTotalTime
    );

    const attempts = schedulable.map(
      (endpoint, i) =>
        new Promise<T>((resolve, reject) => {
          const delay = i * this.hedgeDelay;

          const timer = setTimeout(async () => {
            if (raceController.signal.aborted) {
              return reject(new Error("Aborted"));
            }

            const elapsed = Date.now() - startTime;
            const remaining = this.maxTotalTime - elapsed;
            if (remaining <= 0) {
              return reject(new Error("Time budget exceeded"));
            }

            const effectiveTimeout = Math.min(this.timeout, remaining);
            const { signal, cleanup } = createTimeoutSignal(
              effectiveTimeout,
              raceController
            );

            try {
              const url = `${endpoint.address}${path}`;
              const result = await apiClient<T>(url, {
                ...restOptions,
                signal,
              });
              cleanup();
              recordEndpointSuccess(endpoint.address);
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

    // Global timeout as a safety net
    const globalTimer = setTimeout(
      () => raceController.abort(),
      this.maxTotalTime
    );
    timers.push(globalTimer);

    try {
      const result = await promiseAny(attempts);
      raceController.abort();
      return result;
    } catch (e: any) {
      raceController.abort();
      const errors: Error[] = e?.errors ?? [];
      const lastError = errors[errors.length - 1];
      throw new Error(
        `All ${schedulable.length} endpoints failed` +
          ` (budget: ${this.maxTotalTime}ms, elapsed: ${
            Date.now() - startTime
          }ms).` +
          ` Last error: ${lastError?.message || "Unknown error"}`
      );
    } finally {
      timers.forEach((t) => clearTimeout(t));
    }
  }

  getCurrentEndpoint(): string {
    return this.endpoints[0].address;
  }

  getEndpoints(): EndpointConfig[] {
    return [...this.endpoints];
  }
}

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
 * Factory function to create a MultiEndpointClient instance.
 */
export function createMultiEndpointClient(
  endpoints: EndpointConfig[] | { address: string }[],
  options?: MultiEndpointOptions
): MultiEndpointClient {
  return new MultiEndpointClient(endpoints, options);
}
