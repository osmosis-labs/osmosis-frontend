export class AsyncTimeoutError extends Error {
  code?: "ETIMEDOUT";
  constructor(string?: string) {
    super(string);
  }
}

export default function timeout<Fn extends (...args: any) => Promise<any>>(
  asyncFn: Fn,
  milliseconds: number
): (...args: Parameters<Fn>) => Promise<ReturnType<Fn>> {
  return async (...args: Parameters<Fn>) =>
    new Promise<ReturnType<Fn>>(async (resolve, reject) => {
      let timedOut = false;
      let timer;

      // setup timer and call original function
      timer = setTimeout(() => {
        let name = asyncFn.name || "anonymous";
        let error = new AsyncTimeoutError(
          'Callback function "' + name + '" timed out.'
        );
        error.code = "ETIMEDOUT";
        timedOut = true;
        reject(error);
      }, milliseconds);

      try {
        resolve(await asyncFn(...(args as any[])));
      } catch (e) {
        reject(e);
      } finally {
        if (!timedOut) {
          clearTimeout(timer);
        }
      }
    });
}
