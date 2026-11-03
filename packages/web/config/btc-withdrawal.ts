import { getAllBtcMinimalDenom } from "@osmosis-labs/utils";

/** allBTC (mainnet). Matched by denom, never by symbol. */
export const ALL_BTC_MINIMAL_DENOM = (
  getAllBtcMinimalDenom({ env: "mainnet" }) ?? ""
).toLowerCase();

/** Default allBTC withdrawal destination: WBTC on Ethereum. */
export const ALL_BTC_DEFAULT_WITHDRAWAL = {
  chainId: 1,
  address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
};

/** Whether the withdrawn Osmosis asset is allBTC itself (not a variant). */
export const isAllBtcDenom = (coinMinimalDenom: string | undefined) =>
  ALL_BTC_MINIMAL_DENOM !== "" &&
  coinMinimalDenom?.toLowerCase() === ALL_BTC_MINIMAL_DENOM;
