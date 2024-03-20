export class AsyncTimeoutError extends Error {
  code?: "ETIMEDOUT";
  constructor(string?: string) {
    super(string);
  }
}

/**
 * Wraps an async function and adds a timeout to it. If the timeout is reached,
 * the function reject with an AsyncTimeoutError.
 *
 * @param asyncFn - The async function to wrap.
 * @param milliseconds - The timeout in milliseconds.
 * @returns A wrapped async function.
 */
export function timeout<Fn extends (...args: any) => Promise<any>>(
  asyncFn: Fn,
  milliseconds: number,
  asyncFnName?: string
): (...args: Parameters<Fn>) => Promise<ReturnType<Fn>> {
  return (...args: Parameters<Fn>) =>
    new Promise<ReturnType<Fn>>(async (resolve, reject) => {
      let timedOut = false;
      // setup timer and call original function
      const timer = setTimeout(() => {
        const name = asyncFnName || asyncFn.name || "anonymous";
        const error = new AsyncTimeoutError(
          'Callback function "' + name + '" timed out.'
        );
        error.code = "ETIMEDOUT";
        timedOut = true;
        reject(error);
      }, milliseconds);

      try {
        // @ts-ignore
        resolve(await asyncFn(...args));
      } catch (e) {
        reject(e);
      } finally {
        if (!timedOut) {
          clearTimeout(timer);
        }
      }
    });
}
