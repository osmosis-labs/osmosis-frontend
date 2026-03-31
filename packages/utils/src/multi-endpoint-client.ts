import { apiClient, ClientOptions } from "./api-client";

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
 * Endpoints are tried in priority order (higher first), then original order.
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

    this.endpoints = endpoints
      .map((endpoint, index) => ({ endpoint, index }))
      .sort((a, b) => {
        const diff = (b.endpoint.priority ?? 0) - (a.endpoint.priority ?? 0);
        return diff !== 0 ? diff : a.index - b.index;
      })
      .map(({ endpoint }) => endpoint);

    this.timeout = options.timeout ?? 3000;
    this.hedgeDelay = options.hedgeDelay ?? 1000;
    this.maxTotalTime = options.maxTotalTime ?? 8000;

    if (this.timeout <= 0) {
      throw new Error("timeout must be positive");
    }
    if (this.hedgeDelay <= 0) {
      throw new Error("hedgeDelay must be positive");
    }
    if (this.maxTotalTime <= 0) {
      throw new Error("maxTotalTime must be positive");
    }
  }

  /**
   * Fetch data using hedged requests across all configured endpoints.
   * Returns only the response data.
   */
  async fetch<T>(
    path: string,
    options?: ClientOptions & { signal?: AbortSignal }
  ): Promise<T> {
    const { data } = await this.fetchWithEndpoint<T>(path, options);
    return data;
  }

  /**
   * Fetch data using hedged requests and also return which endpoint responded.
   *
   * Fires endpoint requests staggered by `hedgeDelay`. The first success
   * wins via `Promise.any`; remaining in-flight requests are aborted.
   * An optional external `AbortSignal` cancels everything immediately.
   */
  async fetchWithEndpoint<T>(
    path: string,
    options?: ClientOptions & { signal?: AbortSignal }
  ): Promise<{ data: T; endpointAddress: string }> {
    const { signal: externalSignal, ...restOptions } = options ?? {};

    if (externalSignal?.aborted) {
      throw new Error("Operation was aborted");
    }

    const raceController = new AbortController();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const startTime = Date.now();

    if (externalSignal) {
      externalSignal.addEventListener("abort", () => raceController.abort(), {
        once: true,
      });
    }

    // Only schedule endpoints whose stagger delay fits within the budget
    const schedulable = this.endpoints.filter(
      (_, i) => i * this.hedgeDelay < this.maxTotalTime
    );

    const attempts = schedulable.map(
      (endpoint, i) =>
        new Promise<{ data: T; endpointAddress: string }>((resolve, reject) => {
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

            // Per-attempt controller: aborted either by per-attempt timeout or
            // by raceController (when another endpoint wins or budget expires).
            const attemptController = new AbortController();
            const onRaceAbort = () => attemptController.abort();
            raceController.signal.addEventListener("abort", onRaceAbort, {
              once: true,
            });

            const effectiveTimeout = Math.min(this.timeout, remaining);
            const timeoutId = setTimeout(
              () => attemptController.abort(),
              effectiveTimeout
            );

            try {
              const url = `${endpoint.address}${path}`;
              const data = await apiClient<T>(url, {
                ...restOptions,
                signal: attemptController.signal,
              });
              clearTimeout(timeoutId);
              raceController.signal.removeEventListener("abort", onRaceAbort);
              resolve({ data, endpointAddress: endpoint.address });
            } catch (error) {
              clearTimeout(timeoutId);
              raceController.signal.removeEventListener("abort", onRaceAbort);
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
