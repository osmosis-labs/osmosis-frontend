import { apiClient, ClientOptions } from "./api-client";

export interface HedgeOptions {
  /** Per-attempt timeout in milliseconds. Default: 3000ms */
  timeout?: number;
  /** Delay before firing the next endpoint while earlier ones are pending. Default: 1000ms */
  hedgeDelay?: number;
  /** Wall-clock budget across all endpoints. Default: 8000ms */
  maxTotalTime?: number;
}

/**
 * Races `urls` as hedged requests: each fires `hedgeDelay` after the previous,
 * the first success wins and every other in-flight attempt is aborted. A dead
 * endpoint that accepts connections but never answers costs one `hedgeDelay`
 * instead of a full timeout.
 *
 * `request` performs one attempt and must honour the signal it is given.
 */
export async function hedgedRequest<T>(
  urls: string[],
  request: (url: string, signal: AbortSignal) => Promise<T>,
  {
    timeout = 3000,
    hedgeDelay = 1000,
    maxTotalTime = 8000,
    signal: externalSignal,
    name = "endpoints",
    target,
  }: HedgeOptions & {
    signal?: AbortSignal;
    /** Used in the error message: `All <n> <name> failed for <target>`. */
    name?: string;
    target?: string;
  } = {}
): Promise<{ data: T; url: string }> {
  if (externalSignal?.aborted) {
    throw new Error("Operation was aborted");
  }

  const raceController = new AbortController();
  const timers: ReturnType<typeof setTimeout>[] = [];
  const startTime = Date.now();

  externalSignal?.addEventListener("abort", () => raceController.abort(), {
    once: true,
  });

  // Only schedule endpoints whose stagger delay fits within the budget.
  const schedulable = urls.filter((_, i) => i * hedgeDelay < maxTotalTime);

  const attempts = schedulable.map(
    (url, i) =>
      new Promise<{ data: T; url: string }>((resolve, reject) => {
        const timer = setTimeout(async () => {
          if (raceController.signal.aborted) {
            return reject(new Error("Aborted"));
          }

          const remaining = maxTotalTime - (Date.now() - startTime);
          if (remaining <= 0) {
            return reject(new Error("Time budget exceeded"));
          }

          // Aborted by its own timeout, or by the race when another endpoint
          // wins or the budget runs out.
          const attemptController = new AbortController();
          const onRaceAbort = () => attemptController.abort();
          raceController.signal.addEventListener("abort", onRaceAbort, {
            once: true,
          });
          const timeoutId = setTimeout(
            () => attemptController.abort(),
            Math.min(timeout, remaining)
          );

          try {
            resolve({
              data: await request(url, attemptController.signal),
              url,
            });
          } catch (error) {
            reject(error);
          } finally {
            clearTimeout(timeoutId);
            raceController.signal.removeEventListener("abort", onRaceAbort);
          }
        }, i * hedgeDelay);

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

  timers.push(setTimeout(() => raceController.abort(), maxTotalTime));

  try {
    return await promiseAny(attempts);
  } catch (e: any) {
    const errors: Error[] = e?.errors ?? [];
    const lastError = errors[errors.length - 1];
    throw new Error(
      `All ${schedulable.length} ${name} failed` +
        (target ? ` for ${target}` : "") +
        ` (budget: ${maxTotalTime}ms, elapsed: ${Date.now() - startTime}ms).` +
        ` Last error: ${lastError?.message || "Unknown error"}`
    );
  } finally {
    raceController.abort();
    timers.forEach((t) => clearTimeout(t));
  }
}

/** HTTP client that fetches a path from several base URLs with
 *  `hedgedRequest`, trying them in the given order. */
export class MultiEndpointClient {
  private readonly endpoints: string[];

  constructor(
    endpoints: { address: string }[],
    private readonly options: HedgeOptions = {}
  ) {
    if (endpoints.length === 0) {
      throw new Error("At least one endpoint must be provided");
    }
    this.endpoints = endpoints.map(({ address }) => address);
  }

  async fetch<T>(
    path: string,
    options?: ClientOptions & { signal?: AbortSignal }
  ): Promise<T> {
    const { data } = await this.fetchWithEndpoint<T>(path, options);
    return data;
  }

  /** Like `fetch`, but also returns the base URL of the endpoint that answered. */
  async fetchWithEndpoint<T>(
    path: string,
    options?: ClientOptions & { signal?: AbortSignal }
  ): Promise<{ data: T; endpointAddress: string }> {
    const { signal, ...clientOptions } = options ?? {};
    const urls = this.endpoints.map((address) => `${address}${path}`);

    const { data, url } = await hedgedRequest<T>(
      urls,
      (url, signal) => apiClient<T>(url, { ...clientOptions, signal }),
      { ...this.options, signal }
    );

    return { data, endpointAddress: this.endpoints[urls.indexOf(url)] };
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
