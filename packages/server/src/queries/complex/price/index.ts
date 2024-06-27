import { Dec, PricePretty } from "@keplr-wallet/unit";

import { DEFAULT_VS_CURRENCY } from "../../../queries/complex/assets/config";

/**
 * Converts a Dec or BigNumber to a PricePretty instance
 * @param value The value to convert
 * @returns A PricePretty instance representing the passed value
 */
export function convertToPricePretty(
  value:
    | Dec
    | {
        toDec(): Dec;
      }
    | bigInt.BigNumber
) {
  return new PricePretty(DEFAULT_VS_CURRENCY, value);
}
