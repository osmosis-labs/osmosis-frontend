import { Dec, PricePretty } from "@osmosis-labs/unit";

import { DEFAULT_VS_CURRENCY } from "../../../queries/complex/assets/config";

/**
 * Converts a Dec or numeric value to a PricePretty instance
 * @param value The value to convert
 * @returns A PricePretty instance representing the passed value
 */
export function convertToPricePretty(
  value:
    | Dec
    | {
        toDec(): Dec;
      }
    | number
    | string
    | bigint
) {
  return new PricePretty(DEFAULT_VS_CURRENCY, value);
}
