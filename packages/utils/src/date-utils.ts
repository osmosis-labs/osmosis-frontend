/**
 * Converts a Unix timestamp in seconds to nanoseconds.
 * This is achieved by appending nine zeros to the input value, effectively multiplying it by 1 billion.
 * @param unixSeconds The Unix timestamp in seconds.
 * @returns The Unix timestamp in nanoseconds as a string.
 */
export function unixSecondsToNanoSeconds(unixSeconds: number): string {
  return `${unixSeconds}000000000`;
}
