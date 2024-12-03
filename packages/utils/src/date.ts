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

/**
 * Converts a Unix timestamp in seconds to a local time Unix timestamp in seconds.
 * This is achieved by creating a Date object from the input value, and then using Date.UTC to get the local time.
 * @param originalTime The original Unix timestamp in seconds.
 * @returns The local time Unix timestamp in seconds.
 */
export const timeToLocal = (originalTime: number): number => {
  const d = new Date(originalTime * 1000);
  return (
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds()
    ) / 1000
  );
};
