import { Dec } from "@osmosis-labs/unit";
import { PricePretty } from "@osmosis-labs/unit";
import {
  DEFAULT_VS_CURRENCY,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "@osmosis-labs/utils";

/**
 * Formats a fiat value with compact notation for values over 1 million
 * For values >= 1M, returns formats like $1M, $1.5M, $1B
 * For values < 1M, uses the standard formatPretty function
 *
 * @param value The PricePretty value to format
 * @returns Formatted string representation of the value
 */
export function formatFiatValueCompact(
  value: PricePretty | null | undefined
): string {
  if (!value) {
    return formatPretty(new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)));
  }

  const decValue = value.toDec();

  // For values >= 1B
  if (decValue.gte(new Dec(1_000_000_000))) {
    const billions = decValue.quo(new Dec(1_000_000_000));
    return `$${formatCompactDecimal(billions)}B`;
  }

  // For values >= 1M
  if (decValue.gte(new Dec(1_000_000))) {
    const millions = decValue.quo(new Dec(1_000_000));
    return `$${formatCompactDecimal(millions)}M`;
  }

  // For values < 1M, use formatPretty with extended format options
  return formatPretty(value, {
    ...getPriceExtendedFormatOptions(decValue),
  });
}

/**
 * Formats a decimal for compact display with up to 2 decimal places
 */
function formatCompactDecimal(dec: Dec): string {
  const numValue = parseFloat(dec.toString());

  // If it's a whole number, don't show decimal places
  if (Number.isInteger(numValue)) {
    return numValue.toString();
  }

  // Otherwise show up to 2 decimal places without trailing zeros
  return numValue.toFixed(2).replace(/\.?0+$/, "");
}
