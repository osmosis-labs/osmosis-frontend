/** Resolves a promise once desired results have been polled. */
export function poll<TData>({
  fn,
  validate,
  interval = 1_500,
  maxAttempts = 50,
}: {
  /** Polling function. */
  fn: () => Promise<TData>;
  /** Determines if result meets end condition. */
  validate: (data: TData) => boolean;
  /** Gap in MS. */
  interval?: number;
  /** Max number of attempts before finished polling. Leave `undefined` for infinite. */
  maxAttempts?: number;
}) {
  let attempts = 0;

  const executePoll = async (
    resolve: (data: TData) => void,
    reject: (error: Error) => void
  ) => {
    const result = await fn();
    attempts++;

    if (validate(result)) {
      return resolve(result);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error(`Exceeded max attempts: ${maxAttempts}`));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
}
