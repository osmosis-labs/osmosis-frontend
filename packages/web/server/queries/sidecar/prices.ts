import { apiClient } from "@osmosis-labs/utils";

import { SIDECAR_BASE_URL } from ".";

/** Current quote denom for prices returned by sidecar. Currently Noble USDC. */
export const QUOTE_COIN_MINIMAL_DENOM =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

export type PriceMap = {
  [baseCoinMinimalDenom: string]: {
    [QUOTE_COIN_MINIMAL_DENOM]: string;
  };
};

export async function queryPrices(coinMinimalDenoms: string[]) {
  const url = new URL("/tokens/prices", SIDECAR_BASE_URL);

  for (const coinMinimalDenom of coinMinimalDenoms) {
    url.searchParams.append("base", coinMinimalDenom);
  }

  return await apiClient<PriceMap>(url.toString());
}
