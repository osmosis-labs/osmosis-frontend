/**
 * Converts a Unix timestamp in seconds to nanoseconds.
 * This is achieved by appending nine zeros to the input value, effectively multiplying it by 1 billion.
 * @param unixSeconds The Unix timestamp in seconds.
 * @returns The Unix timestamp in nanoseconds as a string.
 */
export function unixSecondsToNanoSeconds(unixSeconds: number): string {
  return `${unixSeconds}000000000`;
}

/**
 * Converts a Unix timestamp in nanoseconds to seconds.
 * This is achieved by dividing the input value by 1 billion.
 * @param unixNanoSeconds The Unix timestamp in nanoseconds as a string.
 * @returns The Unix timestamp in seconds as a number.
 */
export function unixNanoSecondsToSeconds(
  unixNanoSeconds: string | number
): number {
  return Number(unixNanoSeconds) / 1000000000;
}
