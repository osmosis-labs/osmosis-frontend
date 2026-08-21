import { apiClient } from "@osmosis-labs/utils";

import { SIDECAR_BASE_URL } from "../../env";

/**
 * Current quote denom for prices returned by sidecar. Currently Alloyed USDC.
 * Must match SQS's `quoteDenom`, so this and the sidecar constant have to
 * deploy in the same window.
 */
export const QUOTE_COIN_MINIMAL_DENOM =
  "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";

export type PriceMap = {
  [baseCoinMinimalDenom: string]: {
    [QUOTE_COIN_MINIMAL_DENOM]: string;
  };
};

export async function queryPrices(coinMinimalDenoms: string[]) {
  const url = new URL("/tokens/prices", SIDECAR_BASE_URL);

  url.searchParams.append("base", coinMinimalDenoms.join(","));

  return await apiClient<PriceMap>(url.toString());
}
