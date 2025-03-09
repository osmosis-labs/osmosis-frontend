import { Dec } from "@osmosis-labs/unit";

const regexOverspendError =
  /Spend limit error: Overspend: (\d+) has been spent but limit is (\d+)/;

/**
 * Extracts the overspend parameters from an error message
 * @param message The error message to parse
 * @returns An object containing the wouldSpendTotal and limit values, or undefined if the message doesn't match
 */
export function getParametersFromOverspendErrorMessage(
  message: string | undefined
): { wouldSpendTotal: Dec; limit: Dec } | undefined {
  if (!message) return;

  const match = message.match(regexOverspendError);
  if (!match) return;

  const [, wouldSpendTotal, limit] = match;

  if (!wouldSpendTotal || !limit) return;

  try {
    // Validate that extracted values are valid numbers
    if (isNaN(Number(wouldSpendTotal)) || isNaN(Number(limit))) {
      return;
    }

    return {
      wouldSpendTotal: new Dec(wouldSpendTotal, 6),
      limit: new Dec(limit, 6),
    };
  } catch (error) {
    console.error("Failed to parse overspend error parameters:", error);
    return;
  }
}

/**
 * Checks if a message is an overspend error message
 * @param message The error message to check
 * @returns True if the message is an overspend error message, false otherwise
 */
export function isOverspendErrorMessage({
  message,
}: {
  message: string;
}): boolean {
  return regexOverspendError.test(message);
}
