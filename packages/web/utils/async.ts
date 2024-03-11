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
export default function timeout<Fn extends (...args: any) => Promise<any>>(
  asyncFn: Fn,
  milliseconds: number,
  asyncFnName?: string
): (...args: Parameters<Fn>) => Promise<ReturnType<Fn>> {
  return (...args: Parameters<Fn>) =>
    new Promise<ReturnType<Fn>>(async (resolve, reject) => {
      let timedOut = false;
      let timer;

      // setup timer and call original function
      timer = setTimeout(() => {
        let name = asyncFnName || asyncFn.name || "anonymous";
        let error = new AsyncTimeoutError(
          'Callback function "' + name + '" timed out.'
        );
        error.code = "ETIMEDOUT";
        timedOut = true;
        reject(error);
      }, milliseconds);

      try {
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
