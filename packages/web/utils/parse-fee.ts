export type FeeDetails = { amount: string; currency: string } | null;

/**
 * Extracts a fee amount and currency from an error message using strict formatting rules.
 *
 * Rules:
 * - Accepts either plain digits (e.g., 1234 or 1234.56) or properly comma-grouped digits (e.g., 1,234 or 1,234.56)
 * - If a decimal point is present, it must be followed by at least one digit
 * - Currency must be at least two letters
 * - Examples:
 *   - "fee of 16.36 USD"
 *   - "costs $2.5 ETH"
 *   - "16.36 USD fee"
 */
export function extractFeeDetailsFromError(message: string): FeeDetails {
  const strictNumber = String.raw`(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?`;
  const patterns: RegExp[] = [
    // e.g., "fee of 16.36 USD", "costs $2.5 ETH", "cost $1,234.56 USD"
    new RegExp(
      String.raw`(?:fee|cost)s?\s+(?:of\s+)?(?:\$)?(${strictNumber})\s*([A-Z]{2,})`,
      "i"
    ),
    // e.g., "16.36 USD fee", "1,234.56 USD cost"
    new RegExp(String.raw`(${strictNumber})\s*([A-Z]{2,})\s+(?:fee|cost)`, "i"),
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const amountRaw = match[1].replace(/,/g, "");
      const currency = match[2].toUpperCase();
      return { amount: amountRaw, currency };
    }
  }

  return null;
}
